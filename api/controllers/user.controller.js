import asyncHandler from "express-async-handler";
import {
    getUser,
    updateUserProfileService
} from '../services/user.service.js';

export const updateUserProfile = asyncHandler(async (req, res) => {
    const updatedUser = await updateUserProfileService(req.user, req.params.id, req.body);
    res.json(updatedUser);
});

export const getUserProfile = async (req, res) => {
    try {
        const user = await getUser(req.params.id, req.user);
        res.json(user);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};
