
const mongoose = require('mongoose');

const ChatLogSchema = new mongoose.Schema({
  userMessage: { type: String, required: true },
  botResponse: { type: String, required: true },
  isIntent: { type: Boolean, default: false }, // true if it was a "Quick Chip" or basic intent, false if AI
  timestamp: { type: Date, default: Date.now }
});

// Use 'chatlogs' as the collection name
module.exports = mongoose.models.ChatLog || mongoose.model('ChatLog', ChatLogSchema, 'chatlogs');
