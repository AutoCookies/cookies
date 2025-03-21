import {
    likeComment,
    unlikeComment,
    likePost,
    unlikePost,
} from '../controllers/like.controller.js';
import express from 'express';
import { protectRoute } from "../middlewares/auth.middleware.js";
import { checkBanStatus } from "../middlewares/checkBan.middleware.js";

const router = express.Router();

router.post("/like/:commentId", protectRoute, checkBanStatus, likeComment);
router.post("unlike/:commentId", protectRoute, checkBanStatus, unlikeComment);
router.post("/:postId/like", protectRoute, checkBanStatus, likePost);
router.delete("/:postId/like", protectRoute, checkBanStatus, unlikePost);

export default router;