import jwt from 'jsonwebtoken';
import { ENV_VARS } from '../config/envVars.js';

/**
 * Generates a JSON Web Token (JWT) and sets it as an HTTP-only cookie.
 * @param {string} userId - The ID of the user.
 * @param {Response} res - The Express.js response object.
 * @returns {string} The generated JWT.
 */
export const generateTokenAndSetCookie = (userId, res) => {
    const token = jwt.sign({ userId: userId.toString() }, ENV_VARS.JWT_SECRET, { expiresIn: "1m" });

    res.cookie("jwt-token", token, {
        httpOnly: true,
        secure: false, // Set to true in production
        sameSite: "Lax",    
        maxAge: 15 * 60 * 1000,
        secure: true,
    });

    return token;
};


/**
 * Generate a JSON Web Refresh Token and set it as an HTTP-only cookie.
 * @param {string} userId - The ID of the user.
 * @param {Response} res - The Express.js response object.
 * @returns {string} The generated refresh token.
 */

export const generateRefreshTokenAndSetCookie = (userId, res) => {
    const refreshToken = jwt.sign({ userId: userId.toString() }, ENV_VARS.JWT_SECRET, { expiresIn: "30d" });

    res.cookie("jwt-refresh-token", refreshToken, {
        httpOnly: true,
        secure: false, // Set to true in production
        sameSite: "Lax",
        maxAge: 7 * 24 * 60 * 60,
        secure: true,
    });

    return refreshToken;
}
