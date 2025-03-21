import {
    createPost,
    getOwnPosts,
    updatePost,
    deletePost,
    sharePost,
    getAllPosts,
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
router.post("/:postId/share", protectRoute, checkBanStatus, sharePost);
router.get("/", protectRoute, checkBanStatus, getAllPosts);

export default router;