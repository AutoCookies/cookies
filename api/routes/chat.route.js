import {
    sendMessage
} from '../controllers/chat.controller.js';

import express from 'express';

const router = express.Router();
// Route to send a message
router.post('/send', sendMessage);

export default router;