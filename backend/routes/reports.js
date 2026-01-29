
const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const checkAdmin = require('../middleware/auth');

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
    await Report.findByIdAndDelete(req.params.id);
    res.json({ message: 'Report resolved/deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
