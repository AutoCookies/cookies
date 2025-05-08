import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['post', 'like', 'comment', 'follow', 'mention'], required: true },
    content: { type: String, required: true },
    seen: { type: Boolean, default: false },
}, { timestamps: true });

export const Notification = mongoose.model("Notification", NotificationSchema);