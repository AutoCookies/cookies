// controllers/auth.controller.js
import {
    registerUserService,
    loginUserService,
    logoutUserService,
    getUserInfoService
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
    if (!req.cookies["jwt-token"]) {
        return res.status(400).json({ message: "Bạn chưa đăng nhập!" });
    }

    logoutUserService(req, res);
    return res.status(200).json({ message: "Đăng xuất thành công!" });
};

export const getAuthUser = async (req, res) => {
    try {
        const user = await getUserInfoService(req.user._id);
        res.json(user);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};
