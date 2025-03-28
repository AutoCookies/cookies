import mongoose from "mongoose";
import LikeComment from "./likeComment.model.js";

const commentSchema = new mongoose.Schema({
    post: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: "postModel" },
    postModel: { type: String, required: true, enum: ["Post", "SharePost"] },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    likeCount: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

// Middleware trước khi xóa Comment
commentSchema.pre("deleteOne", { document: true, query: false }, async function (next) {
    const commentId = this._id;

    try {
        // Xóa tất cả LikeComment liên quan đến Comment
        await LikeComment.deleteMany({ comment: commentId });
        next();
    } catch (error) {
        next(error);
    }
});

export default mongoose.model("Comment", commentSchema);