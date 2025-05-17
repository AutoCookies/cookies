import {
    sendMessageService
} from "../services/chat.service.js";

export const sendMessage = async (req, res) => {
    const { chatId, content } = req.body;
    const userId = req.user._id;

    try {
        await sendMessageService(chatId, content, userId);
        res.status(200).json({ message: "Message sent successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}