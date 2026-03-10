
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// ES Module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Explicitly load .env from the root directory
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

import { connectDB } from './config/db.js';
import { createServer as createViteServer } from 'vite';

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
import reportsRoutes from './routes/reports.js';

// Debug: Check if .env is loaded
console.log('--- Environment Check ---');
if (process.env.MONGO_URI) {
    // Mask password but show username and host for debugging
    const uri = process.env.MONGO_URI;
    const maskedUri = uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');
    console.log('✅ MONGO_URI found:', maskedUri);
    
    // Check for common issues
    if (!uri.includes('mongodb+srv://') && !uri.includes('mongodb://')) {
        console.warn('⚠️ MONGO_URI might be missing protocol (mongodb+srv://)');
    }
    
    // Check for special characters in password
    let passwordPart = '';
    try {
        const authPart = uri.split('://')[1]?.split('@')[0];
        if (authPart && authPart.includes(':')) {
            passwordPart = authPart.split(':').slice(1).join(':');
        }
    } catch (e) {
        // Ignore
    }
    
    if (passwordPart) {
        const specialChars = ['#', '?', '%', '@', ':', '/'];
        const foundChars = specialChars.filter(char => passwordPart.includes(char));
        if (foundChars.length > 0) {
            console.warn(`⚠️ Password contains special characters (${foundChars.join(', ')}). Ensure they are URL-encoded (e.g., # -> %23, @ -> %40).`);
        }
    }
    
    console.log('💡 TIP: If you get "authentication failed", ensure you are using the "Database User" password from Atlas, NOT your Atlas account password.');
    console.log('💡 TIP: Check if your IP is whitelisted in MongoDB Atlas (Network Access).');
    
    const urlParts = uri.split('/');
    const dbPart = urlParts[3] ? urlParts[3].split('?')[0] : '';
    if (!dbPart) {
        console.warn('⚠️ No database name specified in MONGO_URI (e.g., ...mongodb.net/myDatabase). Defaulting to "test".');
    } else {
        console.log('📂 Target Database:', dbPart);
    }
} else {
    console.log('❌ MONGO_URI is NOT defined in process.env');
    const envPath = path.resolve(__dirname, '..', '.env');
    if (fs.existsSync(envPath)) {
        console.log('Found .env file at:', envPath);
        console.log('Try adding "import dotenv from \'dotenv\'; dotenv.config({ path: \'../.env\' });" to server.js');
    } else {
        console.log('Could NOT find .env file at:', envPath);
    }
}
console.log('-------------------------\n');

const app = express();

async function startServer() {
// Middleware
app.use(cors()); 
app.use(express.json());

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Serve uploaded files statically
app.use('/uploads', express.static(uploadDir));

// Robust DB middleware
// This ensures we attempt to connect on every request if not connected,
// but prevents the server from crashing on startup if Mongo is down.
const ensureDbConnection = async (req, res, next) => {
  try {
    if (!process.env.MONGO_URI) {
        return res.status(500).json({ 
            message: 'Server Configuration Error: MONGO_URI is missing in .env file.' 
        });
    }
    await connectDB();
    next();
  } catch (error) {
    console.error('[Database] Connection failure:', error.message);
    res.status(503).json({ 
        message: 'Database connection failed. Please ensure MongoDB is running and your MONGO_URI is correct.',
        error: error.message 
    });
  }
};

// Define routes
console.log('Mounting routes...');

// 1. Auth (No DB required for secret code check if using env variable)
app.use('/api/auth', authRoutes);

// 2. Public Health Check
app.use('/api/health', healthRoutes);

// 3. File Uploads (No DB required)
app.use('/api/upload', uploadRoutes); 

// 4. Routes requiring Database
app.use('/api/chatbot', ensureDbConnection, chatbotRoutes);
app.use('/api/analytics', ensureDbConnection, analyticsRoutes);
app.use('/api/tourist-spots', ensureDbConnection, touristSpotsRoutes);
app.use('/api/dining-spots', ensureDbConnection, diningSpotsRoutes);
app.use('/api/blog-posts', ensureDbConnection, blogPostsRoutes);
app.use('/api/events', ensureDbConnection, eventsRoutes);
app.use('/api/subscribers', ensureDbConnection, subscribersRoutes);
app.use('/api/reports', ensureDbConnection, reportsRoutes); 

console.log('Routes mounted successfully.');

// Vite middleware for development
if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
        server: { 
            middlewareMode: true,
            watch: {
                // In some environments, we need to explicitly enable polling
                usePolling: true,
                interval: 100
            }
        },
        appType: 'spa',
    });
    app.use(vite.middlewares);

    // Manual fallback for index.html in development
    app.use('*', async (req, res, next) => {
        const url = req.originalUrl;
        try {
            // 1. Read index.html
            const templatePath = path.resolve(__dirname, '..', 'index.html');
            if (!fs.existsSync(templatePath)) {
                return next();
            }
            let template = fs.readFileSync(templatePath, 'utf-8');

            // 2. Apply Vite HTML transforms. This injects the Vite client, and also applies
            //    HTML transforms from Vite plugins, e.g. @vitejs/plugin-react
            template = await vite.transformIndexHtml(url, template);

            // 3. Send the transformed HTML back.
            res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
        } catch (e) {
            // If an error is caught, let Vite fix the stack trace so it maps back
            // to your actual source code.
            vite.ssrFixStacktrace(e);
            next(e);
        }
    });
} else {
    // Production: serve static files from dist (one level up from /backend)
    const distPath = path.join(__dirname, '..', 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
    });
}

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('--- SERVER ERROR ---');
    console.error('Path:', req.path);
    console.error('Error:', err.stack || err.message);
    if (!res.headersSent) {
        res.status(500).json({ 
            message: 'Internal Server Error. Check backend logs.',
            error: err.message 
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 Unified Server running on port ${PORT}`);
    console.log(`🔗 Local Access: http://localhost:${PORT}`);
    console.log(`📡 API Base: http://localhost:${PORT}/api/`);
    if (process.env.NODE_ENV === 'production') {
        console.log(`📂 Serving static files from: ${path.join(__dirname, '..', 'dist')}`);
    }
});
}

startServer();

export default app;
