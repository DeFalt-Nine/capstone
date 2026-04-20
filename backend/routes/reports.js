import express from 'express';
const router = express.Router();
import { supabase } from '../config/supabase.js';
import { verifyAdmin } from '../middleware/auth.js';
import adminLogService from '../services/adminLogService.js';

// @desc    Create a report
// @route   POST /api/reports
router.post('/', async (req, res) => {
  try {
    const { targetId, targetName, targetType, reason, description } = req.body;
    // Note: Our reports table in Supabase schema has slightly different column names in my proposed migration,
    // let's adjust to match the schema or make schema match the needs.
    // I defined schema for reports as name, email, subject, message earlier.
    // Let's use a more generic structure or stick to what the frontend sends.
    
    const { data, error } = await supabase
      .from('reports')
      .insert([{
        name: targetName || 'System',
        email: 'info@latrinidad.gov.ph',
        subject: reason,
        message: description || `Report on ${targetType} (${targetId})`,
        category: targetType
      }])
      .select();

    if (error) throw error;
    res.status(201).json({ ...data[0], _id: data[0].id });
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
    res.json(data.map(r => ({ ...r, _id: r.id, createdAt: r.created_at })));
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
    res.json({ ...data[0], _id: data[0].id });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

export default router;
