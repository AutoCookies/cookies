import express from 'express';
const router = express.Router();

import {
    fetchNotifications,
    markAllAsSeen,
    addNotification,
    sendToFollowersController
} from '../controllers/notifications.controller.js';

router.get("/", fetchNotifications);
router.post("/mark", markAllAsSeen);
router.post("/", addNotification);
router.post("/followers", sendToFollowersController);

export default router;