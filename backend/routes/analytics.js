import express from 'express';
const router = express.Router();
import ChatLog from '../models/ChatLog.js';
import AnalyticsEvent from '../models/AnalyticsEvent.js';

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

        // Fire and forget - usually fast enough, but we await to catch errors
        await AnalyticsEvent.create({
            eventType,
            targetId,
            page,
            metadata
        });

        res.status(201).json({ success: true });
    } catch (error) {
        console.error("Error logging analytics event:", error);
        // Don't block the frontend if analytics fails
        res.status(500).json({ message: 'Error logging event' });
    }
});

export default router;
