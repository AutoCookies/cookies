import express from "express";
import { ENV_VARS } from './config/envVars.js';
import { connectDB } from "./config/db.js";
import authRoutes from './routes/auth.route.js';
import userRoutes from './routes/user.route.js';
import CookieParser from "cookie-parser"
import { protectRoute } from "./middlewares/auth.middleware.js";
// import User from "./models/user.model.js";
// import bcrypt from "bcryptjs";


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
//                 password: await bcrypt.hash("admin123", 10), 
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
app.use("/api/v1/user", protectRoute, userRoutes);
app.use("/api/v1/admin", protectRoute, userRoutes);

app.listen(ENV_VARS.PORT, () => {
    console.log(`Server running on port ${ENV_VARS.PORT}`);
    connectDB()
    // .then(() => {
    //     createAdminIfNotExists();
    // });
});