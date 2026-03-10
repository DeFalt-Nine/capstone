
import mongoose from 'mongoose';

export const connectDB = async () => {
  // If already connected, do nothing
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  const mongoURI = process.env.MONGO_URI;

  if (!mongoURI) {
    console.error('[Database] CRITICAL: MONGO_URI is not defined in environment variables.');
    console.error('[Database] Ensure your .env file exists in the root directory and contains MONGO_URI.');
    throw new Error('MONGO_URI is missing');
  }

  try {
    const conn = await mongoose.connect(mongoURI, {
        serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s for better user feedback
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[Database] Connection Error: ${error.message}`);
    if (error.message.includes('authentication failed')) {
        console.error('--- TROUBLESHOOTING AUTH ERROR ---');
        console.error('1. Ensure you are using a "Database User" (Atlas -> Database Access).');
        console.error('2. Ensure the password is for that specific user.');
        console.error('3. If the password has special characters like #, @, :, /, encode them (e.g., # -> %23).');
        console.error('4. Try adding a database name to your URI: ...mongodb.net/visit-la-trinidad?appName=...');
        console.error('-----------------------------------');
    } else if (error.message.includes('ETIMEDOUT') || error.message.includes('selection timeout')) {
        console.error('--- TROUBLESHOOTING TIMEOUT ---');
        console.error('1. Check if your current IP is whitelisted (Atlas -> Network Access).');
        console.error('2. Ensure "Allow Access from Anywhere" (0.0.0.0/0) is enabled for testing.');
        console.error('---------------------------------');
    }
    throw error; // Re-throw so middleware can handle it
  }
};
