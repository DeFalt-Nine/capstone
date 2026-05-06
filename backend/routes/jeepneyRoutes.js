import express from 'express';
const router = express.Router();
import { supabase } from '../config/supabase.js';
import { verifyAdmin } from '../middleware/auth.js';
import adminLogService from '../services/adminLogService.js';

// @desc    Fetch all jeepney routes
// @route   GET /api/jeepney-routes
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('jeepney_routes')
      .select('*');

    if (error) throw error;
    
    const formatted = data.map(route => ({
        ...route,
        _id: route.id,
        routeMapUrl: route.route_map_url,
        operatingHours: route.operating_hours
    }));
    res.json(formatted);
  } catch (error) { 
    console.error("Error fetching jeepney routes:", error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Create a jeepney route
// @route   POST /api/jeepney-routes
router.post('/', verifyAdmin, async (req, res) => {
  try {
    const { _id, id, ...payload } = req.body;
    
    // Mapping camelCase to snake_case if needed
    const dbPayload = {
        name: payload.name,
        signboard: payload.signboard,
        terminal: payload.terminal,
        route_map_url: payload.routeMapUrl,
        fare: payload.fare,
        path: payload.path,
        operating_hours: payload.operatingHours,
        frequency: payload.frequency
    };

    const { data, error } = await supabase
      .from('jeepney_routes')
      .insert([dbPayload])
      .select();

    if (error) throw error;
    const newRoute = data[0];
    
    await adminLogService.logAdminAction({
      action: 'create',
      targetType: 'jeepney-route',
      targetId: newRoute.id.toString(),
      targetName: newRoute.name,
      details: `Created new jeepney route: ${newRoute.name}`
    });

    res.status(201).json({ ...newRoute, _id: newRoute.id });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Update a jeepney route
// @route   PUT /api/jeepney-routes/:id
router.put('/:id', verifyAdmin, async (req, res) => {
  try {
    const { _id, id, created_at, updated_at, ...payload } = req.body;
    
    const dbPayload = {
        name: payload.name,
        signboard: payload.signboard,
        terminal: payload.terminal,
        route_map_url: payload.routeMapUrl,
        fare: payload.fare,
        path: payload.path,
        operating_hours: payload.operatingHours,
        frequency: payload.frequency,
        updated_at: new Date()
    };

    const { data, error } = await supabase
      .from('jeepney_routes')
      .update(dbPayload)
      .eq('id', req.params.id)
      .select();

    if (error) throw error;
    if (!data || data.length === 0) return res.status(404).json({ message: 'Route not found' });
    
    const updatedRoute = data[0];
    
    await adminLogService.logAdminAction({
      action: 'update',
      targetType: 'jeepney-route',
      targetId: updatedRoute.id.toString(),
      targetName: updatedRoute.name,
      details: `Updated jeepney route: ${updatedRoute.name}`
    });

    res.json({ ...updatedRoute, _id: updatedRoute.id });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Delete a jeepney route
// @route   DELETE /api/jeepney-routes/:id
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    const { data: route, error: fetchError } = await supabase
      .from('jeepney_routes')
      .select('name')
      .eq('id', req.params.id)
      .single();

    const { error: deleteError } = await supabase
      .from('jeepney_routes')
      .delete()
      .eq('id', req.params.id);

    if (deleteError) throw deleteError;

    await adminLogService.logAdminAction({
      action: 'delete',
      targetType: 'jeepney-route',
      targetId: req.params.id,
      targetName: route?.name || 'Unknown',
      details: `Deleted jeepney route: ${route?.name}`
    });

    res.json({ message: 'Jeepney route removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
