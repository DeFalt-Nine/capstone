
const mongoose = require('mongoose');

// We reuse the review schema structure
const reviewSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: false },
  images: [{ type: String }], // New field for review photos
}, {
  timestamps: true,
});

const DiningSpotSchema = new mongoose.Schema({
  image: { type: String, required: true },
  alt: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  history: { type: String, required: false }, // Optional for restaurants
  gallery: [{ type: String }],
  openingHours: { type: String, required: true },
  bestTimeToVisit: { type: String, required: true }, // Or "Best Seller"
  category: { type: String, required: true },
  tags: [{ type: String }],
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

module.exports = mongoose.models.DiningSpot || mongoose.model('DiningSpot', DiningSpotSchema, 'diningspots');
