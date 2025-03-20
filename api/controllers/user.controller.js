import asyncHandler from "express-async-handler";
import {
    getUser,
    changePassword
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

        const response = await changePassword(req.user._id, currentPassword, newPassword);
        res.status(200).json(response);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};