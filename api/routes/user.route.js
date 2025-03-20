import express from "express";
import { updateUserProfile, getUserProfile } from "../controllers/user.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/:id", protectRoute, getUserProfile);

router.put("/profile/:id", protectRoute, updateUserProfile);

export default router;
