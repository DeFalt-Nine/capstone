
const express = require('express');
const router = express.Router();
const Subscriber = require('../models/Subscriber');

// @desc    Subscribe to newsletter
// @route   POST /api/subscribers
// @access  Public
router.post('/', async (req, res) => {
  const { email } = req.body;

  if (!email || !email.includes('@')) {
    return res.status(400).json({ message: 'Please provide a valid email address.' });
  }

  try {
    // Use findOneAndUpdate with upsert to prevent duplicates without throwing an error
    await Subscriber.findOneAndUpdate(
      { email: email },
      { $setOnInsert: { email: email, source: 'newsletter' } },
      { upsert: true, new: true }
    );

    res.status(201).json({ message: 'Successfully subscribed!' });
  } catch (error) {
    console.error('Subscription error:', error);
    res.status(500).json({ message: 'Server error during subscription.' });
  }
});

module.exports = router;
