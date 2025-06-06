import User from "../models/user.model.js";
import { generateTokenAndSetCookie, generateRefreshTokenAndSetCookie } from "../utils/generateToken.js";
import redisClient from "../config/redisClient.js";
import { verifyAccessToken } from "../utils/verifyToken.js";
import { ENV_VARS } from "../config/envVars.js";

export const registerUserService = async ({ username, fullName, email, password }, res) => {
    try {
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
    } catch (err) {
        // BẮT MỌI LỖI ở đây (bao gồm cả lỗi MongoDB, schema, unique index...)
        console.error("[registerUserService] Lỗi:", err);
        // Nếu là lỗi MongoDB duplicate key, có thể custom lại message
        if (err.code === 11000 && err.keyPattern?.email) {
            return { error: true, message: "Email already exists!" };
        }
        return { error: true, message: "Internal server error!" };
    }
};


export const loginUserService = async ({ email, password, res }) => {
    try {
        if (!res) {
            throw new Error("Response object (res) is required!");
        }

        // 1. Tìm user
        const user = await User.findOne({ email });
        if (!user) {
            console.error("[loginUserService] Không tìm thấy user:", email);
            throw new Error("Wrong email or password!");
        }

        // 2. Check password
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            console.error("[loginUserService] Sai mật khẩu:", email);
            throw new Error("Wrong email or password!");
        }

        // 3. Quản lý session Redis
        try {
            const existingToken = await redisClient.get(`user_session:${user._id}`);
            if (existingToken) {
                await redisClient.del(`user_session:${user._id}`);
            }
        } catch (redisErr) {
            console.error("[loginUserService] Redis session error:", redisErr);
            // Có thể bỏ qua, hoặc throw nếu cần strict
        }

        // 4. Tạo token mới
        const token = generateTokenAndSetCookie(user._id, res);
        const refreshToken = generateRefreshTokenAndSetCookie(user._id, res);
        // Log secret thật kỹ
        console.log("[loginUserService] JWT_REFRESH_SECRET used for SIGN/VERIFY:", ENV_VARS.JWT_REFRESH_SECRET);

        // 5. Lưu token vào Redis (nếu Redis lỗi, không throw luôn, chỉ log)
        try {
            await redisClient.set(`user_session:${user._id}`, token, "EX", 15 * 60);
            await redisClient.set(`user_refresh_session:${user._id}`, refreshToken, "EX", 30 * 24 * 60 * 60); // 30 ngày
        } catch (redisErr) {
            console.error("[loginUserService] Redis set token error:", redisErr);
        }

        return {
            _id: user._id,
            username: user.username,
            fullname: user.fullName,
            email: user.email,
            role: user.role,
            isBanned: user.isBanned, // Chuẩn field
        };
    } catch (err) {
        console.error("[loginUserService] Lỗi tổng:", err);
        throw err;
    }
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

export const refreshTokenService = async (req, res) => {
    const refreshToken = req.cookies['jwt-refresh-token'];
    console.debug("[refreshTokenService] Nhận refresh token:", !!refreshToken);

    if (!refreshToken) {
        console.debug("[refreshTokenService] Không có refresh token trong cookie.");
        const err = new Error("Refresh token not found");
        err.statusCode = 401;
        throw err;
    }

    let payload;
    try {
        payload = jwt.verify(refreshToken, ENV_VARS.JWT_REFRESH_SECRET);
        console.debug("[refreshTokenService] Refresh token hợp lệ, userId:", payload.userId);
    } catch (error) {
        res.clearCookie("jwt-refresh-token");
        console.debug("[refreshTokenService] Refresh token hết hạn hoặc sai. Xóa cookie refresh-token.");
        const err = new Error("Refresh token expired or invalid");
        err.statusCode = 401;
        throw err;
    }

    const user = await User.findById(payload.userId).select('-password');
    if (!user) {
        res.clearCookie("jwt-refresh-token");
        console.debug("[refreshTokenService] User không tồn tại. Xóa cookie refresh-token.");
        const err = new Error("User not found. Please log in again.");
        err.statusCode = 401;
        throw err;
    }

    // Cấp lại access token
    const accessToken = generateTokenAndSetCookie(user._id, res);
    console.debug("[refreshTokenService] Cấp lại access token mới:", accessToken);
    console.debug("[refreshTokenService] Cấp lại access token mới, set cookie jwt-token");

    // (Tùy chọn) Có thể cấp lại refresh token mới nếu muốn sliding session

    return {
        message: "Access token refreshed successfully",
        user: {
            _id: user._id,
            username: user.username,
            fullname: user.fullName,
            email: user.email,
            role: user.role,
            isBanned: user.isBanned,
        }
    };
};

