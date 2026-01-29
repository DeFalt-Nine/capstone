
const mongoose = require('mongoose');

const AnalyticsEventSchema = new mongoose.Schema({
  eventType: { type: String, required: true }, // e.g., 'click', 'view', 'filter'
  targetId: { type: String }, // e.g., 'Blog-Strawberry-Guide', 'GetDirections-BellChurch'
  page: { type: String, required: true }, // e.g., '/blog', '/tourist-spots'
  metadata: { type: mongoose.Schema.Types.Mixed }, // Optional extra info (e.g., { category: 'Nature' })
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.models.AnalyticsEvent || mongoose.model('AnalyticsEvent', AnalyticsEventSchema, 'analyticsevents');
