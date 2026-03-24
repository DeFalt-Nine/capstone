
import mongoose from 'mongoose';

const AdminLogSchema = new mongoose.Schema({
  action: { type: String, required: true }, // 'login', 'logout', 'create', 'update', 'delete', 'approve', 'reject', 'resolve_report'
  targetType: { type: String, required: false }, // 'tourist-spot', 'dining-spot', 'blog-post', 'event', 'report'
  targetId: { type: String, required: false },
  targetName: { type: String, required: false },
  details: { type: String, required: false },
  adminEmail: { type: String, required: false }, // If we had multiple admins, for now just 'admin'
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.models.AdminLog || mongoose.model('AdminLog', AdminLogSchema, 'adminlogs');
