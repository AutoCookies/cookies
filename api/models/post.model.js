import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        title: { type: String, required: true },
        content: { type: String, required: true },
        image: { type: String, default: null },

        likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], 
        commentCount: { type: Number, default: 0 }, 

        visibility: { type: String, enum: ["public", "private", "friends"], default: "public" },
    },
    { timestamps: true }
);

const Post = mongoose.model("Post", postSchema);
export default Post;
