
import express from 'express';
const router = express.Router();
import { supabase } from '../config/supabase.js';
import { verifyAdmin } from '../middleware/auth.js';

// @desc    Fetch all admin logs
// @route   GET /api/admin-logs
router.get('/', verifyAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('admin_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);

    if (error) throw error;
    res.json(data.map(l => ({ ...l, _id: l.id, timestamp: l.created_at })));
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

export default router;
