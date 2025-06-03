//used to store the AI prompt separately in MongoDB

const mongoose = require('mongoose');

const aiPromptSchema = new mongoose.Schema({
  userId: { type: String, required: true },  // ✅ Match how you generate userId in localStorage
  prompts: { type: Array, required: true }, // [{ day, type, messages }]
  source: { type: String, default: 'initial' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AiPrompt', aiPromptSchema);
