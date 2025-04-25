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
    unbanUser,
    deleteCommnet
} from '../../controllers/admin/admin.controller.js'

import { createUserAccount } from "../../controllers/admin/account.controller.js";
const router = express.Router();

router.get("/users/:id", getUserProfile);
router.get("/users", getAllUsers);
router.delete("/users/:id", deleteUser);
router.post("/users", createAccount);
router.get("/search/:name", searchUserByName);
router.get("/posts", getAllPostsForAdmin);
router.delete("/posts/:postId", adminDeletePost);
router.post("/users/:userId/ban", banUser);
router.post("/users/:userId/unban", unbanUser);

router.post("/create", createUserAccount);

router.delete("/comment/:commentId", deleteCommnet);

export default router;