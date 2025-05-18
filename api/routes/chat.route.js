import {
    sendMessage,
    getAllChats,
} from '../controllers/chat.controller.js';

import express from 'express';

const router = express.Router();
// Route to send a message
router.post('/send', sendMessage);
router.get('/getAllChats', getAllChats);

export default router;