
const mongoose = require('mongoose');

const connectDB = async () => {
  // If already connected, do nothing
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  const mongoURI = process.env.MONGO_URI;

  try {
    const conn = await mongoose.connect(mongoURI, {
        serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s for better user feedback
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[Database] Connection Error: ${error.message}`);
    throw error; // Re-throw so middleware can handle it
  }
};

module.exports = { connectDB };
