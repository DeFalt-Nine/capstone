
const mongoose = require('mongoose');

const SubscriberSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  source: { type: String, required: true, enum: ['newsletter', 'review'] }, // Tracks where we got the email
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Subscriber || mongoose.model('Subscriber', SubscriberSchema, 'subscribers');
