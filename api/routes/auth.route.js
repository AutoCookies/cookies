import express from "express";
import { registerUser, loginUser, logoutUser } from "../controllers/auth.controller.js";
import { loginRateLimiter } from "../middlewares/rateLimit.middleware.js";
import { protectRoute } from "../middlewares/auth.middleware.js";
import { getAuthUser } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/signup", registerUser);

router.post("/login", loginRateLimiter, loginUser)

router.post("/logout", logoutUser)

router.get("/me", protectRoute, getAuthUser);

export default router; 