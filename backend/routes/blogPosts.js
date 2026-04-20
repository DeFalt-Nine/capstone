import express from 'express';
const router = express.Router();
import { supabase } from '../config/supabase.js';
import { verifyAdmin } from '../middleware/auth.js';
import { deleteImage } from '../services/storageService.js';
import adminLogService from '../services/adminLogService.js';

// @desc    Fetch blog posts
// @route   GET /api/blog-posts?mode=admin
router.get('/', async (req, res) => {
  try {
    const isAdmin = req.query.mode === 'admin';
    
    let query = supabase.from('blog_posts').select('*');
    
    if (!isAdmin) {
       // Filter for approved posts for public
       query = query.filter('status', 'eq', 'approved');
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data.map(p => ({ ...p, _id: p.id, createdAt: p.created_at })));
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Fetch blog posts by user email
// @route   GET /api/blog-posts/user/:email
router.get('/user/:email', async (req, res) => {
  try {
    const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('email', req.params.email)
        .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data.map(p => ({ ...p, _id: p.id, createdAt: p.created_at })));
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Create (Admin direct post)
router.post('/', verifyAdmin, async (req, res) => {
  try {
    const { _id, ...payload } = req.body;
    const { data, error } = await supabase
        .from('blog_posts')
        .insert([{
            ...payload,
            status: 'approved'
        }])
        .select();

    if (error) throw error;
    const newPost = data[0];

    // Log the action
    await adminLogService.logAdminAction({
      action: 'create',
      targetType: 'blog-post',
      targetId: newPost.id.toString(),
      targetName: newPost.title,
      details: `Created new blog post: ${newPost.title}`
    });

    res.status(201).json({ ...newPost, _id: newPost.id });
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

        const { data, error } = await supabase
            .from('blog_posts')
            .insert([{
                title,
                description,
                content,
                author,
                email,
                image,
                social_link: socialLink,
                video_link: videoLink,
                alt: title,
                badge: 'Community Story',
                status: 'pending'
            }])
            .select();

        if (error) throw error;
        const newPost = data[0];

        res.status(201).json({ message: "Story submitted successfully! It is pending review.", post: { ...newPost, _id: newPost.id } });
    } catch (error) {
        console.error("Submission error:", error);
        res.status(500).json({ message: "Server error during submission." });
    }
});

// @desc    Update (Admin - Status Change, Edit)
router.put('/:id', verifyAdmin, async (req, res) => {
  try {
    const { data: oldPost } = await supabase.from('blog_posts').select('*').eq('id', req.params.id).single();
    if (!oldPost) return res.status(404).json({ message: 'Post not found' });

    const { _id, id, created_at, ...payload } = req.body;
    const { data: updatedPostData, error } = await supabase
        .from('blog_posts')
        .update({ ...payload, updated_at: new Date() })
        .eq('id', req.params.id)
        .select();

    if (error) throw error;
    const updatedPost = updatedPostData[0];
    
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
      targetId: updatedPost.id.toString(),
      targetName: updatedPost.title,
      details
    });

    res.json({ ...updatedPost, _id: updatedPost.id });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Delete (Admin)
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    const { data: post } = await supabase.from('blog_posts').select('*').eq('id', req.params.id).single();
    if (!post) return res.status(404).json({ message: 'Post not found' });

    // Delete image from storage
    if (post.image) {
        await deleteImage(post.image);
    }

    await supabase.from('blog_posts').delete().eq('id', req.params.id);

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
    const { data, error } = await supabase
        .from('blog_posts')
        .update({ is_seen: true })
        .eq('id', req.params.id)
        .select();
    
    if (error) throw error;
    res.json({ ...data[0], _id: data[0].id });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

export default router;
