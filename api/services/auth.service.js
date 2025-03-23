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

/**
 * Authenticates a user with the provided email and password.
 * Generates a JWT token and sets it as an HTTP-only cookie.
 * 
 * @param {Object} params - The login parameters.
 * @param {string} params.email - The user's email.
 * @param {string} params.password - The user's password.
 * @param {Response} params.res - The Express.js response object.
 * @throws {Error} If the response object is missing or authentication fails.
 * @returns {Object} An object containing user details and the JWT token.
 */
export const loginUserService = async ({ email, password, res }) => {
    // Ensure the response object is provided
    if (!res) {
        throw new Error("Response object (res) is required!");
    }

    // Find the user by email
    const user = await User.findOne({ email });
    
    // Verify user existence and password match
    if (!user || !(await user.matchPassword(password))) {
        throw new Error("Wrong email or password!");
    }

    // Generate token and set it as a cookie
    const token = generateTokenAndSetCookie(user._id, res);

    // Return user details and token
    return {
        _id: user._id,
        username: user.username,
        fullname: user.fullName,
        email: user.email,
        role: user.role,
        token, 
    };
};

// Sau này front end nên cho xóa ảnh và token khi đăng xuất
export const logoutUserService = async (req, res) => {
    res.clearCookie("jwt-token", {
        httpOnly: true,
        secure: true,
        sameSite: "Strict",
        path: "/", 
    });
};

