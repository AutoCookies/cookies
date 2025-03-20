import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateTokenAndSetCookie } from "../utils/generateToken.js";

export const getUser = async (id) => {
    const user = await User.findById(id).select("-password").lean();
    if (!user) throw new Error("User not found");
    return user;
};


export const getAllUser = async (currentUser) => {
    if (currentUser.role !== "admin") {
        throw new Error("Permission denied!");
    }
    return await User.find().select("-password").lean();
};

export const registerUserService = async ({ username, fullName, email, password }, res) => {
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

    const user = await User.create({ username, fullName, email, password, role: "user" });

    if (!user) throw new Error("Create user failed!");

    const token = generateTokenAndSetCookie(user._id, res);

    return {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        token: token,
    };
};

export const loginUserService = async ({ email, password, res }) => {
    if (!res) {
        throw new Error("Response object (res) is required!");
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
        throw new Error("Wrong email or password!");
    }

    const token = generateTokenAndSetCookie(user._id, res); 

    return {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        token: token,
    };
};

export const updateUserProfileService = async (currentUser, userId, updatedData) => {
    if (currentUser._id.toString() !== userId && currentUser.role !== "admin") {
        throw new Error("Bạn không có quyền chỉnh sửa tài khoản này!");
    }

    const user = await User.findById(userId);
    if (!user) throw new Error("Người dùng không tồn tại!");

    // Không cho phép thay đổi role
    if (updatedData.role) {
        delete updatedData.role;
    }

    // Nếu email thay đổi, kiểm tra email đã tồn tại chưa
    if (updatedData.email && updatedData.email !== user.email) {
        const emailExists = await User.exists({ email: updatedData.email });
        if (emailExists) {
            throw new Error("Email đã được sử dụng!");
        }
    }

    // Cập nhật thông tin user
    Object.assign(user, updatedData);

    // Nếu cập nhật mật khẩu, hash lại
    if (updatedData.password) {
        user.password = await bcrypt.hash(updatedData.password, 10);
    }

    const updatedUser = await user.save();
    return {
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        fullName: updatedUser.fullName,
        bio: updatedUser.bio,
        profilePicture: updatedUser.profilePicture,
        role: updatedUser.role, // Admin vẫn có thể thấy role nhưng user không thay đổi được
    };
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

export const logoutUserService = async (req, res) => {
    res.cookie("jwt-netflix", "", {
        httpOnly: true,
        expires: new Date(0),
    });
};

