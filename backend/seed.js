
require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB } = require('./config/db');

// Import Models
const TouristSpot = require('./models/TouristSpot');
const DiningSpot = require('./models/DiningSpot'); // NEW
const BlogPost = require('./models/BlogPost');
const LocalEvent = require('./models/LocalEvent');

// Import Data
const touristSpotsData = require('./data/touristSpotsData');
const diningSpotsData = require('./data/diningSpotsData'); // NEW
const blogPostsData = require('./data/blogPostsData');
const eventsData = require('./data/eventsData');

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