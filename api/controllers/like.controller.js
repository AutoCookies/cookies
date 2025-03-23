import {
    likeCommentService,
    unlikeCommentService,
    likePostService,
    unlikePostService,
} from '../services/like.service.js';
import { catchAsyncErrors } from '../middlewares/catchAsyncError.middleware.js';

export const likeComment = catchAsyncErrors(async (req, res) => {
    const { commentId } = req.params;
    const userId = req.user._id; // Giả sử thông tin người dùng đã được xác thực và có trong req.user

    // Gọi service để like comment
    const result = await likeCommentService(userId, commentId);

    // Trả về kết quả cho client
    res.status(200).json(result);
});

// Controller để unlike comment
export const unlikeComment = catchAsyncErrors(async (req, res) => {
    const { commentId } = req.params;
    const userId = req.user._id; // Giả sử thông tin người dùng đã được xác thực và có trong req.user

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