import {
    getAllPostsController,
    getAllSharePostsController,
    deletePostByIdController,
    deleteSharePostByIdController,
} from "../../controllers/moderator/post.controller.js";

import express from "express";
const router = express.Router();

router.get("/posts", getAllPostsController);
router.get("/shareposts", getAllSharePostsController);
router.delete("/posts/:postId", deletePostByIdController);
router.delete("/shareposts/:postId", deleteSharePostByIdController);

export default router;
