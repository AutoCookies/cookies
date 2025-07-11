import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },

    fullName: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      unique: true,
      sparse: true,
    },

    password: {
      type: String,
      required: true,
    },

    phoneNumber: {
      type: String,
      unique: true,
      sparse: true,
      validate: {
        validator: function (v) {
          return /^[\d+\-() ]{8,15}$/.test(v);
        },
        message: props => `${props.value} is not a valid phone number!`
      }
    },

    profilePicture: {
      type: String,
      default: null,
    },

    coverPhoto: {
      type: String,
      default: null,
    },

    bio: {
      type: String,
      default: "",
    },

    gender: {
      type: String,
      enum: ["male", "female", "other"],
      default: "other",
    },

    dateOfBirth: {
      type: Date,
    },

    followerCount: { type: Number, default: 0 },
    followingCount: { type: Number, default: 0 },

    posts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
      }
    ],

    likedPosts: [
      {
        postId: { type: mongoose.Schema.Types.ObjectId, required: true },
        postType: { type: String, enum: ["Post", "SharePost"], required: true }
      }
    ],    

    savedPosts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
      },
    ],

    chats: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chat",
      },
    ],

    notifications: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Notification",
      },
    ],

    role: {
      type: String,
      enum: ["user", "admin", "moderator"],
      default: "user",
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    isBanned: {
      type: Boolean,
      default: false
    },

    banHistory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BanHistory",
      default: null
    },

    passwordChangedAt: {
      type: Date,
    },

    passwordResetToken: {
      type: String,
    },

    passwordResetExpires: {
      type: Date,
    },

    visibility: { type: String, enum: ["public", "private"], default: "public" }
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
