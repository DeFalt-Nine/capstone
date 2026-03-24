
import AdminLog from '../models/AdminLog.js';

const logAdminAction = async ({ action, targetType = 'system', targetId, targetName, details, adminEmail = 'admin' }) => {
  try {
    const log = new AdminLog({
      action,
      targetType,
      targetId,
      targetName,
      details,
      adminEmail,
      timestamp: new Date()
    });
    await log.save();
    console.log(`[AdminLog] ${action} logged.`);
  } catch (error) {
    console.error('[AdminLog] Failed to log action:', error.message);
  }
};

export default { logAdminAction };
