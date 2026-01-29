
const express = require('express');
const router = express.Router();
const checkAdmin = require('../middleware/auth');

// @desc    Verify admin access code
// @route   POST /api/auth/verify
// @access  Public (protected by middleware)
router.post('/verify', checkAdmin, (req, res) => {
  // If checkAdmin passes, the token is valid
  res.status(200).json({ success: true, message: 'Authorized' });
});

module.exports = router;
