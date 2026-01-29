
const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  targetId: { type: String, required: true },
  targetName: { type: String, required: true },
  targetType: { type: String, required: true, enum: ['TouristSpot', 'DiningSpot', 'BlogPost'] },
  reason: { type: String, required: true }, // e.g., 'Wrong Info', 'Closed', 'Inappropriate'
  description: { type: String, required: false },
  status: { type: String, default: 'pending', enum: ['pending', 'resolved'] },
}, { timestamps: true });

module.exports = mongoose.models.Report || mongoose.model('Report', ReportSchema, 'reports');
