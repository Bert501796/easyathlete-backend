//used to store the Training schedule in MongoDB
const mongoose = require('mongoose');

const trainingScheduleSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  prompt: { type: Object, required: true },
  response: { type: Object, required: true },
  source: { type: String, default: 'initial' }, // or 'regeneration', 'edit'
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('TrainingSchedule', trainingScheduleSchema);
