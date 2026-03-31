const router = require('express').Router();
const { User, Request, Match } = require('../models');

// Get public statistics for the landing page
router.get('/stats', async (req, res) => {
  try {
    const usersCount = await User.count({ where: { isAdmin: false } });
    const requestsCount = await Request.count();
    const successfulTransfers = await Match.count({ where: { status: 'completed' } });
    
    res.json({
      users: usersCount,
      requests: requestsCount,
      completed: successfulTransfers
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
