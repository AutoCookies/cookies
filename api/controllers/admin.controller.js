import asyncHandler from "express-async-handler";
import {
    getUserService,
    getAllUserService,
    deleteUserService,
    createAccountService,
    adminDeletePostService,
    getAllPostsForAdminService,
    searchUserByNameService,
    banUserService,
    deleteCommentService
} from '../services/admin.service.js';
import { catchAsyncErrors } from '../middlewares/catchAsyncError.middleware.js';

export const getAllUsers = asyncHandler(async (req, res) => {
    const users = await getAllUserService(req.user);
    res.json(users);
});

export const deleteUser = asyncHandler(async (req, res) => {
    const message = await deleteUserService(req.user, req.params.id);
    res.json(message);
});

export const getUserProfile = asyncHandler(async (req, res) => {
    const user = await getUserService(req.user, req.params.id);
    res.json(user);
});

export const createAccount = asyncHandler(async (req, res) => {
    const user = await createAccountService(req.body, req.user, res);
    res.status(201).json(user);
});

export const adminDeletePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.user._id

        const result = await adminDeletePostService(postId, userId);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getAllPostsForAdmin = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const data = await getAllPostsForAdminService(Number(page), Number(limit));

        res.status(200).json({
            success: true,
            message: "Lấy tất cả bài viết thành công!",
            data,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Lỗi khi lấy bài viết!",
            error: error.message,
        });
    }
};

export const searchUserByName = async (req, res) => {
    try {
        const { name } = req.query;
        if (!name || name.trim() === "") {
            return res.status(400).json({ error: "Vui lòng nhập tên cần tìm!" });
        }

        const users = await searchUserByNameService(name);
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const banUser = async (req, res) => {
    try {
        const { userId } = req.params; // Lấy userId từ URL
        const adminId = req.user._id; // Lấy adminId từ token xác thực
        const { duration, reason } = req.body; // Lấy dữ liệu từ body

        if (!reason) {
            return res.status(400).json({ error: "Lý do ban là bắt buộc!" });
        }

        if (duration !== 0 && (!Number.isInteger(duration) || duration < 1)) {
            return res.status(400).json({ error: "Thời gian ban phải là số nguyên dương hoặc 0 (vĩnh viễn)!" });
        }

        const result = await banUserService(userId, adminId, { duration, reason });

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

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