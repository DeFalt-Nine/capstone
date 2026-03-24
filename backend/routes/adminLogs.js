
import express from 'express';
const router = express.Router();
import AdminLog from '../models/AdminLog.js';
import checkAdmin from '../middleware/auth.js';

// @desc    Fetch all admin logs
// @route   GET /api/admin-logs
router.get('/', checkAdmin, async (req, res) => {
  try {
    const logs = await AdminLog.find().sort({ timestamp: -1 }).limit(200);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

export default router;
