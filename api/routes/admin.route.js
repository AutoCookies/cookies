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

const router = express.Router();

router.get("/users/:id", protectRoute, isAdmin, getUserProfile);
router.get("/users", protectRoute, isAdmin, getAllUsers);
router.delete("/users/:id", protectRoute, isAdmin, deleteUser);
router.post("/users", protectRoute, isAdmin, createAccount);
router.get("/search/user", protectRoute, isAdmin, searchUserByName);
router.get("/posts", protectRoute, isAdmin, getAllPostsForAdmin);
router.delete("/posts/:postId", protectRoute, isAdmin, adminDeletePost);
router.post("/users/:userId/ban", protectRoute, isAdmin, banUser);

export default router;