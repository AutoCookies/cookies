import mongoose from "mongoose";

const SharePostSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        originalPost: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: "originalPostModel" },
        originalPostModel: { type: String, required: true, enum: ["Post", "SharePost"], default: "Post" },
        caption: { type: String, default: "" },
        commentCount: { type: Number, default: 0 },
        likesCount: { type: Number, default: 0 },
        visibility: { type: String, enum: ["public", "private", "friends"], default: "public" }
    },
    { timestamps: true }
);

// Middleware đảm bảo `likes` luôn là mảng rỗng nếu không có dữ liệu
SharePostSchema.pre("save", function (next) {
    if (!Array.isArray(this.likes)) {
        this.likes = [];
    }
    next();
});

export const SharePost = mongoose.model("SharePost", SharePostSchema);
