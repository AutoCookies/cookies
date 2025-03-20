import jwt from 'jsonwebtoken';
import { ENV_VARS } from '../config/envVars.js';

/**
 * Generates a JSON Web Token (JWT) and sets it as an HTTP-only cookie.
 * @param {string} userId - The ID of the user.
 * @param {Response} res - The Express.js response object.
 * @returns {string} The generated JWT.
 */
export const generateTokenAndSetCookie = (userId, res) => {
    if (!userId || !res) {
        throw new Error("userId and res are required to generate a JWT and set it as a cookie.");
    }

    // Generate a JSON Web Token using the user ID and the JWT secret key.
    const token = jwt.sign({ userId }, ENV_VARS.JWT_SECRET, { expiresIn: "7d" });

    // Set the JWT as an HTTP-only cookie. This means that the cookie
    // can only be accessed by the server and not by the client.
    res.cookie("jwt-token", token, {
        // Set the cookie to be HTTP-only. This means that the cookie
        // can only be accessed by the server and not by the client.
        httpOnly: true,

        // Set the cookie to be secure. This means that the cookie will
        // only be sent over a secure connection (i.e. HTTPS).
        secure: ENV_VARS.NODE_ENV === "production",

        // Set the cookie to be same-site strict. This means that the
        // cookie will only be sent with requests that originate from
        // the same site.
        sameSite: "strict",

        // Set the maximum age of the cookie to 7 days.
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return token;
};

