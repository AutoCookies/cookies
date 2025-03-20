import {
    createPost
} from '../controllers/post.controller.js'
import { protectRoute } from '../middlewares/auth.middleware.js';
import express from 'express';
import upload from '../middlewares/upload.middleware.js';

const router = express.Router();

router.post("/create", protectRoute, upload.single("image"), createPost);

export default router;