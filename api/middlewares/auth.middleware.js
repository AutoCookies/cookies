import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { ENV_VARS } from "../config/envVars.js";

export const protectRoute = async (req, res, next) => {
    let token = req.cookies["jwt-token"]; // Lấy token từ cookie

    if (!token && req.headers.authorization?.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1]; // Lấy token từ headers (dành cho fetch API)
    }

    if (!token) {
        return res.status(401).json({ message: "Permission denied! Please log in to continue." });
    }

    try {
        const decoded = jwt.verify(token, ENV_VARS.JWT_SECRET);
        req.user = await User.findById(decoded.userId).select("-password");

        if (!req.user) {
            return res.status(401).json({ message: "User not found. Please log in again!" });
        }

        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid token! Please log in." });
    }
};

export const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === "admin") {
        next();
    } else {
        res.status(403);
        throw new Error("Permission denied!");
    }
};
