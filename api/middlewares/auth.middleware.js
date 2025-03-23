import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { ENV_VARS } from "../config/envVars.js";
import mongoose from "mongoose";

export const protectRoute = async (req, res, next) => {
    try {
        let token = req.cookies?.["jwt-token"];

        if (!token && req.headers.authorization?.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            return res.status(401).json({ message: "Permission denied! Please log in to continue." });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // console.log("Decoded Token:", decoded);

        const user = await User.findById(decoded.userId).select("-password");

        if (!user) {
            return res.status(401).json({ message: "User not found. Please log in again!" });
        }

        // console.log("User from DB:", user);

        req.user = { ...user.toObject(), _id: user._id.toString() };

        next();
    } catch (error) {
        console.error("Auth Error:", error);

        if (error.name === "TokenExpiredError") {
            res.clearCookie("jwt-token");
            return res.status(401).json({ message: "Session expired! Please log in again." });
        }

        return res.status(401).json({ message: "Invalid token! Please log in." });
    }
};


export const isAdmin = (req, res, next) => {
    if (req.user && (req.user.role === "admin" || req.user.role === "moderator")) {
        next();
    } else {
        res.status(403);
        throw new Error("Permission denied!");
    }
};
