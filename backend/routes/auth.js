const router = require('express').Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { User, sequelize } = require('../models');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/email');

// ─── REGISTER ────────────────────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, phone, grade, email, password, frmProvince } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) return res.status(400).json({ message: 'Email already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    // Generate a 6-digit numeric OTP
    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();

    await User.create({
      firstName, lastName, phone, grade, email,
      password: hashedPassword, frmProvince,
      isVerified: false,
      verificationToken
    });

    // Send verification email (non-blocking – registration still succeeds even if email fails)
    try {
      await sendVerificationEmail({ firstName, email }, verificationToken);
    } catch (mailErr) {
      console.error('Verification email failed:', mailErr.message);
    }

    res.status(201).json({ message: 'check_your_email' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── VERIFY EMAIL (POST with email + OTP code) ───────────────────────────────
router.post('/verify-email', async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) return res.status(400).json({ message: 'Missing fields' });

    const user = await User.findOne({ where: { email, verificationToken: code.trim() } });
    if (!user) return res.status(400).json({ message: 'invalid_token' });

    user.isVerified = true;
    user.verificationToken = null;
    await user.save();

    res.json({ message: 'email_verified' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── LOGIN ────────────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ message: 'Email not found' });

    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) return res.status(400).json({ message: 'Invalid password' });

    // Block unverified non-admin users
    if (!user.isVerified && !user.isAdmin) {
      return res.status(403).json({ message: 'email_not_verified' });
    }

    const token = jwt.sign({ id: user.id, isAdmin: user.isAdmin }, 'MY_SECRET_KEY', { expiresIn: '1d' });
    res.json({
      token,
      user: {
        id: user.id, firstName: user.firstName, lastName: user.lastName,
        email: user.email, phone: user.phone, grade: user.grade,
        frmProvince: user.frmProvince, isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── GET CURRENT USER ─────────────────────────────────────────────────────────
router.get('/me', require('../middleware/auth'), async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── UPDATE PROFILE ───────────────────────────────────────────────────────────
router.put('/profile', require('../middleware/auth'), async (req, res) => {
  try {
    const { firstName, lastName, phone, grade, email, frmProvince } = req.body;

    if (email) {
      const existing = await User.findOne({ where: { email } });
      if (existing && existing.id !== req.user.id) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.firstName = firstName || user.firstName;
    user.lastName  = lastName  || user.lastName;
    user.phone     = phone     || user.phone;
    user.grade     = grade     || user.grade;
    user.email     = email     || user.email;
    user.frmProvince = frmProvince || user.frmProvince;

    await user.save();

    res.json({
      id: user.id, firstName: user.firstName, lastName: user.lastName,
      email: user.email, phone: user.phone, grade: user.grade,
      frmProvince: user.frmProvince, isAdmin: user.isAdmin
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── FORGOT PASSWORD ──────────────────────────────────────────────────────────
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });

    // Always return success to prevent email enumeration attacks
    if (!user) return res.json({ message: 'reset_email_sent' });

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetToken = resetToken;
    user.resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour
    await user.save();

    try {
      await sendPasswordResetEmail(user, resetToken);
    } catch (mailErr) {
      console.error('Reset email failed:', mailErr.message);
    }

    res.json({ message: 'reset_email_sent' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── RESET PASSWORD ───────────────────────────────────────────────────────────
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ message: 'Missing fields' });

    const user = await User.findOne({ where: { resetToken: token } });
    if (!user || !user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
      return res.status(400).json({ message: 'invalid_or_expired_token' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await user.save();

    res.json({ message: 'password_reset_success' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── RESEND VERIFICATION ──────────────────────────────────────────────────────
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });

    // Always return success to avoid email enumeration
    if (!user || user.isVerified) return res.json({ message: 'resent' });

    // New 6-digit OTP
    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
    user.verificationToken = verificationToken;
    await user.save();

    try {
      await sendVerificationEmail(user, verificationToken);
    } catch (mailErr) {
      console.error('Resend verification email failed:', mailErr.message);
    }

    res.json({ message: 'resent' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
