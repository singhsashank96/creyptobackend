const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
    projectNumber: { type: Number },
  siteName: { type: String },
  ward: { type: String },
  head: { type: String },
  sancationNumberDate: { type: String },
  sor: { type: String },
  timeLimit :{ type: String },
  officerInch :{ type: String },
  sancationAmount: { type: Number },
  estimateAggrement: { type: String },

  type: { type: String, required: true },
  description: { type: String },
  address: { type: String, required: true },
  location: { type: String, required: true },
  cost: { type: Number, required: true },
  startDate: { type: Date, required: true },
    attachment: {type: String },

  completeDate: { type: Date },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed'],
    default: 'pending'
  },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
