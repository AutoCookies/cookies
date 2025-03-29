import {
    createPost,
    getOwnPosts,
    updatePost,
    deletePost,
    sharePost,
    getAllPosts,
    updateSharePost
} from '../controllers/post.controller.js'
import express from 'express';
import upload from '../middlewares/upload.middleware.js';
import { createPostLimiter } from '../middlewares/rateLimit.middleware.js';

const router = express.Router();

router.post("/create", createPostLimiter, upload.single("image"), createPost);
router.get("/getown", getOwnPosts);
router.put("/update/:postId/post", upload.single("image"), updatePost);
router.put("/update/:sharePostId/sharepost", updateSharePost);
router.delete("/delete/:postId", deletePost);
router.post("/:postId/share", sharePost);
router.get("/", getAllPosts);

export default router;