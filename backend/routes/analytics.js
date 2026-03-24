import express from 'express';
const router = express.Router();
import ChatLog from '../models/ChatLog.js';
import AnalyticsEvent from '../models/AnalyticsEvent.js';
import TouristSpot from '../models/TouristSpot.js';
import BlogPost from '../models/BlogPost.js';
import mongoose from 'mongoose';

// @desc    Log a chat interaction (used for frontend intents)
// @route   POST /api/analytics/chat
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
// @route   POST /api/analytics/event
// @access  Public
router.post('/event', async (req, res) => {
    try {
        const { eventType, targetId, page, metadata } = req.body;

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
            try {
                if (page.includes('/tourist-spots')) {
                    await TouristSpot.findByIdAndUpdate(targetId, { $inc: { views: 1 } });
                } else if (page.includes('/blog')) {
                    await BlogPost.findByIdAndUpdate(targetId, { $inc: { views: 1 } });
                }
            } catch (err) {
                console.error("Error incrementing view count:", err);
            }
        }

        res.status(201).json({ success: true });
    } catch (error) {
        console.error("Error logging analytics event:", error);
        // Don't block the frontend if analytics fails
        res.status(500).json({ message: 'Error logging event' });
    }
});

// @desc    Get aggregated analytics summary
// @route   GET /api/analytics/summary
// @access  Admin (should be protected, but for now we'll keep it simple as the admin page handles auth)
router.get('/summary', async (req, res) => {
    try {
        // 1. Total views per category (Tourist Spots vs Blog Posts)
        const touristSpotViews = await TouristSpot.aggregate([
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
                totalBlogPostViews: blogPostViews[0]?.total || 0,
            },
            topTouristSpots,
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
