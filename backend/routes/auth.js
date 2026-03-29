
import express from 'express';
const router = express.Router();
import { verifyAdmin } from '../middleware/auth.js';
import adminLogService from '../services/adminLogService.js';

// @desc    Verify admin access code
// @route   POST /api/auth/verify
router.post('/verify', verifyAdmin, async (req, res) => {
  console.log('[Auth] Token verified successfully.');
  
  // Log the login
  await adminLogService.logAdminAction({
    action: 'login',
    details: 'Admin verified access code successfully.'
  });

  res.status(200).json({ success: true, message: 'Authorized' });
});

// @desc    Log admin logout
// @route   POST /api/auth/logout
router.post('/logout', verifyAdmin, async (req, res) => {
  try {
    await adminLogService.logAdminAction({
      action: 'logout',
      details: 'Admin logged out'
    });
    res.json({ message: 'Logout logged' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

export default router;
