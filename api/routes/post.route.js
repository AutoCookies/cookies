import {
    createPost,
    getOwnPosts,
    updatePost,
    deletePost,
    likePost,
    unlikePost,
    sharePost,
    getAllPosts,
    commentPost
} from '../controllers/post.controller.js'
import { protectRoute } from '../middlewares/auth.middleware.js';
import express from 'express';
import upload from '../middlewares/upload.middleware.js';

const router = express.Router();

router.post("/create", protectRoute, upload.single("image"), createPost);
router.get("/getown", protectRoute, getOwnPosts);
router.put("/update/:postId", protectRoute, upload.single("image"), updatePost);
router.delete("/delete/:postId", protectRoute, deletePost);
router.post("/:postId/like", protectRoute, likePost);
router.delete("/:postId/like", protectRoute, unlikePost);
router.post("/:postId/share", protectRoute, sharePost);
router.get("/", protectRoute, getAllPosts);
router.post("/:postId/comment", protectRoute, commentPost);

export default router;