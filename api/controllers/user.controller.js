import asyncHandler from "express-async-handler";
import {
    getUser,
    changePasswordService,
    changeUserNameService,
    changeUserFullnameService,
    changeUserPhoneNumberService
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
        const { newUserPhoneNumber } = req.body
        if (!newUserPhoneNumber) {
            return res.status(400).json({ message: "All the fields are required" })
        }

        const response = await changeUserPhoneNumberService(req.user._id, newUserPhoneNumber)
    } catch (error) {
        console.error("Error in change Phonenumber", error);
        res.status(400).json({ message: error.message });
    }
}
