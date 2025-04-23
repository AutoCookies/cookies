import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import cloudinary from "../config/cloudinary.js";

export const getUser = async (id, currentUser) => {
    const user = await User.findById(id).select("-password").lean();
    if (!user) throw new Error("User not found");

    if (user.visibility === "private" && currentUser._id.toString() !== id && currentUser.role !== "admin") {
        return {
            username: user.username,
            profilePicture: user.profilePicture,
            bio: user.bio,
            visibility: user.visibility,
            coverPhoto: user.coverPhoto
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

    return { message: "Fullname updated successfully!" };
}

export const changeUserPhoneNumberService = async (userId, newUserPhoneNumber) => {
    const user = await User.findById(userId);
    if (!user) throw new Error("User does not exist");

    // Kiểm tra số điện thoại có đang được user khác sử dụng không
    const existingUser = await User.findOne({ phoneNumber: newUserPhoneNumber });
    if (existingUser && existingUser._id.toString() !== userId) {
        throw new Error("Phone number is already in use by another user");
    }

    user.phoneNumber = newUserPhoneNumber;
    await user.save();

    return { message: "Phone number changed successfully" };
};


/**
 * Cập nhật ảnh đại diện cho người dùng
 * @param {string} userId - ID của người dùng
 * @param {Buffer} imageBuffer - Ảnh đại diện dạng Buffer
 * @returns {Promise<Object>} - Kết quả bao gồm message và profilePicture của người dùng
 */
export const updateProfilePictureService = async (userId, imageBuffer) => {
    try {
        if (!imageBuffer) {
            throw new Error("Không có ảnh để upload!");
        }

        const user = await User.findById(userId);
        if (!user) throw new Error("Người dùng không tồn tại!");

        // 🔹 Xóa ảnh cũ trên Cloudinary trước khi upload mới
        if (user.profilePicture) {
            // Lấy public_id từ URL
            const publicId = user.profilePicture.split("/").pop().split(".")[0]; // Lấy phần cuối URL (không có extension)
            console.log("Xóa ảnh cũ:", publicId);

            await cloudinary.uploader.destroy(`user_profiles/${publicId}`);
            console.log("Ảnh cũ đã xóa thành công!");
        }

        // console.log("Bắt đầu upload ảnh từ buffer...");

        // Upload ảnh mới lên Cloudinary
        const result = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                { folder: "user_profiles", transformation: [{ width: 500, height: 500, crop: "limit" }] },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            ).end(imageBuffer);
        });

        if (!result.secure_url) {
            throw new Error("Không thể upload ảnh!");
        }

        // console.log("Upload thành công:", result.secure_url);

        // Cập nhật ảnh mới vào database
        user.profilePicture = result.secure_url;
        await user.save();

        // console.log("Cập nhật profilePicture thành công!");

        return {
            message: "Ảnh đại diện đã được cập nhật thành công!",
            profilePicture: user.profilePicture
        };
    } catch (error) {
        console.error("Lỗi trong updateProfilePictureService:", error);
        throw error;
    }
};

export const updateCoverPhotoService = async (userId, imageBuffer) => {
    try {
        if (!imageBuffer) {
            throw new Error("Không có ảnh để upload!");
        }

        const user = await User.findById(userId);
        if (!user) throw new Error("Người dùng không tồn tại!");

        if (user.coverPhoto) {
            const publicId = user.coverPhoto.split("/").pop().split(".")[0];
            await cloudinary.uploader.destroy(`user_covers/${publicId}`);
        }

        // Upload ảnh mới lên Cloudinary
        const result = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                { folder: "user_covers", transformation: [{ width: 500, height: 500, crop: "limit" }] },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            ).end(imageBuffer);
        });

        if (!result.secure_url) {
            throw new Error("Không thể upload ảnh!");
        }

        user.coverPhoto = result.secure_url;
        await user.save();

        return {
            message: "Ảnh bìa đã được cập nhật thành công!",
            coverPhoto: user.coverPhoto
        };
    } catch (error) {
        console.error("Lỗi trong updateCoverPhoto:", error);
        throw error;
    }
}

export const getProfilePictureService = (user) => {
    return { 
        userId: user._id,
        profilePicture: user.profilePicture 
    };
};

export const getCoverPhotoService = (user) => {
    if (!user || !user.coverPhoto) {
        return { coverPhoto: null };
    }
    return { coverPhoto: user.coverPhoto };
};

export const getUserImagePageService = async (userId) => {
    // Lấy profilePicture, coverPhoto, username, followerCount, followingCount
    const user = await User.findById(userId).select("username profilePicture coverPhoto followerCount followingCount")
        .lean();;
    
    if (!user) {
        throw new Error("User not found");
    }

    return {
        username: user.username || null,
        profilePicture: user.profilePicture || null,
        coverPhoto: user.coverPhoto || null,
        followerCount: user.followerCount || 0,
        followingCount: user.followingCount || 0
    };
};

export const searchUserByNameService = async (query, limit = 10) => {
    try {
        query = query.trim(); // Loại bỏ khoảng trắng thừa

        if (!query) {
            throw new Error("Tên tìm kiếm không hợp lệ!"); // Tránh lỗi truy vấn rỗng
        }

        limit = Math.min(limit, 50); // Giới hạn tối đa 50 kết quả để tránh abuse

        const users = await User.find({
            $or: [
                { fullname: { $regex: query, $options: "i" } },
                { username: { $regex: query, $options: "i" } }
            ]
        })
        .limit(limit)
        .select("_id username fullname email avatar"); 

        return users;
    } catch (error) {
        throw new Error("Lỗi khi tìm kiếm người dùng: " + error.message);
    }
};
