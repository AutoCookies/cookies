import {
    likeComment,
    unlikeComment,
    likePost,
    unlikePost,
} from '../controllers/like.controller.js';
import express from 'express';

const router = express.Router();

router.post("/comment/:commentId/like", likeComment);
router.delete("/comment/:commentId/unlike", unlikeComment);
router.post("/post/:postId/like", likePost);
router.delete("/post/:postId/unlike", unlikePost);

export default router;