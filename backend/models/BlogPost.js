
const mongoose = require('mongoose');

const BlogPostSchema = new mongoose.Schema({
  image: { type: String, required: true },
  alt: { type: String, required: true },
  badge: { type: String, required: true },
  readTime: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  author: { type: String, required: true },
  date: { type: String, required: true },
  content: { type: String, required: true }, // HTML content for the full article
  
  // Submission Workflow
  status: { 
    type: String, 
    enum: ['approved', 'pending', 'rejected'], 
    default: 'approved' // Seeded data is approved by default
  },
  email: { type: String, required: false }, // Private contact for the author
  socialLink: { type: String, required: false }, // Public link to their profile
  videoLink: { type: String, required: false }, // Optional YouTube/TikTok link
  adminFeedback: { type: String, required: false } // Notes from admin
}, { timestamps: true });

module.exports = mongoose.models.BlogPost || mongoose.model('BlogPost', BlogPostSchema, 'blogposts');
