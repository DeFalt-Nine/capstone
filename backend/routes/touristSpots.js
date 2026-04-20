import express from 'express';
const router = express.Router();
import { supabase } from '../config/supabase.js';
import { verifyAdmin } from '../middleware/auth.js';
import { deleteImage } from '../services/storageService.js';
import adminLogService from '../services/adminLogService.js';

/**
 * Mapping Helper: Converts Postgres snack_case to camelCase if needed,
 * but currently our frontend expects mostly what's in Mongoose.
 * Note: MongoDB _id vs Postgres id.
 */
const formatSpot = (spot) => {
    if (!spot) return null;
    const activeReviews = (spot.reviews || []).filter(r => !r.is_deleted);
    const avgRating = activeReviews.length > 0 
        ? activeReviews.reduce((acc, r) => acc + r.rating, 0) / activeReviews.length 
        : 0;

    return {
        ...spot,
        _id: spot.id, // Compatibility with frontend
        averageRating: avgRating,
        reviewCount: activeReviews.length,
        reviews: activeReviews.map(r => ({
            ...r,
            _id: r.id, // Compatibility
            createdAt: r.created_at
        }))
    };
};

// @desc    Fetch all tourist spots
// @route   GET /api/tourist-spots
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('tourist_spots')
      .select('*, reviews(*)');

    if (error) throw error;
    
    const formatted = data.map(formatSpot);
    res.json(formatted);
  } catch (error) { 
    console.error("Error fetching tourist spots from Supabase:", error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// @desc    Fetch reviews by user email
// @route   GET /api/tourist-spots/user/:email/reviews
router.get('/user/:email/reviews', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*, tourist_spots(id, name)')
      .eq('email', req.params.email)
      .eq('is_deleted', false)
      .eq('entity_type', 'tourist');

    if (error) throw error;

    const userReviews = data.map(r => ({
      ...r,
      _id: r.id,
      spotId: r.tourist_spots?.id,
      spotName: r.tourist_spots?.name,
      spotType: 'tourist'
    }));

    res.json(userReviews);
  } catch (error) {
    console.error("Error fetching user reviews:", error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Create a tourist spot
// @route   POST /api/tourist-spots
router.post('/', verifyAdmin, async (req, res) => {
  try {
    const { _id, reviews, ...payload } = req.body;
    
    const { data, error } = await supabase
      .from('tourist_spots')
      .insert([payload])
      .select();

    if (error) throw error;
    const newSpot = data[0];
    
    // Log the action
    await adminLogService.logAdminAction({
      action: 'create',
      targetType: 'tourist-spot',
      targetId: newSpot.id.toString(),
      targetName: newSpot.name,
      details: `Created new tourist spot: ${newSpot.name}`
    });

    res.status(201).json({ ...newSpot, _id: newSpot.id });
  } catch (error) {
    console.error("Error creating spot:", error);
    res.status(400).json({ message: error.message });
  }
});

// @desc    Update a tourist spot
// @route   PUT /api/tourist-spots/:id
router.put('/:id', verifyAdmin, async (req, res) => {
  try {
    const { _id, id, reviews, created_at, updated_at, ...payload } = req.body;
    
    const { data, error } = await supabase
      .from('tourist_spots')
      .update({ ...payload, updated_at: new Date() })
      .eq('id', req.params.id)
      .select();

    if (error) throw error;
    if (!data || data.length === 0) return res.status(404).json({ message: 'Spot not found' });
    
    const updatedSpot = data[0];
    
    // Log the action
    await adminLogService.logAdminAction({
      action: 'update',
      targetType: 'tourist-spot',
      targetId: updatedSpot.id.toString(),
      targetName: updatedSpot.name,
      details: `Updated tourist spot: ${updatedSpot.name}`
    });

    res.json({ ...updatedSpot, _id: updatedSpot.id });
  } catch (error) {
    console.error("Error updating spot:", error);
    res.status(400).json({ message: error.message });
  }
});

// @desc    Delete a tourist spot
// @route   DELETE /api/tourist-spots/:id
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    const { data: spot, error: fetchError } = await supabase
      .from('tourist_spots')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (fetchError || !spot) return res.status(404).json({ message: 'Spot not found' });

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

    // reviews are auto-deleted by cascade in Supabase schema if set up correctly
    // If not, we should manually delete them or they will remain as orphans if no FK is set
    const { error: deleteError } = await supabase
      .from('tourist_spots')
      .delete()
      .eq('id', req.params.id);

    if (deleteError) throw deleteError;

    // Log the action
    await adminLogService.logAdminAction({
      action: 'delete',
      targetType: 'tourist-spot',
      targetId: req.params.id,
      targetName: spot.name,
      details: `Deleted tourist spot: ${spot.name}`
    });

    res.json({ message: 'Spot removed and images deleted' });
  } catch (error) {
    console.error("Error deleting spot:", error);
    res.status(500).json({ message: error.message });
  }
});

// @desc    Delete a review (Moderation)
// @route   DELETE /api/tourist-spots/:id/reviews/:reviewId
router.delete('/:id/reviews/:reviewId', verifyAdmin, async (req, res) => {
  try {
    const { data: review, error: rError } = await supabase
      .from('reviews')
      .select('*, tourist_spots(name)')
      .eq('id', req.params.reviewId)
      .single();

    if (rError || !review) return res.status(404).json({ message: 'Review not found' });

    const { error: dError } = await supabase
      .from('reviews')
      .delete()
      .eq('id', req.params.reviewId);

    if (dError) throw dError;

    // Log the action
    await adminLogService.logAdminAction({
      action: 'delete_review',
      targetType: 'tourist-spot',
      targetId: req.params.id,
      targetName: review.tourist_spots?.name || 'Unknown',
      details: `Deleted review by ${review.name} from spot`
    });

    res.json({ message: 'Review deleted' });
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
    // 1. Check if spot exists
    const { data: spot, error: sError } = await supabase
        .from('tourist_spots')
        .select('id, name')
        .eq('id', req.params.id)
        .single();
    if (sError || !spot) return res.status(404).json({ message: 'Spot not found' });

    // 2. Check for existing reviews by this email
    const { data: existing, error: exError } = await supabase
        .from('reviews')
        .select('id')
        .eq('email', email)
        .eq('spot_id', req.params.id)
        .eq('is_deleted', false)
        .limit(1);

    if (existing && existing.length > 0) {
      return res.status(400).json({ message: 'You have already left a review for this spot.' });
    }

    // 3. Insert review
    const { data: newReview, error: iError } = await supabase
        .from('reviews')
        .insert([{
            spot_id: req.params.id,
            name,
            email,
            rating: Number(rating),
            comment,
            images: images || [],
            entity_type: 'tourist'
        }])
        .select();

    if (iError) throw iError;

    // Update subscriber (async)
    supabase.from('subscribers')
        .upsert({ email: email, source: 'review' }, { onConflict: 'email' })
        .then(() => {});

    // Fetch updated spot with all reviews to return
    const { data: updatedSpotData } = await supabase
        .from('tourist_spots')
        .select('*, reviews(*)')
        .eq('id', req.params.id)
        .single();

    res.status(201).json(formatSpot(updatedSpotData));
  } catch (error) {
    console.error("Error adding review:", error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Update a review (User)
// @route   PUT /api/tourist-spots/:id/reviews/:reviewId
router.put('/:id/reviews/:reviewId', async (req, res) => {
  const { rating, comment, images, email } = req.body;
  
  try {
    const { data: review, error: rError } = await supabase
        .from('reviews')
        .select('*')
        .eq('id', req.params.reviewId)
        .single();

    if (rError || !review) return res.status(404).json({ message: 'Review not found' });

    if (review.email !== email) {
      return res.status(403).json({ message: 'Unauthorized.' });
    }

    // 7-day window check
    const diffDays = (new Date().getTime() - new Date(review.created_at).getTime()) / (1000 * 3600 * 24);
    if (diffDays > 7) {
      return res.status(400).json({ message: 'Permanent: cannot edit after 7 days.' });
    }

    const { data: updated, error: uError } = await supabase
        .from('reviews')
        .update({
            rating: rating ? Number(rating) : review.rating,
            comment: comment !== undefined ? comment : review.comment,
            images: images || review.images,
            updated_at: new Date()
        })
        .eq('id', req.params.reviewId)
        .select();

    if (uError) throw uError;

    // Fetch full spot to return
    const { data: fullSpot } = await supabase
    .from('tourist_spots')
    .select('*, reviews(*)')
    .eq('id', req.params.id)
    .single();

    res.json(formatSpot(fullSpot));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Delete a review (User)
// @route   POST /api/tourist-spots/:id/reviews/:reviewId/delete
router.post('/:id/reviews/:reviewId/delete', async (req, res) => {
  const { email } = req.body;
  
  try {
    const { data: review, error: rError } = await supabase
        .from('reviews')
        .select('*')
        .eq('id', req.params.reviewId)
        .single();

    if (rError || !review) return res.status(404).json({ message: 'Review not found' });

    if (review.email !== email) {
      return res.status(403).json({ message: 'Unauthorized.' });
    }

    const { error: dError } = await supabase
        .from('reviews')
        .update({ is_deleted: true, deleted_at: new Date() })
        .eq('id', req.params.reviewId);

    if (dError) throw dError;

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Mark review as seen
// @route   PUT /api/tourist-spots/:id/reviews/:reviewId/seen
router.put('/:id/reviews/:reviewId/seen', verifyAdmin, async (req, res) => {
  try {
    await supabase.from('reviews').update({ is_seen: true }).eq('id', req.params.reviewId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Mark review as resolved
// @route   PUT /api/tourist-spots/:id/reviews/:reviewId/resolved
router.put('/:id/reviews/:reviewId/resolved', verifyAdmin, async (req, res) => {
  try {
    await supabase.from('reviews').update({ is_resolved: true, is_seen: true }).eq('id', req.params.reviewId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
