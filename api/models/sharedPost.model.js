import mongoose from "mongoose";

const SharePostSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        originalPost: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
        caption: { type: String, default: "" },
        createdAt: { type: Date, default: Date.now },
        comments: [
            {
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                    required: true,
                },
                text: {
                    type: String,
                    required: true,
                },
                createdAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        visibility: {
            type: String,
            enum: ["public", "private", "friends"],
            default: "public",
        },
        updatedAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

export const SharePost = mongoose.model("SharePost", SharePostSchema);
