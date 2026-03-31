const router = require('express').Router();
const { Request, User } = require('../models');
const auth = require('../middleware/auth');
const { Op } = require('sequelize');

// Create a new request
router.post('/', auth, async (req, res) => {
  try {
    const { toProvince } = req.body;

    if (!toProvince) return res.status(400).json({ message: 'Target province is required' });

    // Ensure the toProvince is different from frmProvince
    const user = await User.findByPk(req.user.id);
    if (user.frmProvince === toProvince) {
      return res.status(400).json({ message: 'Target province must be different from your current province' });
    }

    // Prevent duplicate requests for the same user
    const existingReq = await Request.findOne({ where: { userId: req.user.id, toProvince } });
    if (existingReq) return res.status(400).json({ message: 'Request for this province already exists' });

    const newReq = await Request.create({ userId: req.user.id, toProvince });
    
    // Auto-detect matches
    const { Match, Setting } = require('../models');
    
    // Check autoApprove setting
    const autoApproveSetting = await Setting.findByPk('autoApprove');
    const matchStatus = autoApproveSetting && autoApproveSetting.value === 'true' ? 'approved' : 'pending';
    
    // Find users who are in 'toProvince' and want to go to 'currentUser.frmProvince'
    const matchedUsers = await User.findAll({
      where: {
        frmProvince: toProvince
      },
      include: [{
        model: Request,
        as: 'requests',
        where: { toProvince: user.frmProvince }
      }]
    });

    for (const matchUser of matchedUsers) {
      // Create a match record for admin to review
      // We will sort IDs so we don't have duplicate pairs (A-B vs B-A)
      const u1 = Math.min(req.user.id, matchUser.id);
      const u2 = Math.max(req.user.id, matchUser.id);
      
      const existingMatch = await Match.findOne({ where: { user1Id: u1, user2Id: u2 } });
      if (!existingMatch) {
        await Match.create({ user1Id: u1, user2Id: u2, status: matchStatus });
      }
    }

    res.status(201).json(newReq);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all requests for the current user
router.get('/', auth, async (req, res) => {
  try {
    const requests = await Request.findAll({ 
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']]
    });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a request
router.delete('/:id', auth, async (req, res) => {
  try {
    const { Match, User, Request } = require('../models');
    const { Op } = require('sequelize');

    const reqToDelete = await Request.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!reqToDelete) return res.status(404).json({ message: 'Request not found' });
    
    await reqToDelete.destroy();

    // Clean up matches that are no longer mutually valid
    const userMatches = await Match.findAll({
      where: {
        [Op.or]: [{ user1Id: req.user.id }, { user2Id: req.user.id }]
      }
    });

    const currentUser = await User.findByPk(req.user.id, { include: [{ model: Request, as: 'requests' }] });
    const userDesiredProvinces = currentUser.requests.map(r => r.toProvince);

    for (const match of userMatches) {
      const otherUserId = match.user1Id === req.user.id ? match.user2Id : match.user1Id;
      const otherUser = await User.findByPk(otherUserId, { include: [{ model: Request, as: 'requests' }] });
      
      const otherDesiredProvinces = otherUser.requests.map(r => r.toProvince);
      
      const isValid = userDesiredProvinces.includes(otherUser.frmProvince) && 
                      otherDesiredProvinces.includes(currentUser.frmProvince);
                      
      if (!isValid) {
        await match.destroy();
      }
    }

    res.json({ message: 'Request deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get potential matches (users wanting to transfer to this user's province, and whose province this user wants to go to)
router.get('/matches', auth, async (req, res) => {
  try {
    const { Match, User, Request } = require('../models');
    const { Op } = require('sequelize');

    const matches = await Match.findAll({
      where: {
        [Op.or]: [{ user1Id: req.user.id }, { user2Id: req.user.id }],
        status: { [Op.in]: ['approved', 'completed'] }
      },
      include: [
        { model: User, as: 'User1', attributes: { exclude: ['password'] }, include: [{ model: Request, as: 'requests' }] },
        { model: User, as: 'User2', attributes: { exclude: ['password'] }, include: [{ model: Request, as: 'requests' }] }
      ]
    });

    // Extract the OTHER user to send to the frontend, attaching match info directly
    const matchedUsers = matches.map(m => {
      let matchedUserContext;
      if (m.user1Id === req.user.id) {
        matchedUserContext = m.User2;
      } else {
        matchedUserContext = m.User1;
      }
      
      // Inject match data into the user object
      const userJSON = matchedUserContext.toJSON();
      userJSON.matchId = m.id;
      userJSON.matchStatus = m.status;
      return userJSON;
    });

    res.json(matchedUsers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark a match as completed/successful
router.post('/matches/:id/complete', auth, async (req, res) => {
  try {
    const { Match } = require('../models');
    const { Op } = require('sequelize');

    const match = await Match.findOne({
      where: {
        id: req.params.id,
        [Op.or]: [{ user1Id: req.user.id }, { user2Id: req.user.id }]
      }
    });

    if (!match) return res.status(404).json({ message: 'Match not found or unauthorized' });

    match.status = 'completed';
    await match.save();

    res.json({ message: 'Transfer marked as successful!', match });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
