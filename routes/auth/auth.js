const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const OnboardingResponse = require('../../models/OnboardingResponse');
const TrainingSchedule = require('../../models/TrainingSchedule');
const AiPrompt = require('../../models/AiPrompt');
const StravaActivity = require('../../models/StravaActivity'); // ✅ make sure this is here

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

// POST /signup
router.post('/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: '❌ Email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword, name });
    await newUser.save();

    const token = jwt.sign({ id: newUser._id }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ message: '✅ Signup successful', token, userId: newUser._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: '❌ User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: '❌ Invalid credentials' });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ message: '✅ Login successful', token, userId: user._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /signup-with-data
router.post('/signup-with-data', async (req, res) => {
  try {
    const { email, password, name, userId: oldUserId } = req.body;
    if (!oldUserId) return res.status(400).json({ message: 'Missing userId' });

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already in use' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      email,
      password: hashedPassword,
      name,
      customUserId: oldUserId // 🧠 preserve original temp userId
    });
    await newUser.save();

    const newUserId = newUser._id;
    const updateConditions = { userId: oldUserId };
    const updateAction = { userId: newUserId };

    await Promise.all([
      OnboardingResponse.updateMany(updateConditions, updateAction),
      AiPrompt.updateMany(updateConditions, updateAction),
      TrainingSchedule.updateMany(updateConditions, updateAction),
      StravaActivity.updateMany(updateConditions, updateAction)
    ]);

    const token = jwt.sign({ id: newUserId }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ message: '✅ Account created with migrated data', token, userId: newUserId });
  } catch (err) {
    console.error('❌ Signup-with-data failed:', err);
    res.status(500).json({ message: '❌ Failed to create account with data' });
  }
});


// POST /migrate-user-data
router.post('/migrate-user-data', async (req, res) => {
  const { oldUserId, newUserId } = req.body;
  if (!oldUserId || !newUserId) return res.status(400).json({ error: 'Missing oldUserId or newUserId' });

  try {
    const updateConditions = { userId: oldUserId };
    const updateAction = { userId: newUserId };

    const [onboarding, prompts, schedules, activities] = await Promise.all([
      OnboardingResponse.updateMany(updateConditions, updateAction),
      AiPrompt.updateMany(updateConditions, updateAction),
      TrainingSchedule.updateMany(updateConditions, updateAction),
      StravaActivity.updateMany(updateConditions, updateAction) // ✅ include in manual migration too
    ]);

    res.status(200).json({
      message: '✅ Migration complete',
      updated: {
        onboarding: onboarding.modifiedCount,
        prompts: prompts.modifiedCount,
        schedules: schedules.modifiedCount,
        stravaActivities: activities.modifiedCount
      }
    });
  } catch (err) {
    console.error('❌ Migration error:', err);
    res.status(500).json({ error: 'Migration failed' });
  }
});

// DELETE /auth/:userId
router.delete('/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const [user, onboarding, prompts, schedules, activities] = await Promise.all([
      User.deleteOne({ _id: userId }),
      OnboardingResponse.deleteMany({ userId }),
      AiPrompt.deleteMany({ userId }),
      TrainingSchedule.deleteMany({ userId }),
      StravaActivity.deleteMany({ userId }) // ✅ delete activities
    ]);

    res.status(200).json({
      message: `✅ Deleted user and related data for userId: ${userId}`,
      deleted: {
        user: user.deletedCount,
        onboarding: onboarding.deletedCount,
        prompts: prompts.deletedCount,
        schedules: schedules.deletedCount,
        stravaActivities: activities.deletedCount
      }
    });
  } catch (err) {
    console.error('❌ Error deleting user:', err);
    res.status(500).json({ message: '❌ Failed to delete user and related data' });
  }
});

module.exports = router;
