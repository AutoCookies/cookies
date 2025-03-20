import express from "express";
import { getUserProfile, changeUserPassword } from "../controllers/user.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/:id", protectRoute, getUserProfile);

router.put("/change-password", protectRoute, changeUserPassword);

export default router;
