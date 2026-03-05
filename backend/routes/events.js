import express from 'express';
const router = express.Router();
import LocalEvent from '../models/LocalEvent.js';
import checkAdmin from '../middleware/auth.js';

// @desc    Fetch all local events
router.get('/', async (req, res) => {
  try {
    const events = await LocalEvent.find();
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Create
router.post('/', checkAdmin, async (req, res) => {
  try {
    const newEvent = await LocalEvent.create(req.body);
    res.status(201).json(newEvent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Update
router.put('/:id', checkAdmin, async (req, res) => {
  try {
    const updatedEvent = await LocalEvent.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedEvent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Delete
router.delete('/:id', checkAdmin, async (req, res) => {
  try {
    await LocalEvent.findByIdAndDelete(req.params.id);
    res.json({ message: 'Event removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
