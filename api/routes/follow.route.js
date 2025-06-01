import express from "express";
import { 
    followUser, 
    unfollowUser,
    getFollowers,
    getFollowing,
    checkFollowStatus,
    getFollowersOfUser
 } from "../controllers/follow.controller.js";
 import { userRateLimiter } from "../middlewares/rateLimit.middleware.js";

const router = express.Router();

// Follow một user
router.post("/:id", userRateLimiter, followUser);
// unFollow một người dùng
router.delete("/:id", userRateLimiter, unfollowUser);
// Lấy followers của một người dùng
router.get("/:userId/followers", userRateLimiter, getFollowers);
// Lấy following của một người dùng
router.get("/:userId/following", userRateLimiter, getFollowing);
// Kiểm tra trạng thái follow
router.get("/:userId/check", userRateLimiter, checkFollowStatus);
// Lấy followers của một người dùng
router.get("/:userId/followersOfUser", userRateLimiter, getFollowersOfUser);
export default router;
