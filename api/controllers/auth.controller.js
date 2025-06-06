// controllers/auth.controller.js
import {
    registerUserService,
    loginUserService,
    logoutUserService,
    getUserInfoService,
    refreshTokenService
} from "../services/auth.service.js";
import { loginRateLimiter } from "../middlewares/rateLimit.middleware.js";

export const registerUser = async (req, res) => {
    try {
        // Gọi service
        const result = await registerUserService(req.body, res);

        // Nếu service trả về error: true, nghĩa là thiếu field hoặc validation fail
        if (result.error) {
            // Trả status 200 và thông điệp tương ứng
            return res.status(200).json({ message: result.message });
        }

        // Ngược lại, thành công
        return res.status(201).json(result.data);
    } catch (error) {
        // Trường hợp bất thường (chẳng hạn lỗi DB, v.v)
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    // Kiểm tra thiếu field
    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required!" });
    }

    try {
        const userData = await loginUserService({ email, password, res });
        loginRateLimiter.resetKey(email);
        return res.status(200).json(userData);
    } catch (error) {
        if (error.message === "Wrong email or password!") {
            return res.status(401).json({ message: error.message });
        }

        return res.status(500).json({ message: "Internal server error" });
    }
};

export const logoutUser = async (req, res) => {
    try {
        const result = await logoutUserService(req, res);
        
        if (!result.success) {
            return res.status(400).json(result);
        }
        
        return res.status(200).json(result);
    } catch (error) {
        console.error('Logout controller error:', error);
        return res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
        });
    }
};

export const getAuthUser = async (req, res) => {
    try {
        const user = await getUserInfoService(req.user._id);
        res.json(user);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

export const refreshToken = async (req, res) => {
    try {
        const result = await refreshTokenService(req, res);
        return res.json(result);
    } catch (error) {
        const status = error.statusCode || 401;
        return res.status(status).json({
            message: error.message,
        });
    }
};