import {
    commentPost,
    deleteCommnet,
    editComment,
    getCommentsByPost
} from '../controllers/comment.comtroller.js';
import express from 'express';

const router = express.Router();

router.post("/comment/:postId", commentPost);
router.delete("/comment/:commentId", deleteCommnet);
router.put("/comment/:commentId", editComment);
router.get("/:postId", getCommentsByPost);

export default router;