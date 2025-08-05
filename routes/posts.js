const express = require('express');
const Post = require('../models/Post');
const { authenticateAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all posts (public)
router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 0;
    const posts = await Post.find({ published: true })
      .sort({ createdAt: -1 })
      .limit(limit);
    
    console.log(posts)
    res.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single post by slug (public)
router.get('/:slug', async (req, res) => {
  try {
    const post = await Post.findOne({ slug: req.params.slug, published: true });
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Increment view count
    post.views += 1;
    await post.save();
    console.log(post)

    res.json(post);
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new post (admin only)
router.post('/', authenticateAdmin, async (req, res) => {
  try {
    const { title, slug, description, content, image } = req.body;

    if (!title || !slug || !description || !content) {
      return res.status(400).json({ message: 'Title, slug, description, and content are required' });
    }

    // Check if slug already exists
    const existingPost = await Post.findOne({ slug });
    if (existingPost) {
      return res.status(400).json({ message: 'A post with this slug already exists' });
    }

    const post = new Post({
      title,
      slug,
      description,
      content,
      image: image || ''
    });

    await post.save();
    res.status(201).json(post);
  } catch (error) {
    console.error('Error creating post:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'A post with this slug already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Update post (admin only)
router.put('/:id', authenticateAdmin, async (req, res) => {
  try {
    const { title, slug, description, content, image, published } = req.body;
    
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // If slug is being changed, check for conflicts
    if (slug && slug !== post.slug) {
      const existingPost = await Post.findOne({ slug, _id: { $ne: req.params.id } });
      if (existingPost) {
        return res.status(400).json({ message: 'A post with this slug already exists' });
      }
    }

    post.title = title || post.title;
    post.slug = slug || post.slug;
    post.description = description || post.description;
    post.content = content || post.content;
    post.image = image !== undefined ? image : post.image;
    post.published = published !== undefined ? published : post.published;

    await post.save();
    res.json(post);
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete post (admin only)
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;