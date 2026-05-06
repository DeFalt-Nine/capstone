import './backend/loadEnv.js';
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createServer as createViteServer } from 'vite';

// Backend logic imports - Pointing into the backend folder
import authRoutes from './backend/routes/auth.js';
import healthRoutes from './backend/routes/health.js';
import uploadRoutes from './backend/routes/upload.js';
import chatbotRoutes from './backend/routes/chatbot.js';
import analyticsRoutes from './backend/routes/analytics.js';
import touristSpotsRoutes from './backend/routes/touristSpots.js';
import diningSpotsRoutes from './backend/routes/diningSpots.js';
import blogPostsRoutes from './backend/routes/blogPosts.js';
import eventsRoutes from './backend/routes/events.js';
import subscribersRoutes from './backend/routes/subscribers.js';
import reportsRoutes from './backend/routes/reports.js';
import siteSettingsRoutes from './backend/routes/siteSettings.js';
import adminLogsRoutes from './backend/routes/adminLogs.js';
import aiRoutes from './backend/routes/ai.js';
import jeepneyRoutes from './backend/routes/jeepneyRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(cors());
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Database Connection Middleware - Migrated to Supabase
  const ensureDbConnection = async (req, res, next) => {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({
        message: 'Server Configuration Error: Supabase credentials (URL/Key) are missing.'
      });
    }
    next();
  };

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/health', healthRoutes);
  app.use('/api/upload', uploadRoutes);
  app.use('/api/chatbot', ensureDbConnection, chatbotRoutes);
  app.use('/api/v1/stats', ensureDbConnection, analyticsRoutes);
  app.use('/api/tourist-spots', ensureDbConnection, touristSpotsRoutes);
  app.use('/api/dining-spots', ensureDbConnection, diningSpotsRoutes);
  app.use('/api/blog-posts', ensureDbConnection, blogPostsRoutes);
  app.use('/api/events', ensureDbConnection, eventsRoutes);
  app.use('/api/subscribers', ensureDbConnection, subscribersRoutes);
  app.use('/api/reports', ensureDbConnection, reportsRoutes);
  app.use('/api/site-settings', ensureDbConnection, siteSettingsRoutes);
  app.use('/api/admin-logs', ensureDbConnection, adminLogsRoutes);
  app.use('/api/jeepney-routes', ensureDbConnection, jeepneyRoutes);
  app.use('/api/ai', aiRoutes);
  
  // 404 for API routes
  app.all('/api/*', (req, res) => {
    console.log(`[API] 404 - Not Found: ${req.method} ${req.originalUrl}`);
    res.status(404).json({ message: `API route not found: ${req.method} ${req.originalUrl}` });
  });

  // Serve static uploads
  const uploadDir = path.join(__dirname, 'backend', 'uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  app.use('/uploads', express.static(uploadDir));

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production: serve static files from dist
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 Unified Server running on http://localhost:${PORT}`);
    console.log(`📡 API Base: http://localhost:${PORT}/api/`);
  });
}

startServer();
