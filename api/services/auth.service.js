import User from "../models/user.model.js";
import { generateTokenAndSetCookie } from "../utils/generateToken.js";
import redisClient from "../config/redisClient.js";

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

    // Kiểm tra nếu đã có phiên đăng nhập cũ
    const existingToken = await redisClient.get(`user_session:${user._id}`);
    if (existingToken) {
        await redisClient.del(`user_session:${user._id}`); // Xóa token cũ
    }

    // Tạo token mới
    const token = generateTokenAndSetCookie(user._id, res);

    // Lưu token vào Redis với thời gian sống (TTL) 1 ngày
    await redisClient.set(`user_session:${user._id}`, token, "EX", 24 * 60 * 60);

    return {
        _id: user._id,
        username: user.username,
        fullname: user.fullName,
        email: user.email,
        role: user.role,
        token,
    };
};

// Sau này front end nên cho xóa ảnh và token khi đăng xuất
export const logoutUserService = async (req, res) => {
    res.clearCookie("jwt-token", {
        httpOnly: true,
        secure: true,
        sameSite: "Strict",
        path: "/", 
    });
    await redisClient.del(`user_session:${userId}`);
};

/**
 * Lấy thông tin user từ database dựa vào userId.
 * @param {string} userId 
 * @returns {Promise<Object>} Thông tin user (_id, name, role, email)
 */
export const getUserInfoService = async (userId) => {
    const user = await User.findById(userId).select("_id username role email profilePicture");

    if (!user) {
        throw new Error("User not found");
    }
    
    return user;
};