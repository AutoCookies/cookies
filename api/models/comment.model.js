import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
    post: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: "postModel" },
    postModel: { type: String, required: true, enum: ["Post", "SharePost"] },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    likeCount: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Comment", commentSchema);