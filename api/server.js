// server.js
import http from "http";
import { Server } from "socket.io";
import app from "./app.js";
import { ENV_VARS } from "./config/envVars.js";
import { connectDB } from "./config/db.js";
import User from "./models/user.model.js";

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: `${ENV_VARS.API_ROUTE}`,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  }
});

// Gắn vào global để dùng ở các nơi khác
global._io = io;

io.on("connection", (socket) => {
  console.log("Socket.IO client connected!");

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// Tạo admin mặc định nếu chưa có
const createAdminIfNotExists = async () => {
  try {
    const adminExists = await User.findOne({ role: "admin" });

    if (!adminExists) {
      console.log("Không tìm thấy admin, đang tạo tài khoản admin mặc định...");

      const adminUser = await User.create({
        username: "admin",
        fullName: "Administrator",
        email: "admin@example.com",
        password: "admin123",
        role: "admin",
      });

      console.log(`Admin được tạo: ${adminUser.email}`);
    } else {
      console.log("Admin đã tồn tại.");
    }
  } catch (error) {
    console.error("Lỗi khi tạo admin:", error);
  }
};

server.listen(ENV_VARS.PORT, () => {
  console.log(`🚀 Server running on port ${ENV_VARS.PORT}`);
  connectDB().then(createAdminIfNotExists);
});
