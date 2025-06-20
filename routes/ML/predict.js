const express = require('express');
const axios = require('axios');
const router = express.Router();

router.post('/predict', async (req, res) => {
  const { userId } = req.body;

  if (!userId) return res.status(400).json({ error: 'Missing userId' });

  try {
    const { data } = await axios.post('http://localhost:8000/ml/predict-user', {
      user_id: userId
    });
    return res.json(data);
  } catch (err) {
    console.error('❌ Prediction failed:', err.message);
    return res.status(500).json({ error: 'Prediction failed' });
  }
});

module.exports = router;