
const mongoose = require('mongoose');

const LocalEventSchema = new mongoose.Schema({
  image: { type: String, required: true },
  title: { type: String, required: true },
  date: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  badge: { type: String, required: true },
});

module.exports = mongoose.models.LocalEvent || mongoose.model('LocalEvent', LocalEventSchema, 'localevents');
