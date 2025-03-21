import {
    commentPost,
    deleteCommnet,
    editComment
} from '../controllers/comment.comtroller.js';
import { protectRoute } from "../middlewares/auth.middleware.js";
import express from 'express';

const router = express.Router();

router.post("/comment/:postId", protectRoute, commentPost);
router.delete("/comment/:commentId", protectRoute, deleteCommnet);
router.put("/comment/:commentId", protectRoute, editComment);

export default router;