
const express = require('express');
const router = express.Router();
const DiningSpot = require('../models/DiningSpot');
const Subscriber = require('../models/Subscriber');
const mongoose = require('mongoose');
const checkAdmin = require('../middleware/auth');

// @desc    Fetch all dining spots
// @route   GET /api/dining-spots
router.get('/', async (req, res) => {
  try {
    const spots = await DiningSpot.aggregate([
      {
        $addFields: {
          averageRating: { $ifNull: [ { $avg: '$reviews.rating' }, 0 ] },
          reviewCount: { $size: { $ifNull: [ '$reviews', [] ] } }
        }
      }
    ]);
    res.json(spots);
  } catch (error) { 
    console.error("Error fetching dining spots:", error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Create
router.post('/', checkAdmin, async (req, res) => {
  try {
    const newSpot = await DiningSpot.create(req.body);
    res.status(201).json(newSpot);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Update
router.put('/:id', checkAdmin, async (req, res) => {
  try {
    const updatedSpot = await DiningSpot.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedSpot);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Delete
router.delete('/:id', checkAdmin, async (req, res) => {
  try {
    await DiningSpot.findByIdAndDelete(req.params.id);
    res.json({ message: 'Spot removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Delete a review (Moderation)
// @route   DELETE /api/dining-spots/:id/reviews/:reviewId
router.delete('/:id/reviews/:reviewId', checkAdmin, async (req, res) => {
  try {
    const spot = await DiningSpot.findById(req.params.id);
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
router.post('/:id/reviews', async (req, res) => {
  const { name, email, rating, comment, images } = req.body;
  if (!name || !email || !rating) return res.status(400).json({ message: 'Required fields missing.' });

  try {
    const spot = await DiningSpot.findById(req.params.id);
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
    
    const updatedSpot = await DiningSpot.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(req.params.id) } },
        { $addFields: { averageRating: { $ifNull: [ { $avg: '$reviews.rating' }, 0 ] } } }
    ]);

    res.status(201).json(updatedSpot[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
