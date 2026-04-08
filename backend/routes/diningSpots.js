import express from 'express';
const router = express.Router();
import DiningSpot from '../models/DiningSpot.js';
import Subscriber from '../models/Subscriber.js';
import mongoose from 'mongoose';
import { verifyAdmin } from '../middleware/auth.js';
import { deleteImage } from '../services/storageService.js';
import adminLogService from '../services/adminLogService.js';

// @desc    Fetch all dining spots
// @route   GET /api/dining-spots
router.get('/', async (req, res) => {
  try {
    const spots = await DiningSpot.aggregate([
      {
        $addFields: {
          activeReviews: {
            $filter: {
              input: { $ifNull: ['$reviews', []] },
              as: 'review',
              cond: { $ne: ['$$review.isDeleted', true] }
            }
          }
        }
      },
      {
        $addFields: {
          averageRating: { $ifNull: [{ $avg: '$activeReviews.rating' }, 0] },
          reviewCount: { $size: '$activeReviews' },
          reviews: '$activeReviews' // Only return active reviews to frontend
        }
      },
      {
        $project: {
          activeReviews: 0 // Remove the temporary field
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
router.post('/', verifyAdmin, async (req, res) => {
  try {
    const newSpot = await DiningSpot.create(req.body);
    
    // Log the action
    await adminLogService.logAdminAction({
      action: 'create',
      targetType: 'dining-spot',
      targetId: newSpot._id.toString(),
      targetName: newSpot.name,
      details: `Created new dining spot: ${newSpot.name}`
    });

    res.status(201).json(newSpot);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Update
router.put('/:id', verifyAdmin, async (req, res) => {
  try {
    const updatedSpot = await DiningSpot.findByIdAndUpdate(req.params.id, req.body, { new: true });
    
    // Log the action
    await adminLogService.logAdminAction({
      action: 'update',
      targetType: 'dining-spot',
      targetId: updatedSpot._id.toString(),
      targetName: updatedSpot.name,
      details: `Updated dining spot: ${updatedSpot.name}`
    });

    res.json(updatedSpot);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Delete
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    const spot = await DiningSpot.findById(req.params.id);
    if (!spot) return res.status(404).json({ message: 'Spot not found' });

    // Delete main image
    if (spot.image) {
        await deleteImage(spot.image);
    }

    // Delete gallery images
    if (spot.gallery && spot.gallery.length > 0) {
        for (const imgUrl of spot.gallery) {
            await deleteImage(imgUrl);
        }
    }

    // Delete review images
    if (spot.reviews && spot.reviews.length > 0) {
        for (const review of spot.reviews) {
            if (review.images && review.images.length > 0) {
                for (const imgUrl of review.images) {
                    await deleteImage(imgUrl);
                }
            }
        }
    }

    await DiningSpot.findByIdAndDelete(req.params.id);

    // Log the action
    await adminLogService.logAdminAction({
      action: 'delete',
      targetType: 'dining-spot',
      targetId: req.params.id,
      targetName: spot.name,
      details: `Deleted dining spot: ${spot.name}`
    });

    res.json({ message: 'Spot removed and images deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Delete a review (Moderation)
// @route   DELETE /api/dining-spots/:id/reviews/:reviewId
router.delete('/:id/reviews/:reviewId', verifyAdmin, async (req, res) => {
  try {
    const spot = await DiningSpot.findById(req.params.id);
    if (!spot) return res.status(404).json({ message: 'Spot not found' });

    // Filter out the review to be deleted
    const reviewToDelete = spot.reviews.find(r => r._id.toString() === req.params.reviewId);
    spot.reviews = spot.reviews.filter(r => r._id.toString() !== req.params.reviewId);
    
    await spot.save();

    // Log the action
    await adminLogService.logAdminAction({
      action: 'delete_review',
      targetType: 'dining-spot',
      targetId: spot._id.toString(),
      targetName: spot.name,
      details: `Deleted review by ${reviewToDelete?.name || 'unknown'} from ${spot.name}`
    });

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

    // Check for existing reviews by this email
    const existingReview = spot.reviews.find(r => r.email === email && !r.isDeleted);
    if (existingReview) {
      return res.status(400).json({ message: 'You have already left a review for this spot. You can edit it within 7 days or delete it to post a new one later.' });
    }

    // Check for recently deleted reviews (7-day cooldown after 3 attempts)
    const deletedReviews = spot.reviews.filter(r => r.email === email && r.isDeleted);
    const lastDeleted = deletedReviews.sort((a, b) => new Date(b.deletedAt).getTime() - new Date(a.deletedAt).getTime()).reverse()[0];
    
    if (deletedReviews.length >= 3 && lastDeleted && (Date.now() - new Date(lastDeleted.deletedAt).getTime() < 7 * 24 * 60 * 60 * 1000)) {
      const waitDays = Math.ceil((7 * 24 * 60 * 60 * 1000 - (Date.now() - new Date(lastDeleted.deletedAt).getTime())) / (24 * 60 * 60 * 1000));
      return res.status(400).json({ message: `You have reached the limit of 3 review attempts. Please wait ${waitDays} more days before posting a new one.` });
    }

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

// @desc    Update a review (User)
router.put('/:id/reviews/:reviewId', async (req, res) => {
  const { rating, comment, images, email } = req.body;
  
  try {
    const spot = await DiningSpot.findById(req.params.id);
    if (!spot) return res.status(404).json({ message: 'Spot not found' });

    const review = spot.reviews.id(req.params.reviewId);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    // Security check: email must match
    if (review.email !== email) {
      return res.status(403).json({ message: 'Unauthorized to edit this review.' });
    }

    // Check 7-day edit window
    const createdAt = new Date(review.createdAt);
    const now = new Date();
    const diffDays = (now.getTime() - createdAt.getTime()) / (1000 * 3600 * 24);
    
    if (diffDays > 7) {
      return res.status(400).json({ message: 'This review is now permanent and can no longer be edited.' });
    }

    if (rating) review.rating = Number(rating);
    if (comment !== undefined) review.comment = comment;
    if (images) review.images = images;

    await spot.save();
    res.json(spot);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Delete a review (User)
router.post('/:id/reviews/:reviewId/delete', async (req, res) => {
  const { email } = req.body;
  
  try {
    const spot = await DiningSpot.findById(req.params.id);
    if (!spot) return res.status(404).json({ message: 'Spot not found' });

    const review = spot.reviews.id(req.params.reviewId);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    // Security check: email must match
    if (review.email !== email) {
      return res.status(403).json({ message: 'Unauthorized to delete this review.' });
    }

    review.isDeleted = true;
    review.deletedAt = new Date();
    
    await spot.save();

    const deletedReviewsCount = spot.reviews.filter(r => r.email === email && r.isDeleted).length;
    const remainingAttempts = Math.max(0, 3 - deletedReviewsCount);

    if (deletedReviewsCount >= 3) {
      res.json({ message: 'Review deleted. You have reached the 3-attempt limit and can post a new one after 7 days.' });
    } else {
      res.json({ message: `Review deleted. You have ${remainingAttempts} attempt(s) left before a 7-day cooldown applies.` });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Mark review as seen
// @route   PUT /api/dining-spots/:id/reviews/:reviewId/seen
router.put('/:id/reviews/:reviewId/seen', verifyAdmin, async (req, res) => {
  try {
    const spot = await DiningSpot.findById(req.params.id);
    if (!spot) return res.status(404).json({ message: 'Spot not found' });

    const review = spot.reviews.id(req.params.reviewId);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    review.isSeen = true;
    await spot.save();
    res.json(spot);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Mark review as resolved
// @route   PUT /api/dining-spots/:id/reviews/:reviewId/resolved
router.put('/:id/reviews/:reviewId/resolved', verifyAdmin, async (req, res) => {
  try {
    const spot = await DiningSpot.findById(req.params.id);
    if (!spot) return res.status(404).json({ message: 'Spot not found' });

    const review = spot.reviews.id(req.params.reviewId);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    review.isResolved = true;
    review.isSeen = true; // Also mark as seen if resolved
    await spot.save();
    res.json(spot);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
