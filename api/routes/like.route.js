import {
    likeComment,
    unlikeComment,
    likePost,
    unlikePost,
    checkUserLikedPosts
} from '../controllers/like.controller.js';
import express from 'express';

const router = express.Router();

router.post("/comment/:commentId/like", likeComment);
router.delete("/comment/:commentId/like", unlikeComment);
router.post("/post/:postId/like", likePost);
router.delete("/post/:postId/like", unlikePost);
router.post("/check", checkUserLikedPosts);

export default router;