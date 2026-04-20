import express from 'express';
const router = express.Router();
import { supabase } from '../config/supabase.js';

// @desc    Subscribe to newsletter
// @route   POST /api/subscribers
// @access  Public
router.post('/', async (req, res) => {
  const { email } = req.body;

  if (!email || !email.includes('@')) {
    return res.status(400).json({ message: 'Please provide a valid email address.' });
  }

  try {
    const { error } = await supabase
      .from('subscribers')
      .upsert([{ email: email, source: 'newsletter' }], { onConflict: 'email' });

    if (error) throw error;

    res.status(201).json({ message: 'Successfully subscribed!' });
  } catch (error) {
    console.error('Subscription error:', error);
    res.status(500).json({ message: 'Server error during subscription.' });
  }
});

export default router;
