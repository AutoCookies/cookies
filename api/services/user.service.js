import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import cloudinary from "../config/cloudinary.js";
import fs from "fs";

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

export const changePasswordService = async (userId, currentPassword, newPassword) => {
    const user = await User.findById(userId);
    if (!user) throw new Error("Người dùng không tồn tại!");

    // Kiểm tra mật khẩu cũ có đúng không
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) throw new Error("Mật khẩu cũ không đúng!");

    // Kiểm tra độ dài mật khẩu mới
    if (newPassword.length < 6) {
        throw new Error("Mật khẩu mới phải có ít nhất 6 ký tự!");
    }

    // Hash mật khẩu mới và cập nhật vào DB
    user.password = newPassword;
    user.passwordChangedAt = new Date();
    await user.save();

    return { message: "Mật khẩu đã được cập nhật thành công!" };
};

export const changeUserNameService = async (userId, newUsername) => {
    const user = await User.findById(userId);
    if (!user) throw new Error("User does not exist");

    user.username = newUsername;
    await user.save();
    
    return { message: "Username updated successfully!" };
};

export const changeUserFullnameService = async ( userId, newFullName ) => {
    const user = await User.findById(userId);
    if (!user) throw new Error("User does not exist");

    user.fullName = newFullName;
    await user.save();

    return { message: "Email updated successfully!" };
}

export const changeUserPhoneNumberService = async ( userId, newUserPhoneNumber ) => {
    const user = await User.findById(userId);
    if (!user) throw new Error("User does not exist");

    user.phoneNumber = newUserPhoneNumber;
    await user.save();

    return { message: "Phone number changed successfully" }
}

export const updateProfilePictureService = async (userId, filePath) => {
    try {
        if (!fs.existsSync(filePath)) {
            throw new Error(`File không tồn tại: ${filePath}`);
        }

        console.log("Bắt đầu upload file từ:", filePath);

        const result = await cloudinary.uploader.upload(filePath, {
            folder: "user_profiles",
            transformation: [{ width: 500, height: 500, crop: "limit" }]
        });

        if (!result.secure_url) {
            throw new Error("Không thể upload ảnh!");
        }

        console.log("Upload thành công:", result.secure_url);

        // Xóa file tạm
        fs.unlink(filePath, (err) => {
            if (err) console.error("Lỗi khi xóa file:", err);
            else console.log("🗑 File tạm đã xóa:", filePath);
        });

        // Cập nhật vào database
        const user = await User.findByIdAndUpdate(
            userId, 
            { profilePicture: result.secure_url }, 
            { new: true }
        );

        console.log("Cập nhật profilePicture thành công cho user:", userId);

        return {
            message: "Ảnh đại diện đã được cập nhật thành công!",
            profilePicture: user.profilePicture
        };
    } catch (error) {
        console.error("Lỗi trong updateProfilePictureService:", error);
        throw error;
    }
};


export const getProfilePictureService = (user) => {
    if (!user || !user.profilePicture) {
        return { profilePicture: null };
    }
    return { profilePicture: user.profilePicture };
};



