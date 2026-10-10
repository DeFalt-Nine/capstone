import express from 'express';
const router = express.Router();
import { supabase } from '../config/supabase.js';
import { verifyAdmin } from '../middleware/auth.js';
import adminLogService from '../services/adminLogService.js';

// @desc    Create a report
// @route   POST /api/reports
router.post('/', async (req, res) => {
  try {
    const { targetId, targetName, targetType, reason, description, name, email, subject, message } = req.body;
    
    const finalName = targetName || name || 'General Spot';
    const finalReason = reason || subject || 'Inaccurate Information';
    const finalDesc = description || message || `Report regarding ${targetType || 'Spot'} (${targetId || ''})`;
    const finalCategory = targetType || 'TouristSpot';

    const { data, error } = await supabase
      .from('reports')
      .insert([{
        name: finalName,
        email: email || 'visitor@latrinidad.gov.ph',
        subject: finalReason,
        message: finalDesc,
        category: finalCategory,
        is_seen: false
      }])
      .select();

    if (error) throw error;
    const r = data[0];
    res.status(201).json({
      ...r,
      _id: r.id,
      targetId: targetId || r.id,
      targetName: r.name,
      targetType: r.category || 'TouristSpot',
      reason: r.subject || 'General',
      description: r.message || '',
      status: r.is_seen ? 'resolved' : 'pending',
      isSeen: Boolean(r.is_seen),
      createdAt: r.created_at
    });
  } catch (error) {
    console.error('[Reports Error]', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Get all reports (Admin)
// @route   GET /api/reports
router.get('/', verifyAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data.map(r => ({
      ...r,
      _id: r.id,
      targetName: r.name || 'Unknown Spot',
      targetType: r.category || 'TouristSpot',
      reason: r.subject || 'General Issue',
      description: r.message || 'No description provided',
      status: r.is_seen ? 'resolved' : 'pending',
      isSeen: Boolean(r.is_seen),
      createdAt: r.created_at
    })));
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Delete/Resolve a report
// @route   DELETE /api/reports/:id
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    const { data: report } = await supabase
      .from('reports')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (report) {
      await adminLogService.logAdminAction({
        action: 'resolve_report',
        targetType: 'report',
        targetId: report.id.toString(),
        targetName: report.name,
        details: `Resolved report for ${report.name} (Subject: ${report.subject})`
      });
    }
    
    await supabase.from('reports').delete().eq('id', req.params.id);
    res.json({ message: 'Report resolved/deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Mark report as seen
// @route   PUT /api/reports/:id/seen
router.put('/:id/seen', verifyAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('reports')
      .update({ is_seen: true })
      .eq('id', req.params.id)
      .select();
    
    if (error) throw error;
    const r = data[0];
    res.json({
      ...r,
      _id: r.id,
      targetName: r.name,
      targetType: r.category || 'TouristSpot',
      reason: r.subject,
      description: r.message,
      status: 'resolved',
      isSeen: true,
      createdAt: r.created_at
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

export default router;
