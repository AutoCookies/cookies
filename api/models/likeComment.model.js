import mongoose from "mongoose";

const likeCommentSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    comment: { type: mongoose.Schema.Types.ObjectId, ref: "Comment", required: true },
    createdAt: { type: Date, default: Date.now }
});

// Đảm bảo mỗi user chỉ like một comment một lần
likeCommentSchema.index({ user: 1, comment: 1 }, { unique: true });

export default mongoose.model("LikeComment", likeCommentSchema);
