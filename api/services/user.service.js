import User from "../models/user.model.js";
import bcrypt from "bcryptjs";


export const updateUserProfileService = async (currentUser, userId, updatedData) => {
    if (currentUser._id.toString() !== userId && currentUser.role !== "admin") {
        throw new Error("Bạn không có quyền chỉnh sửa tài khoản này!");
    }

    const user = await User.findById(userId);
    if (!user) throw new Error("Người dùng không tồn tại!");

    if (updatedData.role) {
        delete updatedData.role;
    }

    if (updatedData.email && updatedData.email !== user.email) {
        const emailExists = await User.exists({ email: updatedData.email });
        if (emailExists) {
            throw new Error("Email đã được sử dụng!");
        }
    }

    Object.assign(user, updatedData);

    if (updatedData.password) {
        user.password = await bcrypt.hash(updatedData.password, 10);
    }

    const updatedUser = await user.save();

    return {
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        fullName: updatedUser.fullName,
        bio: updatedUser.bio,
        profilePicture: updatedUser.profilePicture,
        role: updatedUser.role, 
    };
};

export const getUser = async (id, currentUser) => {
    const user = await User.findById(id).select("-password").lean();
    if (!user) throw new Error("User not found");

    if (user.visibility === "private" && currentUser._id.toString() !== id && currentUser.role !== "admin") {
        return {
            username: user.username,
            profilePicture: user.profilePicture,
            bio: user.bio,
            visibility: user.visibility
        };
    }
    return user;
};

