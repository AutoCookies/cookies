import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
    post: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    likeCount: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Comment", commentSchema);
