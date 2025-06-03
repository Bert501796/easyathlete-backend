const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Create a test user
router.get('/create-test-user', async (req, res) => {
  try {
    const user = new User({
      email: `test${Date.now()}@example.com`,
      name: 'Test User'
    });
    await user.save();
    res.json({ message: '✅ User created', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all users
router.get('/all-users', async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
