import express from "express";
import { 
    followUser, 
    unfollowUser,
    getFollowers,
    getFollowing,
    checkFollowStatus
 } from "../controllers/follow.controller.js";

const router = express.Router();

// Follow một user
router.post("/:id", followUser);
// unFollow một người dùng
router.delete("/:id", unfollowUser);
// Lấy followers của một người dùng
router.get("/:userId/followers", getFollowers);
// Lấy following của một người dùng
router.get("/:userId/following", getFollowing);
// Kiểm tra trạng thái follow
router.get("/:userId/check", checkFollowStatus);
export default router;
