import mongoose from "mongoose";

const BanHistorySchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Người bị cấm
    admin: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Admin đã cấm
    reason: {
        type: String,
        enum: [
            "violation_terms",      
            "hate_speech",          
            "spam",                 
            "fake_account",         
            "violence_content",     
            "harassment",           
            "illegal_activity",     
            "other"
        ],
        required: true
    },
    duration: { type: Number, required: true }, // Số ngày bị cấm (0 = cấm vĩnh viễn)
    banExpiresAt: { type: Date, default: null }, // Ngày hết hạn cấm
    createdAt: { type: Date, default: Date.now },
});

const BanHistory = mongoose.model("BanHistory", BanHistorySchema);
export default BanHistory;
