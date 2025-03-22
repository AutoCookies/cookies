import mongoose from "mongoose";

const likePostSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        post: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
    },
    { timestamps: true }
);

const Like = mongoose.model("LikePost", likePostSchema);
export default Like;
