import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';

// Import Models
import TouristSpot from './models/TouristSpot.js';
import DiningSpot from './models/DiningSpot.js';
import BlogPost from './models/BlogPost.js';
import LocalEvent from './models/LocalEvent.js';

// Import Data
import touristSpotsData from './data/touristSpotsData.js';
import diningSpotsData from './data/diningSpotsData.js';
import blogPostsData from './data/blogPostsData.js';
import eventsData from './data/eventsData.js';

const seedData = async () => {
  try {
    await connectDB();
    console.log('Connected to MongoDB for Seeding...');

    // --- Seed Tourist Spots ---
    try {
        await TouristSpot.deleteMany(); 
        await TouristSpot.insertMany(touristSpotsData);
        console.log('Tourist Spots Data Imported Successfully');
    } catch (err) { console.error('Error seeding Tourist Spots:', err.message); }

    // --- Seed Dining Spots (NEW) ---
    try {
        await DiningSpot.deleteMany(); 
        await DiningSpot.insertMany(diningSpotsData);
        console.log('Dining Spots Data Imported Successfully');
    } catch (err) { console.error('Error seeding Dining Spots:', err.message); }

    // --- Seed Blog Posts ---
    try {
        await BlogPost.deleteMany();
        await BlogPost.insertMany(blogPostsData);
        console.log('Blog Posts Data Imported Successfully');
    } catch (err) { console.error('Error seeding Blog Posts:', err.message); }

    // --- Seed Events ---
    try {
        await LocalEvent.deleteMany();
        await LocalEvent.insertMany(eventsData);
        console.log('Local Events Data Imported Successfully');
    } catch (err) { console.error('Error seeding Events:', err.message); }

    process.exit();
  } catch (error) {
    console.error(`Error with DB connection: ${error}`);
    process.exit(1);
  }
};

seedData();
