import asyncHandler from "express-async-handler";
import {
    getUser,
    getAllUser,
    deleteUserService
} from '../services/admin.service.js';

export const getAllUsers = asyncHandler(async (req, res) => {
    const users = await getAllUser(req.user);
    res.json(users);
});

export const deleteUser = asyncHandler(async (req, res) => {
    const message = await deleteUserService(req.user, req.params.id);
    res.json(message);
});

export const getUserProfile = asyncHandler(async (req, res) => {
    const user = await getUser(req.params.id);
    res.json(user);
});