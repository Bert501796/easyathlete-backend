const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { classifyFitnessLevel } = require('../utils/fitnessClassifier');
const { getStravaMetrics } = require('../utils/dataFetchers');

// Middleware to authenticate user
const authenticate = require('../middleware/auth');

router.post('/compute-fitness-level', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    const metrics = await getStravaMetrics(userId);
    const fitnessLevel = classifyFitnessLevel(metrics);

    await User.updateOne({ _id: userId }, { fitnessLevel });

    res.status(200).json({ fitnessLevel });
  } catch (error) {
    console.error('Error computing fitness level:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/fitness-level', async (req, res) => {
  const userId = req.query.userId; // 🧠 Add this line

  if (!userId) return res.status(400).json({ error: 'Missing userId' });

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.status(200).json({ fitnessLevel: user.fitnessLevel || 'Not yet classified' });
  } catch (error) {
    console.error('Error retrieving fitness level:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


module.exports = router;
