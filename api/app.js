// app.js
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRoutes from './routes/auth.route.js';
import userRoutes from './routes/user.route.js';
import adminRoutes from './routes/admin/admin.route.js';
import postRoute from './routes/post.route.js';
import commentRoute from './routes/comment.route.js';
import followRoute from './routes/follow.route.js';
import likeRoute from './routes/like.route.js';
import logRoutes from './routes/log.route.js';
import notficationRoutes from './routes/notification.route.js';
import chatRoute from './routes/chat.route.js';
import moderatorRoutes from './routes/moderator/post.route.js';

import { isAdmin, protectRoute } from "./middlewares/auth.middleware.js";
import { checkBanStatus } from "./middlewares/checkBan.middleware.js";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin: `${process.env.CLIENT_URL}`,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user", protectRoute, checkBanStatus, userRoutes);
app.use("/api/v1/admin", protectRoute, isAdmin, checkBanStatus, adminRoutes);
app.use("/api/v1/posts", protectRoute, checkBanStatus, postRoute);
app.use("/api/v1/comments", protectRoute, checkBanStatus, commentRoute);
app.use("/api/v1/likes", protectRoute, checkBanStatus, likeRoute);
app.use("/api/v1/follow", protectRoute, checkBanStatus, followRoute);
app.use("/api/v1/logs", logRoutes);
app.use("/api/v1/notifications", protectRoute, checkBanStatus, notficationRoutes);
app.use("/api/v1/chat", protectRoute, checkBanStatus, chatRoute);
app.use("/api/v1/moderator", protectRoute, isAdmin, checkBanStatus, moderatorRoutes);

export default app;
