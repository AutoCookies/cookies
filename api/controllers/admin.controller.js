import asyncHandler from "express-async-handler";
import {
    getUserService,
    getAllUserService,
    deleteUserService,
    createAccountService
} from '../services/admin.service.js';

export const getAllUsers = asyncHandler(async (req, res) => {
    const users = await getAllUserService(req.user);
    res.json(users);
});

export const deleteUser = asyncHandler(async (req, res) => {
    const message = await deleteUserService(req.user, req.params.id);
    res.json(message);
});

export const getUserProfile = asyncHandler(async (req, res) => {
    const user = await getUserService(req.user, req.params.id);
    res.json(user);
});

export const createAccount = asyncHandler(async (req, res) => {
    const user = await createAccountService(req.body, req.user, res);
    res.status(201).json(user);
});