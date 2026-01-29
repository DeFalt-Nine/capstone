const express = require('express');
const router = express.Router();

// @desc    Health check
// @route   GET /api/health
// @access  Public
router.get('/', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

module.exports = router;