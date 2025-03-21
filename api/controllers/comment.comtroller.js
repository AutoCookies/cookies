import {
    commentPostService,
    deleteCommentService,
    editCommentService
} from '../services/comment.service.js';
import { catchAsyncErrors } from '../middlewares/catchAsyncError.middleware.js';

export const commentPost = catchAsyncErrors(async (req, res) => {
    const { postId } = req.params;
    const { content } = req.body;
    const userId = req.user._id; // Giả sử thông tin người dùng đã được xác thực và có trong req.user
  
    // Gọi service để comment
    const result = await commentPostService(userId, postId, content);
    // Trả về kết quả cho client
    res.status(200).json(result);
});

export const deleteCommnet = catchAsyncErrors(async (req, res) => {
    const { commentId } = req.params;
    const { userId } = req.user._id;

    try {
        const result = await deleteCommentService(commentId, userId);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json(error);
    }
})

export const editComment = async (req, res) => {
    const { commentId } = req.params;
    const { userId } = req.user; // Giả sử userId có sẵn từ middleware xác thực
    const { content } = req.body; // Nội dung mới của comment

    try {
        const result = await editCommentService(commentId, userId, content);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};