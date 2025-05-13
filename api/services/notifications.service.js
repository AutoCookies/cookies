import { Notification } from "../models/notification.model.js";
import FollowUser from "../models/followUser.model.js";
import mongoose from "mongoose";

export const getNotifications = async (userId, page = 1, limit = 10) => {
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
        Notification.find({ user: userId })
            .populate("fromUser", "username profilePicture")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        Notification.countDocuments({ user: userId }),
    ]);

    return {
        notifications,
        total,
        page,
        totalPages: Math.ceil(total / limit)
    };
};

export const markNotificationsAsSeen = async (userId) => {
    await Notification.updateMany({ user: userId, seen: false }, { $set: { seen: true } });
};

export const addNotificationService = async (userId, fromUserId, type, content) => {
    try {
        const notification = new Notification({
            user: userId,
            fromUser: fromUserId,
            type,
            content,
        });
        await notification.save();
        return notification;
    } catch (error) {
        console.error("Error adding notification:", error);
        throw error;
    }
}

/**
 * Gửi notification đến tất cả followers của actorId
 * @param {string} actorId - User thực hiện hành động
 * @param {"like"|"comment"|"follow"|"mention"} type
 * @param {string} content - Nội dung notification
 */
export const notifyFollowersService = async (fromUser, type, content) => {

    console.log("fromUser: ", fromUser);
    console.log("typeof fromUser: ", typeof fromUser);
    console.log("isValidObjectId: ", mongoose.Types.ObjectId.isValid(fromUser));
    console.log("instanceof ObjectId: ", fromUser instanceof mongoose.Types.ObjectId);

    console.log("type: ", type);
    console.log("content: ", content);

    const fromUserId = mongoose.Types.ObjectId.createFromHexString(fromUser);

    // Lấy danh sách followers của actorId
    const followDocs = await FollowUser
        .find({ following: fromUserId }) // Chuyển đổi từ ObjectId sang string
        .select("follower")
        .lean();

    console.log("Followers found:", followDocs.length);
    if (!followDocs.length) return;

    // Tạo notification cho từng follower
    await Promise.all(
        followDocs.map(doc =>
            addNotificationService(
                doc.follower.toString(), // user nhận
                fromUser,                 // fromUser
                type,
                content
            )
        )
    );
};

export const updateSeenStatusService = async (userId, notificationIds) => {
    if (!notificationIds || !notificationIds.length) return;

    await Notification.updateMany(
        { user: userId, _id: { $in: notificationIds.toString() } },
        { $set: { seen: true } }
    );
}