import asyncHandler from "express-async-handler";
import {
    registerUserService,
    loginUserService,
    logoutUserService
} from "../services/auth.service.js";
import { loginRateLimiter } from "../middlewares/rateLimit.middleware.js";

export const registerUser = asyncHandler(async (req, res) => {
    const data = await registerUserService(req.body, res);
    res.status(201).json(data);
});

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const userData = await loginUserService({ email, password, res })
        loginRateLimiter.resetKey(req.body.email);
        res.status(200).json(userData);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const logoutUser = async (req, res) => {
    if (!req.cookies["jwt-token"]) {
        return res.status(400).json({ message: "Bạn chưa đăng nhập!" });
    }

    logoutUserService(req, res);
    return res.status(200).json({ message: "Đăng xuất thành công!" });
};



