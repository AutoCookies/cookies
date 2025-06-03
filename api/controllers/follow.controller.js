import asyncHandler from "express-async-handler";
import {
    followUserService,
    unfollowUserService,
    getFollowersService,
    getFollowingService,
    checkFollowStatusService,
    getFollowersOfUserService
} from "../services/follow.service.js";

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

export const getFollowers = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
    }

    const followers = await getFollowersService(userId, page, limit);
    res.status(200).json(followers);
});

export const getFollowing = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const following = await getFollowingService(userId, page, limit);
    res.status(200).json(following);
});

export const checkFollowStatus = asyncHandler(async (req, res) => {
    const { userId } = req.params; // ID của người dùng cần kiểm tra
    const currentUserId = req.user._id; // ID của người dùng hiện tại từ JWT

    if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
    }

    const isFollowing = await checkFollowStatusService(currentUserId, userId);
    res.status(200).json({ isFollowing });
});

export const getFollowersOfUser = async (req, res) => {
    const { userId } = req.params;

    try {
        const followers = await getFollowersOfUserService(userId);
        return res.status(200).json({
            success: true,
            followers,
        });
    } catch (error) {
        // console.error("Error in getFollowersOfUserController:", error.message);
        return res.status(500).json({
            success: false,
            message: error.message || "Đã xảy ra lỗi khi lấy danh sách follower.",
        });
    }
};