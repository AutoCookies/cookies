import {
    likeCommentService,
    unlikeCommentService,
    likePostService,
    unlikePostService,
    checkUserLikedPostsService
} from '../services/like.service.js';
import { catchAsyncErrors } from '../middlewares/catchAsyncError.middleware.js';
import mongoose from 'mongoose';

export const likeComment = catchAsyncErrors(async (req, res) => {
    const { commentId } = req.params;
    const userId = req.user._id;

    // Kiểm tra nếu commentId không hợp lệ
    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        return res.status(400).json({ error: "Invalid comment ID" });
    }

    try {
        // Gọi service để like comment
        const result = await likeCommentService(userId, commentId);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// Controller để unlike comment
export const unlikeComment = catchAsyncErrors(async (req, res) => {
    const { commentId } = req.params;
    const userId = req.user._id;

    console.log(`CommentId trong api: ${commentId}`)

    // Gọi service để unlike comment
    const result = await unlikeCommentService(userId, commentId);

    // Trả về kết quả cho client
    res.status(200).json(result);
});

export const likePost = async (req, res) => {
    try {
        const userId = req.user._id;
        const { postId } = req.params;

        const post = await likePostService(userId, postId);

        return res.status(200).json({ message: "Đã thích bài viết!", post });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

export const unlikePost = async (req, res) => {
    try {
        const userId = req.user._id;
        const { postId } = req.params;

        const post = await unlikePostService(userId, postId);

        return res.status(200).json({ message: "Đã bỏ thích bài viết!", post });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

/**
 * API kiểm tra danh sách postId đã like của user.
 * @route POST /api/likes/check
 * @access Private (cần đăng nhập)
 */
export const checkUserLikedPosts = async (req, res) => {
    try {
        const userId = req.user?._id;
        if (!userId) return res.status(401).json({ message: "Bạn chưa đăng nhập." });

        const { postIds } = req.body;
        if (!Array.isArray(postIds) || postIds.length === 0) {
            return res.json({ likedPostIds: [] });
        }

        const likedPostIds = await checkUserLikedPostsService(userId, postIds);

        res.json({ likedPostIds });
    } catch (error) {
        console.error("Lỗi API check likes:", error);
        res.status(500).json({ message: "Không thể kiểm tra trạng thái like." });
    }
};