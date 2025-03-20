import User from "../models/user.model.js";
import { generateTokenAndSetCookie } from "../utils/generateToken.js";

export const registerUserService = async ({ username, fullName, email, password }, res) => {
    if (!username || !fullName || !email || !password) {
        throw new Error("All fields are required!");
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error("Invalid email!");
    }

    if (password.length < 6) {
        throw new Error("Password must be at least 6 characters!");
    }

    const userExists = await User.exists({ email });
    if (userExists) throw new Error("Email already exists!");

    const user = await User.create({ username, fullName, email, password, role: "user" });

    if (!user) throw new Error("Create user failed!");

    const token = generateTokenAndSetCookie(user._id, res);

    return {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        token: token,
    };
};

export const loginUserService = async ({ email, password, res }) => {
    if (!res) {
        throw new Error("Response object (res) is required!");
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
        throw new Error("Wrong email or password!");
    }

    const token = generateTokenAndSetCookie(user._id, res);

    return {
        _id: user._id,
        username: user.username,
        fullname: user.fullName,
        email: user.email,
        role: user.role,
        token, 
    };
};

export const logoutUserService = async (req, res) => {
    res.clearCookie("jwt-token", {
        httpOnly: true,
        secure: true,
        sameSite: "Strict",
        path: "/", 
    });
};

