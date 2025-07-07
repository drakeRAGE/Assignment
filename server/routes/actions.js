const express = require('express');
const Action = require('../models/Action');
const auth = require('../middleware/auth');
const router = express.Router();

// Get recent actions (last 20)
router.get('/recent', auth, async (req, res) => {
  try {
    const actions = await Action.find()
      .populate('user', 'username')
      .populate('taskId', 'title')
      .sort({ timestamp: -1 })
      .limit(20);
    
    res.json(actions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;