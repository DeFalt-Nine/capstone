import express from 'express';
const router = express.Router();
import ChatLog from '../models/ChatLog.js';
import AnalyticsEvent from '../models/AnalyticsEvent.js';
import TouristSpot from '../models/TouristSpot.js';
import DiningSpot from '../models/DiningSpot.js';
import BlogPost from '../models/BlogPost.js';
import mongoose from 'mongoose';
import { verifyAdmin } from '../middleware/auth.js';

// @desc    Log a chat interaction (used for frontend intents)
// @route   POST /api/v1/stats/chat
// @access  Public
router.post('/chat', async (req, res) => {
  try {
    const { userMessage, botResponse, isIntent } = req.body;

    if (!userMessage || !botResponse) {
      return res.status(400).json({ message: 'Missing message data' });
    }

    await ChatLog.create({
      userMessage,
      botResponse,
      isIntent: isIntent || true
    });

    res.status(201).json({ success: true });
  } catch (error) {
    console.error("Error logging chat interaction:", error);
    res.status(500).json({ message: 'Server Error while logging chat.' });
  }
});

// @desc    Log a generic interaction event (click, view, filter)
// @route   POST /api/v1/stats/log
// @access  Public
router.post('/log', async (req, res) => {
    try {
        const { eventType, targetId, page, metadata } = req.body;
        console.log(`[Analytics] Incoming event: ${eventType}, target: ${targetId}, page: ${page}`);

        if (!eventType || !page) {
            return res.status(400).json({ message: 'Event type and page are required' });
        }

        const { duration } = req.body;

        // Fire and forget - usually fast enough, but we await to catch errors
        await AnalyticsEvent.create({
            eventType,
            targetId,
            page,
            duration,
            metadata
        });

        // If it's a 'view' event, increment the view count in the respective model
        if (eventType === 'view' && targetId) {
            console.log(`[Analytics] View event received for ${targetId} on page ${page}`);
            
            // Validate if targetId is a valid MongoDB ObjectId
            if (!mongoose.Types.ObjectId.isValid(targetId)) {
                console.warn(`[Analytics] Invalid targetId format: ${targetId}. Skipping view increment.`);
            } else {
                try {
                    let result = null;
                    if (page.includes('/tourist-spots')) {
                        result = await TouristSpot.findByIdAndUpdate(targetId, { $inc: { views: 1 } }, { new: true });
                        console.log(`[Analytics] TouristSpot update for ${targetId}: ${result ? 'Success (Views: ' + result.views + ')' : 'Not Found'}`);
                    } else if (page.includes('/dining-spots')) {
                        result = await DiningSpot.findByIdAndUpdate(targetId, { $inc: { views: 1 } }, { new: true });
                        console.log(`[Analytics] DiningSpot update for ${targetId}: ${result ? 'Success (Views: ' + result.views + ')' : 'Not Found'}`);
                    } else if (page.includes('/blog')) {
                        result = await BlogPost.findByIdAndUpdate(targetId, { $inc: { views: 1 } }, { new: true });
                        console.log(`[Analytics] BlogPost update for ${targetId}: ${result ? 'Success (Views: ' + result.views + ')' : 'Not Found'}`);
                    } else {
                        console.log(`[Analytics] Page ${page} did not match any category for view increment.`);
                    }
                } catch (err) {
                    console.error("[Analytics] Error incrementing view count:", err);
                }
            }
        }

        res.status(201).json({ success: true });
    } catch (error) {
        console.error("Error logging analytics event:", error);
        // Don't block the frontend if analytics fails
        res.status(500).json({ message: 'Error logging event' });
    }
});

// @desc    Debug route to dump analytics events
// @route   GET /api/v1/stats/debug
// @access  Admin
router.get('/debug', verifyAdmin, async (req, res) => {
    try {
        const events = await AnalyticsEvent.find().sort({ timestamp: -1 }).limit(20);
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching debug data' });
    }
});

// @desc    Get aggregated analytics summary
// @route   GET /api/v1/stats/summary
// @access  Admin
router.get('/summary', verifyAdmin, async (req, res) => {
    try {
        // 1. Total views per category (Tourist Spots vs Dining vs Blog Posts)
        const touristSpotViews = await TouristSpot.aggregate([
            { $group: { _id: null, total: { $sum: "$views" } } }
        ]);
        const diningSpotViews = await DiningSpot.aggregate([
            { $group: { _id: null, total: { $sum: "$views" } } }
        ]);
        const blogPostViews = await BlogPost.aggregate([
            { $group: { _id: null, total: { $sum: "$views" } } }
        ]);

        // 2. Top 5 Most Viewed Tourist Spots
        const topTouristSpots = await TouristSpot.find()
            .sort({ views: -1 })
            .limit(5)
            .select('name views image');

        // 2b. Top 5 Most Viewed Dining Spots
        const topDiningSpots = await DiningSpot.find()
            .sort({ views: -1 })
            .limit(5)
            .select('name views image');

        // 3. Top 5 Most Viewed Blog Posts
        const topBlogPosts = await BlogPost.find()
            .sort({ views: -1 })
            .limit(5)
            .select('title views image');

        // 4. Average Dwell Time (from AnalyticsEvent)
        const avgDwellTime = await AnalyticsEvent.aggregate([
            { $match: { eventType: 'dwell', duration: { $exists: true, $gt: 0 } } },
            {
                $group: {
                    _id: "$page",
                    avgDuration: { $avg: "$duration" },
                    totalEvents: { $count: {} }
                }
            },
            { $sort: { avgDuration: -1 } }
        ]);

        // 5. Recent Activity (last 10 events)
        const recentActivity = await AnalyticsEvent.find()
            .sort({ timestamp: -1 })
            .limit(10);

        res.json({
            summary: {
                totalTouristSpotViews: touristSpotViews[0]?.total || 0,
                totalDiningSpotViews: diningSpotViews[0]?.total || 0,
                totalBlogPostViews: blogPostViews[0]?.total || 0,
            },
            topTouristSpots,
            topDiningSpots,
            topBlogPosts,
            avgDwellTime,
            recentActivity
        });
    } catch (error) {
        console.error("Error fetching analytics summary:", error);
        res.status(500).json({ message: 'Error fetching analytics summary' });
    }
});

export default router;
