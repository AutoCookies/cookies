import express from "express";
import { ENV_VARS } from './config/envVars.js';
import { connectDB } from "./config/db.js";
import authRoutes from './routes/auth.route.js';
import userRoutes from './routes/user.route.js';
import adminRoutes from './routes/admin.route.js';
import postRoute from './routes/post.route.js';
import CookieParser from "cookie-parser";
// import { v2 as cloudinary } from "cloudinary";
import { protectRoute, isAdmin } from "./middlewares/auth.middleware.js";
// import User from "./models/user.model.js";
// import bcrypt from "bcryptjs";


const app = express()

// const createAdminIfNotExists = async () => {
//     try {
//         const adminExists = await User.findOne({ role: "admin" });

//         if (adminExists) {
//             console.log("Không tìm thấy admin, đang tạo tài khoản admin mặc định...");

//             const adminUser = await User.create({
//                 username: "admin",
//                 fullName: "Administrator",
//                 email: "admin2@example.com",
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

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/admin", isAdmin, adminRoutes);
app.use("/api/v1/posts", postRoute)

app.listen(ENV_VARS.PORT, () => {
    console.log(`Server running on port ${ENV_VARS.PORT}`);
    connectDB()
    // .then(() => {
    //     createAdminIfNotExists();
    // });
});