import asyncHandler from "express-async-handler";
import { followUserService, unfollowUserService } from "../services/follow.service.js";

/**
 * @route   POST /user/:id/follow
 * @desc    Follow một người dùng
 * @access  Private
 */
export const followUser = asyncHandler(async (req, res) => {
    const { id: targetUserId } = req.params; // Lấy ID của người dùng cần follow
    const userId = req.user._id; // Lấy ID của người dùng hiện tại từ JWT

    const result = await followUserService(userId, targetUserId);
    res.status(200).json(result);
});

/**
 * @route   DELETE /user/:id/unfollow
 * @desc    Unfollow một người dùng
 * @access  Private
 */
export const unfollowUser = asyncHandler(async (req, res) => {
    const { id: targetUserId } = req.params;
    const userId = req.user._id;

    const result = await unfollowUserService(userId, targetUserId);
    res.status(200).json(result);
});
