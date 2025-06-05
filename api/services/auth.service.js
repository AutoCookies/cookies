import User from "../models/user.model.js";
import { generateTokenAndSetCookie, generateRefreshTokenAndSetCookie } from "../utils/generateToken.js";
import redisClient from "../config/redisClient.js";
import { verifyAccessToken } from "../utils/verifyToken.js";

export const registerUserService = async ({ username, fullName, email, password }, res) => {
    // Nếu thiếu bất kỳ field nào, trả về object báo lỗi (không ném Exception)
    if (!username || !fullName || !email || !password) {
        return { error: true, message: "All fields are required!" };
    }

    // Kiểm tra email hợp lệ
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return { error: true, message: "Invalid email!" };
    }

    // Kiểm tra độ dài password
    if (password.length < 6) {
        return { error: true, message: "Password must be at least 6 characters!" };
    }

    // Kiểm tra email đã tồn tại chưa
    const userExists = await User.exists({ email });
    if (userExists) {
        return { error: true, message: "Email already exists!" };
    }

    // Tạo user mới
    const user = await User.create({ username, fullName, email, password, role: "user" });
    if (!user) {
        return { error: true, message: "Create user failed!" };
    }

    // Trả về thông tin user + token
    return {
        error: false,
        data: {
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
        },
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
    const refreshToken = generateRefreshTokenAndSetCookie(user._id, res);

    // Lưu token vào Redis với thời gian sống (TTL) 1 ngày
    await redisClient.set(`user_session:${user._id}`, token, "EX", 15 * 60);
    await redisClient.set(`user_refresh_session:${user._id}`, refreshToken, "EX", 7 * 24 * 60 * 60); // 30 ngày

    return {
        _id: user._id,
        username: user.username,
        fullname: user.fullName,
        email: user.email,
        role: user.role,
        isBaned: user.isBanned,
    };
};

export const logoutUserService = async (req, res) => {
    try {

        const decoded = verifyAccessToken(req);
        const userId = decoded.userId.toString();

        // Xóa cookies
        const cookieOptions = {
            httpOnly: true,
            secure: ENV_VARS.NODE_ENV === "production",
            sameSite: "None",
            path: "/",
        };

        res.clearCookie("jwt-token", cookieOptions);
        res.clearCookie("jwt-refresh-token", cookieOptions);

        // Xóa session trong Redis
        await Promise.all([
            redisClient.del(`user_session:${userId}`),
            redisClient.del(`user_refresh_session:${userId}`)
        ]);

        return { 
            success: true, 
            message: "Logged out successfully" 
        };
    } catch (error) {
        console.error("Logout error:", error);

        // Xóa cookies ngay cả khi token không hợp lệ
        res.clearCookie("jwt-token");
        res.clearCookie("jwt-refresh-token");

        if (error.name === "JsonWebTokenError") {
            return { 
                success: false, 
                message: "Invalid token" 
            };
        }

        if (error.name === "TokenExpiredError") {
            return { 
                success: false, 
                message: "Token expired" 
            };
        }

        throw new Error("Logout failed");
    }
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