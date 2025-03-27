import {
    commentPostService,
    deleteCommentService,
    editCommentService,
    getCommentsByPostService
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
    try {
        console.log(`User ID: ${req.user._id}`); // Debug user ID
        const { commentId } = req.params;
        const userId = req.user._id; // Lấy userId đúng

        const result = await deleteCommentService(commentId, userId);
        res.status(200).json(result);
    } catch (error) {
        console.error("Error deleting comment:", error.message); // Log chi tiết lỗi
        res.status(400).json({ message: error.message });
    }
});

export const editComment = async (req, res) => {
    // console.log(`User ID: ${req.user._id}`); // Kiểm tra userId
    const { commentId } = req.params;
    const userId = req.user._id; // Lấy userId từ middleware đúng cách
    const { content } = req.body; // Nội dung mới của comment

    try {
        const result = await editCommentService(commentId, userId, content);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const getCommentsByPost = async (req, res) => {
    try {
        const { postId } = req.params;
<<<<<<< HEAD
        const userId = req.user._id;
        console.log(`User ID: ${userId}`);
        const { page = 1, limit = 10 } = req.query; // Hỗ trợ phân trang
=======
        const { page = 1, limit = 10 } = req.query;
>>>>>>> 1e15c31a57e1dad11d0cbd8d89b55ceac3f03127

        // Gọi service để lấy comment
        const data = await getCommentsByPostService(postId, userId, Number(page), Number(limit));

        return res.status(200).json({ message: "Lấy danh sách comment thành công!", data });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};
