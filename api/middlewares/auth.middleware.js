import User from "../models/user.model.js";
import { ENV_VARS } from "../config/envVars.js";
import jwt from 'jsonwebtoken';

export const protectRoute = async (req, res, next) => {
    // 1. Lấy access token từ cookie
    const token = req.cookies?.['jwt-token'];
    const isRefreshToken = req.cookies?.['jwt-refresh-token'];

    console.debug("[protectRoute] Nhận request, jwt-token:", !!token, "Path:", req.originalUrl);

    if (!token && isRefreshToken) {
        console.debug("[protectRoute] Không có jwt-token (hết hạn hoặc chưa login). Trả TOKEN_EXPIRED.");
        return res.status(401).json({
            success: false,
            message: "Access token expired or missing. Please refresh token.",
            code: "TOKEN_EXPIRED"
        });
    }

    // 2. Nếu có token, verify như bình thường
    try {
        const decoded = jwt.verify(token, ENV_VARS.JWT_SECRET);
        console.debug("[protectRoute] Token hợp lệ, userId:", decoded.userId);

        const user = await User.findById(decoded.userId).select("-password");
        if (!user) {
            console.debug("[protectRoute] Không tìm thấy userId:", decoded.userId, "trong DB.");
            return res.status(401).json({
                success: false,
                message: "User not found. Please log in again!",
            });
        }

        req.user = { ...user.toObject(), _id: user._id.toString() };
        console.debug("[protectRoute] User xác thực thành công:", req.user.username || req.user.email);
        return next();
    } catch (error) {
        console.debug("[protectRoute] Lỗi khi verify token:", error.name, error.message);
        // Nếu hết hạn hoặc token lỗi, cũng trả về TOKEN_EXPIRED để FE auto refresh
        return res.status(401).json({
            success: false,
            message: "Access token expired or invalid. Please refresh token.",
            code: "TOKEN_EXPIRED"
        });
    }
};


export const isAdmin = (req, res, next) => {
  if (req.user && (req.user.role === "admin" || req.user.role === "moderator")) {
    next();
  } else {
    return res.status(403).json({ message: "Permission denied!" });
  }
};