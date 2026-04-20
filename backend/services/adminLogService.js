
import { supabase } from '../config/supabase.js';

const logAdminAction = async ({ action, targetType = 'system', targetId, targetName, details, adminEmail = 'admin' }) => {
  try {
    if (!supabase) return;

    const { error } = await supabase
      .from('admin_logs')
      .insert([{
        action,
        target_type: targetType,
        target_id: targetId,
        target_name: targetName,
        details,
        admin_id: adminEmail // mapped for now
      }]);

    if (error) throw error;
    console.log(`[AdminLog] ${action} logged to Supabase.`);
  } catch (error) {
    console.error('[AdminLog] Failed to log action:', error.message);
  }
};

export default { logAdminAction };
