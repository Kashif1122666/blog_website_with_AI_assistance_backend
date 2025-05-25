import express from 'express';
import {
  createPost,
  getPosts,
  getMyPosts,
  updatePost,
  deletePost,
   generatePostContent,
} from '../controllers/postController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();
router.get('/', getPosts);

// Protected routes
router.get('/my-posts', protect, getMyPosts);

router.post('/create', protect, createPost);
router.put('/update/:id', protect, updatePost);
router.delete('/delete/:id', protect, deletePost);
router.post('/generate', protect, generatePostContent);

export default router;
