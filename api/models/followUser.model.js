import mongoose from "mongoose";

const followUserSchema = new mongoose.Schema(
  {
    follower: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    following: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Chặn follow trùng lặp
followUserSchema.index({ follower: 1, following: 1 }, { unique: true });

const FollowUser = mongoose.model("FollowUser", followUserSchema);
export default FollowUser;
