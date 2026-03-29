import express from 'express';
const router = express.Router();
import BlogPost from '../models/BlogPost.js';
import { verifyAdmin } from '../middleware/auth.js';
import { deleteImage } from '../services/storageService.js';
import adminLogService from '../services/adminLogService.js';

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
router.post('/', verifyAdmin, async (req, res) => {
  try {
    const newPost = await BlogPost.create({
        ...req.body,
        status: 'approved' // Admin created posts are auto-approved
    });

    // Log the action
    await adminLogService.logAdminAction({
      action: 'create',
      targetType: 'blog-post',
      targetId: newPost._id.toString(),
      targetName: newPost.title,
      details: `Created new blog post: ${newPost.title}`
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
router.put('/:id', verifyAdmin, async (req, res) => {
  try {
    const oldPost = await BlogPost.findById(req.params.id);
    const updatedPost = await BlogPost.findByIdAndUpdate(req.params.id, req.body, { new: true });
    
    // Log the action
    let action = 'update';
    let details = `Updated blog post: ${updatedPost.title}`;
    
    if (oldPost.status !== updatedPost.status) {
      action = updatedPost.status === 'approved' ? 'approve' : 'reject';
      details = `${action.charAt(0).toUpperCase() + action.slice(1)}d blog post: ${updatedPost.title}`;
    }

    await adminLogService.logAdminAction({
      action,
      targetType: 'blog-post',
      targetId: updatedPost._id.toString(),
      targetName: updatedPost.title,
      details
    });

    res.json(updatedPost);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Delete (Admin)
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    // Delete image from storage
    if (post.image) {
        await deleteImage(post.image);
    }

    await BlogPost.findByIdAndDelete(req.params.id);

    // Log the action
    await adminLogService.logAdminAction({
      action: 'delete',
      targetType: 'blog-post',
      targetId: req.params.id,
      targetName: post.title,
      details: `Deleted blog post: ${post.title}`
    });

    res.json({ message: 'Post removed and image deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Mark blog post as seen
// @route   PUT /api/blog-posts/:id/seen
router.put('/:id/seen', verifyAdmin, async (req, res) => {
  try {
    const post = await BlogPost.findByIdAndUpdate(req.params.id, { isSeen: true }, { new: true });
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

export default router;
