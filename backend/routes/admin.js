const router = require('express').Router();
const { User, Match, Request, Setting } = require('../models');
const auth = require('../middleware/auth');

// Middleware to check admin role
const isAdmin = (req, res, next) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: 'Access Denied: Admin only' });
  }
  next();
};

/**
 * Get all existing matches
 */
router.get('/matches', auth, isAdmin, async (req, res) => {
  try {
    const matches = await Match.findAll({
      include: [
        { model: User, as: 'User1', attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'grade', 'frmProvince'] },
        { model: User, as: 'User2', attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'grade', 'frmProvince'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(matches);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * Approve a match
 */
router.post('/matches/:id/approve', auth, isAdmin, async (req, res) => {
  try {
    const match = await Match.findByPk(req.params.id);
    if (!match) return res.status(404).json({ message: 'Match not found' });
    
    match.status = 'approved';
    await match.save();

    res.json({ message: 'Match approved successfully', match });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * Get users for filtering
 */
router.get('/users', auth, isAdmin, async (req, res) => {
  try {
    const users = await User.findAll({
      where: { isAdmin: false },
      include: [{ model: Request, as: 'requests' }],
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * Delete a user and cascade their data
 */
router.delete('/users/:id', auth, isAdmin, async (req, res) => {
  try {
    const userToDelete = await User.findByPk(req.params.id);
    if (!userToDelete) return res.status(404).json({ message: 'User not found' });
    
    // Deleting the user will cascade and delete their requests 
    // depending on DB setup, but we safely destroy them:
    await userToDelete.destroy();

    // After destroying, we should also manually nuke any matches that involved this user id
    await Match.destroy({
      where: {
        [require('sequelize').Op.or]: [{ user1Id: req.params.id }, { user2Id: req.params.id }]
      }
    });

    res.json({ message: 'User fully deleted from system' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * Global settings endpoints
 */
router.get('/settings', auth, isAdmin, async (req, res) => {
  try {
    const settings = await Setting.findAll();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/settings/autoApprove', auth, isAdmin, async (req, res) => {
  try {
    const { value } = req.body;
    let setting = await Setting.findByPk('autoApprove');
    if (!setting) {
      setting = await Setting.create({ key: 'autoApprove', value: String(value) });
    } else {
      setting.value = String(value);
      await setting.save();
    }
    
    // If turning ON autoApprove, optionally approve all pending matches
    if (String(value) === 'true') {
      await Match.update({ status: 'approved' }, { where: { status: 'pending' } });
    }
    
    res.json(setting);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * Get basic stats for admin dashboard
 */
router.get('/stats', auth, isAdmin, async (req, res) => {
  try {
    const usersCount = await User.count({ where: { isAdmin: false } });
    const requestsCount = await Request.count();
    const matchesCount = await Match.count();
    
    res.json({
      users: usersCount,
      requests: requestsCount,
      matches: matchesCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
