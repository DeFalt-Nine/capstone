
import mongoose from 'mongoose';

const LocalEventSchema = new mongoose.Schema({
  image: { type: String, required: true },
  title: { type: String, required: true },
  date: { type: String, required: false },
  description: { type: String, required: true },
  location: { type: String, required: true },
  badge: { type: String, required: false },
});

export default mongoose.models.LocalEvent || mongoose.model('LocalEvent', LocalEventSchema, 'localevents');
