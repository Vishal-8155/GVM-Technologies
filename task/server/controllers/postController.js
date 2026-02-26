const Post = require('../models/Post');

exports.createPost = async (req, res, next) => {
  try {
    let tags = req.body.tags;
    if (typeof tags === 'string') {
      try { tags = JSON.parse(tags); } catch { tags = tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : []; }
    }
    // Always link post to logged-in user; ignore any author/username from client
    const body = {
      title: req.body.title,
      content: req.body.content || '',
      tags: tags || [],
      author: req.user._id,
      username: req.user.username
    };
    if (req.file) body.image = '/uploads/' + req.file.filename;
    const post = await Post.create(body);
    const populated = await Post.findById(post._id).populate('author', 'username');
    res.status(201).json(populated);
  } catch (err) {
    next(err);
  }
};

exports.getPosts = async (req, res, next) => {
  try {
    const { search, page = 1, mine } = req.query;
    const limit = 5;
    const skip = (Number(page) - 1) * limit;
    let query = {};
    // Logged-in user sees only own posts when mine=1
    if (mine === '1' && req.user) {
      query.author = req.user._id;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } }
      ];
    }
    const [posts, total] = await Promise.all([
      Post.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit)
        .populate('author', 'username')
        .populate('comments.author', 'username')
        .populate('likes', 'username'),
      Post.countDocuments(query)
    ]);
    res.json({ posts, total, page: Number(page), totalPages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

exports.updatePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.author?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the creator can update this post' });
    }
    let tags = req.body.tags;
    if (typeof tags === 'string') {
      try { tags = JSON.parse(tags); } catch { tags = tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : []; }
    }
    if (req.body.title !== undefined) post.title = req.body.title;
    if (req.body.content !== undefined) post.content = req.body.content;
    if (tags !== undefined) post.tags = tags;
    if (req.file) post.image = '/uploads/' + req.file.filename;
    await post.save();
    const updated = await Post.findById(post._id).populate('author', 'username');
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

exports.deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.author?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the creator can delete this post' });
    }
    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: 'Post deleted' });
  } catch (err) {
    next(err);
  }
};

exports.toggleLike = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    const idx = post.likes.findIndex((id) => id.toString() === req.user._id.toString());
    if (idx >= 0) post.likes.splice(idx, 1);
    else post.likes.push(req.user._id);
    await post.save();
    const updated = await Post.findById(post._id).populate('likes', 'username');
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

exports.addComment = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    post.comments.push({ author: req.user._id, text: req.body.text });
    await post.save();
    const updated = await Post.findById(post._id)
      .populate('comments.author', 'username')
      .populate('author', 'username')
      .populate('likes', 'username');
    res.json(updated);
  } catch (err) {
    next(err);
  }
};
