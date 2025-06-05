import jwt from 'jsonwebtoken';
import { ENV_VARS } from '../config/envVars.js';

const extractToken = (req) => {
    return req.cookies?.['jwt-token'] || 
           req.headers.authorization?.split(' ')[1];
};

export const verifyAccessToken = (req) => {
    try {
        const token = extractToken(req);
        if (!token) {
            throw new Error("No authentication token found");
        }
        return jwt.verify(token, ENV_VARS.JWT_SECRET);
    } catch (error) {
        throw error; // Re-throw để middleware xử lý
    }
};


