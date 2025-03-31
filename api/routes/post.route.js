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
import { createPostLimiter } from '../middlewares/rateLimit.middleware.js';

const router = express.Router();

// Tạo một bài viết
router.post("/create", createPostLimiter, upload.single("image"), createPost);
// Lấy tất cả bài viết của cá nhân
router.get("/getown", getOwnPosts);
// Cập nhật một bài viết
router.put("/update/:postId/post", upload.single("image"), updatePost);
// Cập nhật một bài viết chia sẻ
router.put("/update/:sharePostId/sharepost", updateSharePost);
// Xóa một bài viết
router.delete("/delete/:postId", deletePost);
// Chia sẻ một bài viết
router.post("/:postId/share", sharePost);
// Lấy tất cả bài viết của tất cả user, không chỉ gồm public visibility
router.get("/", getAllPosts);
// Lầy tất cả bài Post của một user khi biết userId
router.get("/getPost/:userId", getPostsByUserId)

export default router;