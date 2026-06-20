const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  company: { type: String, required: true },
  role: { type: String, required: true },
  date: { type: Date, default: Date.now },
  status: { 
    type: String, 
    enum: ['Applied', 'Shortlisted', 'Interview', 'Rejected'],
    default: 'Applied'
  },
  salary: { type: String },
  notes: { type: String },
});

module.exports = mongoose.model('Application', applicationSchema);
