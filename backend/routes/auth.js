
import express from 'express';
const router = express.Router();
import checkAdmin from '../middleware/auth.js';

// @desc    Verify admin access code
// @route   POST /api/auth/verify
router.post('/verify', checkAdmin, (req, res) => {
  console.log('[Auth] Token verified successfully.');
  res.status(200).json({ success: true, message: 'Authorized' });
});

export default router;
