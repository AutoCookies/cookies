import jwt from 'jsonwebtoken';
import { ENV_VARS } from '../config/envVars.js';

export const generateTokenAndSetCookie = (userId, res) => {
    const token = jwt.sign(
        { userId: userId.toString() },
        ENV_VARS.JWT_SECRET,
        { expiresIn: "15m" }
    );

    res.cookie("jwt-token", token, {
        httpOnly: true,
        sameSite: "Lax",
        maxAge: 15 * 60 * 1000, // 1 phút (miligiây)
        secure: false, // để true khi lên production HTTPS
    });

    return token;
};

export const generateRefreshTokenAndSetCookie = (userId, res) => {
    const refreshToken = jwt.sign(
        { userId: userId.toString() },
        ENV_VARS.JWT_REFRESH_SECRET, // <--- LỖI! Phải là JWT_REFRESH_SECRET
        { expiresIn: "30d" }
    );

    res.cookie("jwt-refresh-token", refreshToken, {
        httpOnly: true,
        sameSite: "Lax",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 ngày (miligiây)
        secure: false,
    });

    return refreshToken;
};