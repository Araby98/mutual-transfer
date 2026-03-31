require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Op } = require('sequelize');
const { sequelize } = require('./models');
const authRoutes = require('./routes/auth');
const requestRoutes = require('./routes/requests');
const adminRoutes = require('./routes/admin');
const publicRoutes = require('./routes/public');
const bcrypt = require('bcrypt');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/public', publicRoutes);

const PORT = 5000;

// ─── CLEANUP: delete unverified accounts older than 24h ──────────────────────
async function cleanupUnverifiedUsers() {
  try {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
    const deleted = await sequelize.models.User.destroy({
      where: {
        isVerified: false,
        isAdmin: false,
        createdAt: { [Op.lt]: cutoff }
      }
    });
    if (deleted > 0) {
      console.log(`[cleanup] Deleted ${deleted} unverified account(s) older than 24h`);
    }
  } catch (err) {
    console.error('[cleanup] Error during unverified user cleanup:', err.message);
  }
}

sequelize.sync({ alter: true }).then(async () => {
  const adminExists = await sequelize.models.User.findOne({ where: { email: 'admin@tabadol.ma' } });
  if (!adminExists) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    await sequelize.models.User.create({
      firstName: 'Admin',
      lastName: 'System',
      phone: '0000000000',
      grade: 'administrateur',
      email: 'admin@tabadol.ma',
      password: hashedPassword,
      frmProvince: 'SystemHQ',
      isAdmin: true,
      isVerified: true
    });
  }
  
  const settingExists = await sequelize.models.Setting.findByPk('autoApprove');
  if (!settingExists) {
    await sequelize.models.Setting.create({ key: 'autoApprove', value: 'false' });
  }

  // Auto-scan existing requests to detect missing matches on startup
  const users = await sequelize.models.User.findAll({ include: ['requests'] });
  const autoApproveSetting = await sequelize.models.Setting.findByPk('autoApprove');
  const matchStatus = autoApproveSetting && autoApproveSetting.value === 'true' ? 'approved' : 'pending';
  
  for (let i = 0; i < users.length; i++) {
    for (let j = i + 1; j < users.length; j++) {
      const u1 = users[i];
      const u2 = users[j];
      if(u1.isAdmin || u2.isAdmin) continue;
      
      const u1WantsU2 = u1.requests && u1.requests.some(r => r.toProvince === u2.frmProvince);
      const u2WantsU1 = u2.requests && u2.requests.some(r => r.toProvince === u1.frmProvince);
      
      if (u1WantsU2 && u2WantsU1) {
        const uid1 = Math.min(u1.id, u2.id);
        const uid2 = Math.max(u1.id, u2.id);
        const existing = await sequelize.models.Match.findOne({ where: { user1Id: uid1, user2Id: uid2 } });
        if (!existing) {
          await sequelize.models.Match.create({ user1Id: uid1, user2Id: uid2, status: matchStatus });
        }
      }
    }
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);

    // Run cleanup immediately on start, then every hour
    cleanupUnverifiedUsers();
    setInterval(cleanupUnverifiedUsers, 60 * 60 * 1000);
  });
}).catch(err => {
  console.error('Database connection failed:', err);
});
