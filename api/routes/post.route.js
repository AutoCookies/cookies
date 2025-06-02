import {
    createPost,
    getOwnPosts,
    updatePost,
    deletePost,
    sharePost,
    getAllPosts,
    updateSharePost,
    getPostsByUserId
} from '../controllers/post.controller.js'
import express from 'express';
import upload from '../middlewares/upload.middleware.js';
import { createPostLimiter, userRateLimiter } from '../middlewares/rateLimit.middleware.js';

const router = express.Router();

// Tạo một bài viết
router.post("/create", createPostLimiter, upload.single("image"), createPost);
// Lấy tất cả bài viết của cá nhân
router.get("/getown", userRateLimiter, getOwnPosts);
// Cập nhật một bài viết
router.put("/update/:postId/post", upload.single("image"), userRateLimiter, updatePost);
// Cập nhật một bài viết chia sẻ
router.put("/update/:sharePostId/sharepost", updateSharePost);
// Xóa một bài viết
router.delete("/delete/:postId", userRateLimiter, deletePost);
// Chia sẻ một bài viết
router.post("/:postId/share", userRateLimiter, sharePost);
// Lấy tất cả bài viết của tất cả user, không chỉ gồm public visibility
router.get("/", userRateLimiter, getAllPosts);
// Lầy tất cả bài Post của một user khi biết userId
router.get("/getPost/:userId", userRateLimiter, getPostsByUserId)

export default router;