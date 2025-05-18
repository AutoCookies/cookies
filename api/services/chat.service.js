import Chat from "../models/chat.model.js";
import Message from "../models/chatMessages.model.js";

// Khi nhấn vào khung chat thì sẽ gọi api để lấy tất cả đoạn Chat mà user đang có.
// Nếu nhấn vào đoạn Chat sẽ gọi api lấy tất cả các Message trong đoạn Chat đó.
// Message sẽ có senderId là id của người gửi, content là nội dung tin nhắn, chatId là id của đoạn chat mà message đó thuộc về. 
// Cho nên nếu senderId = currentUserId thì sẽ có cách hiển thị riêng cho người gửi và người nhận.

export const sendMessageService = async (chatId, content, userId) => {
    try {

        const message = await Message.create({
            sender: userId,
            content,
            chat: chatId,
            isRead: false,
        });

        const chat = await Chat.findById(chatId);
        if (!chat) {
            throw new Error("Chat not found");
        }

        chat.latestMessage = message._id;
        await chat.save();

    } catch (error) {
        throw new Error("Failed to send message");
    }
}

export const getAllChatsService = async (userId) => {
    try {
        const chats = await Chat.find({ users: userId })
            .populate("users", "-password")
            .populate({
                path: "latestMessage",
                populate: {
                    path: "sender",
                    select: "username email"
                }
            })
            .sort({ updatedAt: -1 }); // Sắp xếp chat theo thời gian cập nhật gần nhất

        return chats;
    } catch (error) {
        throw new Error("Failed to get chats");
    }
}

export const getAllMessagesOfChatService = async (chatId) => {
    try {
        const messages = await Message.find({ chat: chatId })
            .populate("sender", "-password")
            .populate("chat");
        return messages;
    } catch (error) {
        throw new Error("Failed to get messages");
    }
}