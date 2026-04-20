import express from 'express';
const router = express.Router();
import { supabase } from '../config/supabase.js';
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

    const { error } = await supabase
      .from('chat_logs')
      .insert([{
        user_message: userMessage,
        bot_response: botResponse,
        is_intent: isIntent || true
      }]);

    if (error) throw error;
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
        const { eventType, targetId, page, metadata, duration } = req.body;
        console.log(`[Analytics] Incoming event: ${eventType}, target: ${targetId}, page: ${page}`);

        if (!eventType || !page) {
            return res.status(400).json({ message: 'Event type and page are required' });
        }

        // Fire and forget - insert event
        const { error: insertError } = await supabase
            .from('analytics_events')
            .insert([{
                event_type: eventType,
                target_id: targetId,
                page,
                duration,
                metadata
            }]);

        if (insertError) console.error("[Analytics] Log Error:", insertError);

        // If it's a 'view' event and targetId exists
        if (eventType === 'view' && targetId) {
            console.log(`[Analytics] View event received for ${targetId} on page ${page}`);
            try {
                if (page.includes('/tourist-spots')) {
                    await supabase.rpc('increment_view_count', { 
                        row_id: targetId, 
                        table_name: 'tourist_spots' 
                    });
                } else if (page.includes('/dining-spots')) {
                    await supabase.rpc('increment_view_count', { 
                        row_id: targetId, 
                        table_name: 'dining_spots' 
                    });
                } else if (page.includes('/blog')) {
                    await supabase.rpc('increment_view_count', { 
                        row_id: targetId, 
                        table_name: 'blog_posts' 
                    });
                }
            } catch (err) {
                console.error("[Analytics] Error incrementing view via RPC:", err);
            }
        }

        res.status(201).json({ success: true });
    } catch (error) {
        console.error("Error logging analytics event:", error);
        res.status(500).json({ message: 'Error logging event' });
    }
});

// @desc    Debug route to dump analytics events
// @route   GET /api/v1/stats/debug
// @access  Admin
router.get('/debug', verifyAdmin, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('analytics_events')
            .select('*')
            .order('timestamp', { ascending: false })
            .limit(20);
        
        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching debug data' });
    }
});

// @desc    Get aggregated analytics summary
// @route   GET /api/v1/stats/summary
// @access  Admin
router.get('/summary', verifyAdmin, async (req, res) => {
    try {
        // 1. Total views per category
        const { data: tsViews } = await supabase.from('tourist_spots').select('views');
        const { data: dsViews } = await supabase.from('dining_spots').select('views');
        const { data: bpViews } = await supabase.from('blog_posts').select('views');

        const totalTS = tsViews?.reduce((acc, v) => acc + (v.views || 0), 0) || 0;
        const totalDS = dsViews?.reduce((acc, v) => acc + (v.views || 0), 0) || 0;
        const totalBP = bpViews?.reduce((acc, v) => acc + (v.views || 0), 0) || 0;

        // 2. Top 5 Most Viewed Tourist Spots
        const { data: topTouristSpots } = await supabase
            .from('tourist_spots')
            .select('id, name, views, image')
            .order('views', { ascending: false })
            .limit(5);

        // 3. Top 5 Most Viewed Dining Spots
        const { data: topDiningSpots } = await supabase
            .from('dining_spots')
            .select('id, name, views, image')
            .order('views', { ascending: false })
            .limit(5);

        // 4. Top 5 Most Viewed Blog Posts
        const { data: topBlogPosts } = await supabase
            .from('blog_posts')
            .select('id, title, views, image')
            .order('views', { ascending: false })
            .limit(5);

        // Aggregating Dwell Time might be complex via query, returning legacy format or empty for now
        // Usually handled by a view or more complex RPC in Supabase

        // 5. Recent Activity
        const { data: recentActivity } = await supabase
            .from('analytics_events')
            .select('*')
            .order('timestamp', { ascending: false })
            .limit(10);

        res.json({
            summary: {
                totalTouristSpotViews: totalTS,
                totalDiningSpotViews: totalDS,
                totalBlogPostViews: totalBP,
            },
            topTouristSpots: topTouristSpots?.map(s => ({ ...s, _id: s.id })),
            topDiningSpots: topDiningSpots?.map(s => ({ ...s, _id: s.id })),
            topBlogPosts: topBlogPosts?.map(s => ({ ...s, _id: s.id })),
            avgDwellTime: [], // Placeholder for now
            recentActivity: recentActivity?.map(a => ({ ...a, _id: a.id }))
        });
    } catch (error) {
        console.error("Error fetching analytics summary:", error);
        res.status(500).json({ message: 'Error fetching analytics summary' });
    }
});

export default router;
