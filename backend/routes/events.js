import express from 'express';
const router = express.Router();
import { supabase } from '../config/supabase.js';
import { verifyAdmin } from '../middleware/auth.js';
import { deleteImage } from '../services/storageService.js';
import adminLogService from '../services/adminLogService.js';

const parseEvent = (event) => {
  if (!event) return null;
  const parsed = { ...event };
  delete parsed._id;
  delete parsed.id;
  delete parsed.createdAt;
  delete parsed.created_at;
  delete parsed.updated_at;
  return parsed;
};

const formatEvent = (e) => ({
  ...e,
  _id: e.id,
  createdAt: e.created_at
});

// @desc    Fetch all local events
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('local_events')
      .select('*')
      .order('date', { ascending: true });

    if (error) throw error;
    res.json(data.map(formatEvent));
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Create
router.post('/', verifyAdmin, async (req, res) => {
  try {
    const payload = parseEvent(req.body);
    const { data, error } = await supabase
      .from('local_events')
      .insert([payload])
      .select();

    if (error) throw error;
    const newEvent = data[0];
    
    // Log the action
    await adminLogService.logAdminAction({
      action: 'create',
      targetType: 'event',
      targetId: newEvent.id.toString(),
      targetName: newEvent.title,
      details: `Created new event: ${newEvent.title}`
    });

    res.status(201).json(formatEvent(newEvent));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Update
router.put('/:id', verifyAdmin, async (req, res) => {
  try {
    const payload = parseEvent(req.body);
    const { data, error } = await supabase
      .from('local_events')
      .update({ ...payload, updated_at: new Date() })
      .eq('id', req.params.id)
      .select();

    if (error) throw error;
    const updatedEvent = data[0];
    
    // Log the action
    await adminLogService.logAdminAction({
      action: 'update',
      targetType: 'event',
      targetId: updatedEvent.id.toString(),
      targetName: updatedEvent.title,
      details: `Updated event: ${updatedEvent.title}`
    });

    res.json(formatEvent(updatedEvent));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Delete
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    const { data: event, error: fetchError } = await supabase
      .from('local_events')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (fetchError || !event) return res.status(404).json({ message: 'Event not found' });

    // Delete image from storage
    if (event.image) {
        await deleteImage(event.image);
    }

    await supabase.from('local_events').delete().eq('id', req.params.id);

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
