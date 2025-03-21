import express from "express";
import { 
    getAllUsers,
    deleteUser,
    getUserProfile,
    createAccount,
    adminDeletePost,
    getAllPostsForAdmin,
    searchUserByName,
    banUser
} from '../controllers/admin.controller.js'
import { protectRoute, isAdmin } from "../middlewares/auth.middleware.js";
import { checkBanStatus } from '../middlewares/checkBan.middleware.js';

const router = express.Router();

router.get("/users/:id", protectRoute, isAdmin, checkBanStatus, getUserProfile);
router.get("/users", protectRoute, isAdmin,checkBanStatus, getAllUsers);
router.delete("/users/:id", protectRoute, isAdmin,checkBanStatus, deleteUser);
router.post("/users", protectRoute, isAdmin,checkBanStatus, createAccount);
router.get("/search/user", protectRoute, isAdmin,checkBanStatus, searchUserByName);
router.get("/posts", protectRoute, isAdmin,checkBanStatus, getAllPostsForAdmin);
router.delete("/posts/:postId", protectRoute, isAdmin,checkBanStatus, adminDeletePost);
router.post("/users/:userId/ban", protectRoute, isAdmin,checkBanStatus, banUser);

export default router;