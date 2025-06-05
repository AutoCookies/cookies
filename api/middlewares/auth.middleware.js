import User from "../models/user.model.js";
import { verifyAccessToken } from "../utils/verifyToken.js";

export const protectRoute = async (req, res, next) => {
    try {
        const decoded = verifyAccessToken(req);
        const user = await User.findById(decoded.userId).select("-password");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found. Please log in again!",
            });
        }

        req.user = { ...user.toObject(), _id: user._id.toString() };
        return next();
    } catch (error) {
        console.error("Auth Error:", error);
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Access token expired. Please refresh token.",
                code: "TOKEN_EXPIRED",
            });
        }

        return res.status(401).json({
            success: false,
            message: "Invalid token! Please log in.",
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