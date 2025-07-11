import express from "express";
import { ENV_VARS } from './config/envVars.js';
import { connectDB } from "./config/db.js";
import authRoutes from './routes/auth.route.js';
import userRoutes from './routes/user.route.js';
import adminRoutes from './routes/admin.route.js';
import postRoute from './routes/post.route.js';
import commentRoute from './routes/comment.route.js';
import followRoute from './routes/follow.route.js';
import likeRoute from './routes/like.route.js';
import CookieParser from "cookie-parser";
import { isAdmin, protectRoute } from "./middlewares/auth.middleware.js";
import { checkBanStatus } from "./middlewares/checkBan.middleware.js";
import {  
     postRateLimiter,
     commentLimiter,
} from "./middlewares/rateLimit.middleware.js";
import cors from 'cors';
// import User from "./models/user.model.js";


const app = express()

// const createAdminIfNotExists = async () => {
//     try {
//         const adminExists = await User.findOne({ role: "admin" });

//         if (!adminExists) {
//             console.log("Không tìm thấy admin, đang tạo tài khoản admin mặc định...");

//             const adminUser = await User.create({
//                 username: "admin",
//                 fullName: "Administrator",
//                 email: "admin@example.com",
//                 password: "admin123", 
//                 role: "admin",
//             });

//             console.log(`Admin được tạo: ${adminUser.email}`);
//         } else {
//             console.log("Admin đã tồn tại.");
//         }
//     } catch (error) {
//         console.error("Lỗi khi tạo admin:", error);
//     }
// };

app.use(express.json())
app.use(CookieParser())
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true,
}));

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user", protectRoute, checkBanStatus, userRoutes);
app.use("/api/v1/admin", protectRoute, isAdmin, checkBanStatus, adminRoutes);
app.use("/api/v1/posts", protectRoute, checkBanStatus, postRoute)
app.use("/api/v1/comments", protectRoute, checkBanStatus, commentRoute);
app.use("/api/v1/likes", protectRoute, checkBanStatus, likeRoute);
app.use("/api/v1/follow", protectRoute, checkBanStatus, followRoute);

app.listen(ENV_VARS.PORT, () => {
    console.log(`Server running on port ${ENV_VARS.PORT}`);
    connectDB()
    // .then(() => {
    //     createAdminIfNotExists();
    // });
});