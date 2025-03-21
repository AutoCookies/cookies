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
import { checkBanStatus } from "../middlewares/checkBan.middleware.js";

const router = express.Router();

router.post("/create", protectRoute, checkBanStatus, upload.single("image"), createPost);
router.get("/getown", protectRoute, checkBanStatus, getOwnPosts);
router.put("/update/:postId", protectRoute, checkBanStatus, upload.single("image"), updatePost);
router.delete("/delete/:postId", protectRoute, checkBanStatus, deletePost);
router.post("/:postId/like", protectRoute, checkBanStatus, likePost);
router.delete("/:postId/like", protectRoute, checkBanStatus, unlikePost);
router.post("/:postId/share", protectRoute, checkBanStatus, sharePost);
router.get("/", protectRoute, checkBanStatus, getAllPosts);
router.post("/:postId/comment", protectRoute, checkBanStatus, commentPost);

export default router;