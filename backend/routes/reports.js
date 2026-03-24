import express from 'express';
const router = express.Router();
import Report from '../models/Report.js';
import checkAdmin from '../middleware/auth.js';
import adminLogService from '../services/adminLogService.js';

// @desc    Create a report
// @route   POST /api/reports
router.post('/', async (req, res) => {
  try {
    const { targetId, targetName, targetType, reason, description } = req.body;
    if (!targetId || !reason) return res.status(400).json({ message: 'Missing required fields' });

    const newReport = await Report.create({
      targetId,
      targetName,
      targetType,
      reason,
      description
    });
    res.status(201).json(newReport);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Get all reports (Admin)
// @route   GET /api/reports
router.get('/', checkAdmin, async (req, res) => {
  try {
    const reports = await Report.find().sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Delete/Resolve a report
// @route   DELETE /api/reports/:id
router.delete('/:id', checkAdmin, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (report) {
      // Log the action
      await adminLogService.logAdminAction({
        action: 'resolve_report',
        targetType: 'report',
        targetId: report._id.toString(),
        targetName: report.targetName,
        details: `Resolved report for ${report.targetName} (Reason: ${report.reason})`
      });
    }
    
    await Report.findByIdAndDelete(req.params.id);
    res.json({ message: 'Report resolved/deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

export default router;
