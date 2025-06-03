//used to store the Training schedule in MongoDB
const mongoose = require('mongoose');

const trainingScheduleSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  prompt: { type: Object, required: true },
  response: { type: Object, required: true },
  source: { type: String, default: 'initial' }, // or 'regeneration', 'edit'
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('TrainingSchedule', trainingScheduleSchema);
