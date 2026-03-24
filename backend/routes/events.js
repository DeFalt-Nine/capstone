import express from 'express';
const router = express.Router();
import LocalEvent from '../models/LocalEvent.js';
import checkAdmin from '../middleware/auth.js';
import { deleteImage } from '../services/storageService.js';
import adminLogService from '../services/adminLogService.js';

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
    
    // Log the action
    await adminLogService.logAdminAction({
      action: 'create',
      targetType: 'event',
      targetId: newEvent._id.toString(),
      targetName: newEvent.title,
      details: `Created new event: ${newEvent.title}`
    });

    res.status(201).json(newEvent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Update
router.put('/:id', checkAdmin, async (req, res) => {
  try {
    const updatedEvent = await LocalEvent.findByIdAndUpdate(req.params.id, req.body, { new: true });
    
    // Log the action
    await adminLogService.logAdminAction({
      action: 'update',
      targetType: 'event',
      targetId: updatedEvent._id.toString(),
      targetName: updatedEvent.title,
      details: `Updated event: ${updatedEvent.title}`
    });

    res.json(updatedEvent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Delete
router.delete('/:id', checkAdmin, async (req, res) => {
  try {
    const event = await LocalEvent.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    // Delete image from storage
    if (event.image) {
        await deleteImage(event.image);
    }

    await LocalEvent.findByIdAndDelete(req.params.id);

    // Log the action
    await adminLogService.logAdminAction({
      action: 'delete',
      targetType: 'event',
      targetId: req.params.id,
      targetName: event.title,
      details: `Deleted event: ${event.title}`
    });

    res.json({ message: 'Event removed and image deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
