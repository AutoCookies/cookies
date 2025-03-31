import jwt from 'jsonwebtoken';
import { ENV_VARS } from '../config/envVars.js';

/**
 * Generates a JSON Web Token (JWT) and sets it as an HTTP-only cookie.
 * @param {string} userId - The ID of the user.
 * @param {Response} res - The Express.js response object.
 * @returns {string} The generated JWT.
 */
export const generateTokenAndSetCookie = (userId, res) => {
    const token = jwt.sign({ userId: userId.toString() }, ENV_VARS.JWT_SECRET, { expiresIn: "7d" });

    res.cookie("jwt-token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Lax",    
        maxAge: 7 * 24 * 60 * 60 * 1000,
        secure: false,
    });

    return token;
};

