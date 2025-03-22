import express from "express";
import { registerUser, loginUser, logoutUser } from "../controllers/auth.controller.js";
import { loginRateLimiter } from "../middlewares/rateLimit.middleware.js"

const router = express.Router();

router.post("/signup", registerUser);

router.post("/login", loginRateLimiter, loginUser)

router.post("/logout", logoutUser)

export default router; 