import asyncHandler from "express-async-handler";
import {
    getUser,
    getAllUser,
    registerUserService,
    loginUserService,
    updateUserProfileService,
    deleteUserService,
    logoutUserService
} from "../services/auth.service.js";

export const registerUser = asyncHandler(async (req, res) => {
    const data = await registerUserService(req.body, res);
    res.status(201).json(data);
});

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const userData = await loginUserService({ email, password, res })
        res.status(200).json(userData);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const getUserProfile = asyncHandler(async (req, res) => {
    const user = await getUser(req.params.id);
    res.json(user);
});

export const getAllUsers = asyncHandler(async (req, res) => {
    const users = await getAllUser(req.user);
    res.json(users);
});

export const updateUserProfile = asyncHandler(async (req, res) => {
    const updatedUser = await updateUserProfileService(req.user, req.params.id, req.body);
    res.json(updatedUser);
});

export const deleteUser = asyncHandler(async (req, res) => {
    const message = await deleteUserService(req.user, req.params.id);
    res.json(message);
});

export const logoutUser = async (req, res) => {
    if (!req.cookies["jwt-netflix"]) {
        return res.status(400).json({ message: "Bạn chưa đăng nhập!" });
    }

    await logoutUserService(req, res);
    res.status(200).json({ message: "Đăng xuất thành công!" });
};
