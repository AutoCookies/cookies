import express from "express";
import { 
    getAllUsers,
    deleteUser,
    getUserProfile,
    createAccount,
    adminDeletePost,
    getAllPostsForAdmin,
    searchUserByName,
    banUser,
    deleteCommnet
} from '../controllers/admin.controller.js'

const router = express.Router();

router.get("/users/:id", getUserProfile);
router.get("/users", getAllUsers);
router.delete("/users/:id", deleteUser);
router.post("/users", createAccount);
router.get("/search/user", searchUserByName);
router.get("/posts", getAllPostsForAdmin);
router.delete("/posts/:postId", adminDeletePost);
router.post("/users/:userId/ban", banUser);
router.delete("/comment/:commentId", deleteCommnet);

export default router;