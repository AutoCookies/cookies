import express from "express";
import { 
    getAllUsers,
    deleteUser,
    getUserProfile,
    createAccount
} from '../controllers/admin.controller.js'
import { protectRoute, isAdmin } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/getuser/:id", protectRoute, isAdmin, getUserProfile);
router.get("/get-all", protectRoute, isAdmin, getAllUsers);
router.get("/delete/:id", protectRoute, isAdmin, deleteUser);
router.post("/create-account", protectRoute, isAdmin, createAccount)

export default router;