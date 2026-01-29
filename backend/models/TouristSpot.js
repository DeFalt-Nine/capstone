
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: false },
  images: [{ type: String }], // New field for review photos
}, {
  timestamps: true, // Adds createdAt and updatedAt to reviews
});


const TouristSpotSchema = new mongoose.Schema({
  image: { type: String, required: true },
  alt: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  history: { type: String, required: true },
  gallery: [{ type: String }],
  openingHours: { type: String, required: true },
  bestTimeToVisit: { type: String, required: true },
  category: { type: String, required: true }, // New Field
  tags: [{ type: String }], // New Field
  nearbyEmergency: [
    {
      type: { type: String, enum: ['Hospital', 'Police'], required: true },
      name: { type: String, required: true },
      distance: { type: String, required: true },
    },
  ],
  mapEmbedUrl: { type: String, required: true },
  reviews: [reviewSchema],
});

// This is the key change: Check if the model is already registered.
// This prevents an error in serverless environments where the file might be re-evaluated.
module.exports = mongoose.models.TouristSpot || mongoose.model('TouristSpot', TouristSpotSchema, 'touristspots');
