import mongoose from "mongoose";

const logSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        "auth",       // Đăng nhập/Đăng xuất
        "action",     // Hành động người dùng (VD: post bài, cập nhật profile)
        "admin",      // Hành động admin
        "error",      // Lỗi hệ thống
        "security",   // Cảnh báo bảo mật
        "system",     // Hệ thống (khởi động, tắt, job background...)
      ],
      required: true,
    },

    level: {
      type: String,
      enum: ["info", "warn", "error", "debug", "fatal"],
      default: "info",
    },

    message: {
      type: String,
      required: true,
    },

    user: {
      _id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      email: String,
      role: String,
    },

    ip: String, // IP người dùng
    userAgent: String, // Thông tin trình duyệt

    metadata: {
      type: mongoose.Schema.Types.Mixed, // Thêm bất kỳ thông tin nào khác (VD: object hành động, file, route,...)
      default: {},
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // auto thêm createdAt & updatedAt
  }
);

const Log = mongoose.model("Log", logSchema);

export default Log;
