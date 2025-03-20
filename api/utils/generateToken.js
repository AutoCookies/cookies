import jwt from 'jsonwebtoken';
import { ENV_VARS } from '../config/envVars.js';

export const generateTokenAndSetCookie = (userId, res) => {
  if (!res) {
      throw new Error("Response object (res) is undefined. Make sure to pass res from the controller.");
  }

  const token = jwt.sign({ userId }, ENV_VARS.JWT_SECRET, { expiresIn: "15d" });

  res.cookie("jwt-netflix", token, {
      maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days in MS
      httpOnly: true,
      sameSite: "strict",
      secure: false, // Dùng nếu chạy trên local
      // secure: ENV_VARS.NODE_ENV !== 'development'
  });

  return token;
};
