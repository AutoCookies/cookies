import {
    likeComment,
    unlikeComment,
    likePost,
    unlikePost,
    checkUserLikedPosts
} from '../controllers/like.controller.js';
import express from 'express';
import { userRateLimiter } from '../middlewares/rateLimit.middleware.js';

const router = express.Router();

router.post("/comment/:commentId/like", userRateLimiter, likeComment);
router.delete("/comment/:commentId/like", userRateLimiter, unlikeComment);
router.post("/post/:postId/like", userRateLimiter, likePost);
router.delete("/post/:postId/like", userRateLimiter, unlikePost);
router.post("/check", userRateLimiter, checkUserLikedPosts);

export default router;