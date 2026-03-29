
import './loadEnv.js';
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// ES Module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import { connectDB } from './config/db.js';

// Import routes
import authRoutes from './routes/auth.js';
import healthRoutes from './routes/health.js';
import uploadRoutes from './routes/upload.js';
import chatbotRoutes from './routes/chatbot.js';
import analyticsRoutes from './routes/analytics.js';
import touristSpotsRoutes from './routes/touristSpots.js';
import diningSpotsRoutes from './routes/diningSpots.js';
import blogPostsRoutes from './routes/blogPosts.js';
import eventsRoutes from './routes/events.js';
import subscribersRoutes from './routes/subscribers.js';
import reportRoutes from './routes/reports.js';
import adminLogRoutes from './routes/adminLogs.js';
import siteSettingsRoutes from './routes/siteSettings.js';

const app = express();

// Middleware
app.use(cors()); 
app.use(express.json());

// Ensure uploads directory exists (only in non-Vercel environment)
if (!process.env.VERCEL) {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)){
        fs.mkdirSync(uploadDir, { recursive: true });
    }
    // Serve uploaded files statically
    app.use('/uploads', express.static(uploadDir));
}

// Robust DB middleware
const ensureDbConnection = async (req, res, next) => {
  console.log(`[Backend] API Request: ${req.method} ${req.path}`);
  try {
    if (!process.env.MONGO_URI) {
        return res.status(500).json({ 
            message: 'Server Configuration Error: MONGO_URI is missing.' 
        });
    }
    await connectDB();
    next();
  } catch (error) {
    console.error('[Database] Connection failure:', error.message);
    res.status(503).json({ 
        message: 'Database connection failed.',
        error: error.message 
    });
  }
};

// Define routes
console.log('Mounting routes...');

// 1. Auth
app.use('/api/auth', authRoutes);

// 2. Public Health Check
app.use('/api/health', healthRoutes);

// 3. File Uploads
app.use('/api/upload', uploadRoutes); 

// 4. Global Database Middleware for all other API routes
app.use('/api', ensureDbConnection);

// 5. API Routes
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/v1/stats', analyticsRoutes);
app.use('/api/tourist-spots', touristSpotsRoutes);
app.use('/api/dining-spots', diningSpotsRoutes);
app.use('/api/blog-posts', blogPostsRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/subscribers', subscribersRoutes);
app.use('/api/reports', reportRoutes); 
app.use('/api/admin-logs', adminLogRoutes); 
app.use('/api/site-settings', siteSettingsRoutes); 

// 6. Catch-all for undefined API routes (must return JSON, not HTML)
app.all('/api/*', (req, res) => {
    res.status(404).json({ 
        message: `API Route not found: ${req.method} ${req.originalUrl}` 
    });
});

console.log('Routes mounted successfully.');

async function setupDevServer() {
    if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
        const { createServer: createViteServer } = await import('vite');
        const vite = await createViteServer({
            server: { 
                middlewareMode: true,
                watch: {
                    usePolling: true,
                    interval: 100
                }
            },
            appType: 'spa',
        });
        app.use(vite.middlewares);

        // Manual fallback for index.html in development
        app.use(async (req, res, next) => {
            const isApiRequest = req.path.startsWith('/api') || req.originalUrl.startsWith('/api');
            if (req.method !== 'GET' || isApiRequest) return next();
            
            const url = req.originalUrl;
            try {
                const templatePath = path.resolve(__dirname, '..', 'index.html');
                if (!fs.existsSync(templatePath)) return next();
                
                let template = fs.readFileSync(templatePath, 'utf-8');
                template = await vite.transformIndexHtml(url, template);
                res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
            } catch (e) {
                vite.ssrFixStacktrace(e);
                next(e);
            }
        });
    } else if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
        // Production (Non-Vercel): serve static files from dist
        const distPath = path.join(__dirname, '..', 'dist');
        app.use(express.static(distPath));
        app.get('*', (req, res) => {
            res.sendFile(path.join(distPath, 'index.html'));
        });
    }
}

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('--- SERVER ERROR ---');
    console.error('Path:', req.path);
    console.error('Error:', err.stack || err.message);
    if (!res.headersSent) {
        res.status(500).json({ 
            message: 'Internal Server Error.',
            error: err.message 
        });
    }
});

// Initialize Dev Server
await setupDevServer();

// Skip app.listen on Vercel
if (process.env.NODE_ENV === 'production' && process.env.VERCEL) {
    console.log('Running on Vercel - skipping app.listen');
} else {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`\n🚀 Unified Server running on port ${PORT}`);
        console.log(`🔗 Local Access: http://localhost:${PORT}`);
        console.log(`📡 API Base: http://localhost:${PORT}/api/`);
    });
}

export default app;
