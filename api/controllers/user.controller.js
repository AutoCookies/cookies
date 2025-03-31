import asyncHandler from "express-async-handler";
import {
    getUser,
    changePasswordService,
    changeUserNameService,
    changeUserFullnameService,
    changeUserPhoneNumberService,
    updateProfilePictureService,
    getProfilePictureService,
    searchUserByNameService,
    updateCoverPhotoService,
    getCoverPhotoService,
    getUserImagePageService,
} from '../services/user.service.js';

/**
 * @description Get a user profile by ID
 * @param {string} id - User ID
 * @param {object} user - Current user
 * @returns {object} User profile
 */
export const getUserProfile = async (req, res) => {
    try {
        // Get user profile by ID
        const user = await getUser(req.params.id, req.user);
        res.json(user);
    } catch (error) {
        // Return 404 if user not found
        res.status(404).json({ message: error.message });
    }
};

export const changeUserPassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: "Vui lòng nhập đủ mật khẩu cũ và mật khẩu mới!" });
        }

        const response = await changePasswordService(req.user._id, currentPassword, newPassword);
        res.status(200).json(response);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const changeUserName = async (req, res) => {
    try {
        const { newUsername } = req.body;
        if (!newUsername) {
            return res.status(400).json({ message: "All fields must be filled" });
        }

        const response = await changeUserNameService(req.user._id, newUsername);
        res.status(200).json(response);
    } catch (error) {
        console.error("Error in changeUserName:", error);
        res.status(400).json({ message: error.message });
    }
};


export const changeUserFullname = async (req, res) => {
    try {
        const { newUserFullName } = req.body
        if (!newUserFullName) {
            return res.status(400).json({ message: "All fields are required" })
        }

        const response = await changeUserFullnameService(req.user._id, newUserFullName)
        res.status(200).json(response)
    } catch (error) {
        console.error("Error in change FullName:", error);
        res.status(400).json({ message: error.message });
    }
}

export const changeUserPhoneNumber = async (req, res) => {
    try {
        const { newUserPhoneNumber } = req.body;
        if (!newUserPhoneNumber) {
            return res.status(400).json({ message: "Phone number is required" });
        }

        const response = await changeUserPhoneNumberService(req.user._id, newUserPhoneNumber);
        return res.json(response);
    } catch (error) {
        console.error("Error in changePhoneNumber", error);
        return res.status(400).json({ message: error.message });
    }
};

export const updateProfilePicture = async (req, res) => {
    try {
        const userId = req.user._id;
        const imageBuffer = req.file ? req.file.buffer : null;

        if (!imageBuffer) {
            return res.status(400).json({ error: "Không có file nào được tải lên!" });
        }

        const result = await updateProfilePictureService(userId, imageBuffer);

        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

export const updateCoverPhoto = async (req, res) => {
    try {
        const userId = req.user._id;
        const imageBuffer = req.file ? req.file.buffer : null;

        if (!imageBuffer) {
            return res.status(400).json({ error: "Không có file nào được tải lên!" });
        }

        const result = await updateCoverPhotoService(userId, imageBuffer);

        return res.status(200).json(result);
    } catch (error) {
        return status(500).json({ error: error.message });
    }
}

export const getProfilePicture = async (req, res) => {
    try {
        const result = getProfilePictureService(req.user);  // Lấy từ user đã đăng nhập

        if (!result.profilePicture) {
            return res.status(404).json({ message: "Người dùng chưa có ảnh đại diện" });
        }

        res.json(result);
    } catch (error) {
        console.error("Error in getProfilePicture:", error.message);
        res.status(400).json({ message: error.message });
    }
};

export const getCoverPhoto = async (req, res) => {
    try {
        const result = await getCoverPhotoService(req.user);
        if (!result.coverPhoto) {
            return res.status(404).json({ message: "Người dùng chưa có ảnh biến" });
        }
        res.json(result);
    } catch (error) {
        console.error("Error in getCoverPhoto:", error.message);
        res.status(400).json({ message: error.message });
    }
};

export const getUserImagePage = async (req, res) => {
    try {
        const { userId } = req.params;
        const userProfile = await getUserImagePageService(userId);

        // Nếu không có cả ảnh đại diện và ảnh bìa
        if (!userProfile.profilePicture && !userProfile.coverPhoto) {
            return res.status(404).json({ 
                message: "User has no profile picture or cover photo" 
            });
        }

        res.status(200).json(userProfile);
    } catch (error) {
        console.error("Error fetching user profile:", error.message);
        
        if (error.message === "User not found") {
            return res.status(404).json({ message: error.message });
        }
        
        res.status(500).json({ message: "Internal server error" });
    }
};

export const searchUserByName = async (req, res) => {
    try {
        let { name, limit } = req.query;

        if (!name || name.trim() === "") {
            return res.status(400).json({ error: "Vui lòng nhập tên cần tìm!" });
        }

        limit = parseInt(limit) || 10; // Chuyển limit sang số nguyên, mặc định là 10

        const users = await searchUserByNameService(name, limit);
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};






