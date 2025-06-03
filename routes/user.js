const express = require('express');
const auth = require('../middleware/auth'); // ✅ correct path

const router = express.Router();

router.get('/me', auth, (req, res) => {
  res.json({ message: `Welcome user ${req.user.id}` });
});

module.exports = router;
