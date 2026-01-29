
const express = require('express');
const router = express.Router();
const TouristSpot = require('../models/TouristSpot');
const Subscriber = require('../models/Subscriber');
const mongoose = require('mongoose');
const checkAdmin = require('../middleware/auth');

// @desc    Fetch all tourist spots
// @route   GET /api/tourist-spots
router.get('/', async (req, res) => {
  try {
    const spots = await TouristSpot.aggregate([
      {
        $addFields: {
          averageRating: { $ifNull: [ { $avg: '$reviews.rating' }, 0 ] },
          reviewCount: { $size: { $ifNull: [ '$reviews', [] ] } }
        }
      }
    ]);
    res.json(spots);
  } catch (error) { 
    console.error("Error fetching tourist spots:", error);
    if (error.name === 'MongooseServerSelectionError') {
      return res.status(503).json({ message: 'Could not connect to the database.' });
    }
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Create a tourist spot
// @route   POST /api/tourist-spots
router.post('/', checkAdmin, async (req, res) => {
  try {
    const newSpot = await TouristSpot.create(req.body);
    res.status(201).json(newSpot);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Update a tourist spot
// @route   PUT /api/tourist-spots/:id
router.put('/:id', checkAdmin, async (req, res) => {
  try {
    const updatedSpot = await TouristSpot.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedSpot);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Delete a tourist spot
// @route   DELETE /api/tourist-spots/:id
router.delete('/:id', checkAdmin, async (req, res) => {
  try {
    await TouristSpot.findByIdAndDelete(req.params.id);
    res.json({ message: 'Spot removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Delete a review (Moderation)
// @route   DELETE /api/tourist-spots/:id/reviews/:reviewId
router.delete('/:id/reviews/:reviewId', checkAdmin, async (req, res) => {
  try {
    const spot = await TouristSpot.findById(req.params.id);
    if (!spot) return res.status(404).json({ message: 'Spot not found' });

    // Filter out the review to be deleted
    spot.reviews = spot.reviews.filter(r => r._id.toString() !== req.params.reviewId);
    
    await spot.save();
    res.json(spot);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Add a review
// @route   POST /api/tourist-spots/:id/reviews
router.post('/:id/reviews', async (req, res) => {
  const { name, email, rating, comment, images } = req.body;
  if (!name || !email || !rating) return res.status(400).json({ message: 'Required fields missing.' });

  try {
    const spot = await TouristSpot.findById(req.params.id);
    if (!spot) return res.status(404).json({ message: 'Not found' });

    spot.reviews.push({ 
        name, 
        email, 
        rating: Number(rating), 
        comment,
        images: images || [] 
    });
    await spot.save();

    try {
        await Subscriber.findOneAndUpdate(
            { email: email },
            { $setOnInsert: { email: email, source: 'review' } },
            { upsert: true }
        );
    } catch (e) {}
    
    const updatedSpot = await TouristSpot.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(req.params.id) } },
        { $addFields: { averageRating: { $ifNull: [ { $avg: '$reviews.rating' }, 0 ] } } }
    ]);

    res.status(201).json(updatedSpot[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
