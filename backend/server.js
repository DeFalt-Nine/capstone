
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { connectDB } = require('./config/db');

const app = express();

// Middleware
app.use(cors()); 
app.use(express.json());

// Root health check (Directly accessible via browser at http://localhost:5000)
app.get('/', (req, res) => {
    res.send('Visit La Trinidad API Server is Running.');
});

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
app.use('/api/auth', require('./routes/auth'));

// 2. Public Health Check
app.use('/api/health', require('./routes/health'));

// 3. File Uploads (No DB required)
app.use('/api/upload', require('./routes/upload')); 

// 4. Routes requiring Database
app.use('/api/chatbot', ensureDbConnection, require('./routes/chatbot'));
app.use('/api/analytics', ensureDbConnection, require('./routes/analytics'));
app.use('/api/tourist-spots', ensureDbConnection, require('./routes/touristSpots'));
app.use('/api/dining-spots', ensureDbConnection, require('./routes/diningSpots'));
app.use('/api/blog-posts', ensureDbConnection, require('./routes/blogPosts'));
app.use('/api/events', ensureDbConnection, require('./routes/events'));
app.use('/api/subscribers', ensureDbConnection, require('./routes/subscribers'));
app.use('/api/reports', ensureDbConnection, require('./routes/reports')); 

console.log('Routes mounted successfully.');

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

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 API Server running on port ${PORT}`);
    console.log(`🔗 Local Access: http://localhost:${PORT}`);
    console.log(`📡 API Base: http://localhost:${PORT}/api/`);
    console.log(`📂 Uploads: http://localhost:${PORT}/uploads/\n`);
});

module.exports = app;
