
const express = require('express');
const router = express.Router();
const BlogPost = require('../models/BlogPost');
const checkAdmin = require('../middleware/auth');

// @desc    Fetch blog posts
// @route   GET /api/blog-posts?mode=admin
router.get('/', async (req, res) => {
  try {
    const isAdmin = req.query.mode === 'admin';
    
    // Public users see 'approved' posts OR posts with no status (legacy support)
    // Admin sees everything
    let query = isAdmin 
        ? {} 
        : { 
            $or: [
                { status: 'approved' },
                { status: { $exists: false } } 
            ] 
          };
    
    const posts = await BlogPost.find(query).sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Create (Admin direct post)
router.post('/', checkAdmin, async (req, res) => {
  try {
    const newPost = await BlogPost.create({
        ...req.body,
        status: 'approved' // Admin created posts are auto-approved
    });
    res.status(201).json(newPost);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Submit Public Post (User)
// @route   POST /api/blog-posts/submit
router.post('/submit', async (req, res) => {
    try {
        const { title, description, content, author, email, image, socialLink, videoLink } = req.body;

        if (!title || !content || !author || !email || !image) {
            return res.status(400).json({ message: "Missing required fields." });
        }

        const newPost = await BlogPost.create({
            title,
            description,
            content, // In a real app, sanitize this HTML!
            author,
            email,
            image,
            socialLink,
            videoLink,
            alt: title,
            badge: 'Community Story',
            readTime: '3 min read', // Default for now
            date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
            status: 'pending' // Crucial: Always pending for public submissions
        });

        res.status(201).json({ message: "Story submitted successfully! It is pending review.", post: newPost });
    } catch (error) {
        console.error("Submission error:", error);
        res.status(500).json({ message: "Server error during submission." });
    }
});

// @desc    Update (Admin - Status Change, Edit)
router.put('/:id', checkAdmin, async (req, res) => {
  try {
    const updatedPost = await BlogPost.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedPost);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Delete (Admin)
router.delete('/:id', checkAdmin, async (req, res) => {
  try {
    await BlogPost.findByIdAndDelete(req.params.id);
    res.json({ message: 'Post removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
