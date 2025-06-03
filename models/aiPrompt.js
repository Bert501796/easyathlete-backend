//used to store the AI prompt separately in MongoDB

const mongoose = require('mongoose');

const aiPromptSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  prompts: { type: Array, required: true }, // [{ day, type, messages }]
  source: { type: String, default: 'initial' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AiPrompt', aiPromptSchema);
