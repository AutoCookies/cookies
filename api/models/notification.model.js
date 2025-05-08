import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    // User who did the action (like, comment, follow, mention)
    fromUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    type: { type: String, enum: ["like", "comment", "follow", "mention"], required: true },
    createdAt: { type: Date, default: Date.now },
    seen: { type: Boolean, default: false },
})