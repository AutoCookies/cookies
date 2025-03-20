import User from "../models/user.model.js";
import mongoose from 'mongoose';
import { generateTokenAndSetCookie } from '../utils/generateToken.js';

export const getUserService = async (currentUser, id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid user ID!");
    }

    const user = await User.findById(id).lean();
    if (!user) throw new Error("User not found");
    return user;
};


export const getAllUserService = async (currentUser) => {
    if (!currentUser || currentUser.role !== "admin") {
        throw new Error("Bạn không có quyền xem danh sách người dùng!");
    }

    return await User.find().select("-password").lean();
};

export const deleteUserService = async (currentUser, userId) => {
    if (currentUser.role !== "admin") {
        throw new Error("Bạn không có quyền xóa tài khoản!");
    }

    const user = await User.findById(userId);
    if (!user) throw new Error("Người dùng không tồn tại!");

    await user.deleteOne();
    return { message: "Tài khoản đã được xóa!" };
};

export const createAccountService = async ({ username, fullName, email, password, role }, currentUser, res) => {
    if (!username || !fullName || !email || !password) {
        throw new Error("All fields are required!");
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error("Invalid email!");
    }

    if (password.length < 6) {
        throw new Error("Password must be at least 6 characters!");
    }

    const userExists = await User.exists({ email });
    if (userExists) throw new Error("Email already exists!");

    // ⚠️ Chặn user thường tạo admin/moderator
    let assignedRole = "user"; // Mặc định là user
    if (role && ["admin", "moderator"].includes(role)) {
        if (!currentUser || currentUser.role !== "admin") {
            throw new Error("Permission denied! Only admins can create admin or moderator accounts.");
        }
        assignedRole = role; // Admin có thể set role khác
    }

    const user = await User.create({ username, fullName, email, password, role: assignedRole });

    if (!user) throw new Error("Create user failed!");

    const token = generateTokenAndSetCookie(user._id, res);

    return {
        _id: user._id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        token: token,
    };
};