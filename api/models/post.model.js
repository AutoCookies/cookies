// Model Post
import mongoose from "mongoose";
import LikePost from "./likePost.model.js";
import Comment from "./comment.model.js";

const postSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        title: { type: String, required: true },
        content: { type: String, required: true },
        image: { type: String, default: null },
        likesCount: { type: Number, default: 0 },
        commentCount: { type: Number, default: 0 },
        visibility: { type: String, enum: ["public", "private", "friends"], default: "public" },
    },
    { timestamps: true }
);

postSchema.pre("deleteOne", { document: true, query: false }, async function (next) {
    const postId = this._id;

    try {
        // Xóa tất cả LikePost liên quan
        await LikePost.deleteMany({ post: postId });

        // Xóa tất cả Comment liên quan (LikeComment sẽ tự động bị xóa trong middleware của Comment)
        await Comment.deleteMany({ post: postId });

        next();
    } catch (error) {
        next(error);
    }
});

const Post = mongoose.model("Post", postSchema);
export default Post;
