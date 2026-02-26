const express = require('express');
const router = express.Router();
const { createPost, getPosts, updatePost, deletePost, toggleLike, addComment } = require('../controllers/postController');
const { protect, optionalAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

const withUpload = (req, res, next) => {
  if (req.is('multipart/form-data')) return upload.single('image')(req, res, next);
  next();
};

router.get('/', optionalAuth, getPosts);
router.post('/', protect, withUpload, createPost);
router.put('/:id', protect, withUpload, updatePost);
router.delete('/:id', protect, deletePost);
router.post('/:id/like', protect, toggleLike);
router.post('/:id/comments', protect, addComment);

module.exports = router;
