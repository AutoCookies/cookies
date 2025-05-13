import {
    getNotifications,
    markNotificationsAsSeen,
    addNotificationService,
    notifyFollowersService,
    updateSeenStatusService,
} from "../services/notifications.service.js";

export const fetchNotifications = async (req, res) => {
    const userId = req.user._id;
    const { page = 1, limit = 10 } = req.query;

    try {
        const data = await getNotifications(userId, parseInt(page), parseInt(limit));
        res.status(200).json({ success: true, data });
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({ success: false, message: "Lỗi khi lấy thông báo" });
    }
};

export const markAllAsSeen = async (req, res) => {
    const userId = req.user._id;

    try {
        await markNotificationsAsSeen(userId);
        res.status(200).json({ success: true, message: "Đã đánh dấu tất cả là đã xem" });
    } catch (error) {
        console.error("Error updating notifications:", error);
        res.status(500).json({ success: false, message: "Không thể cập nhật trạng thái thông báo" });
    }
};

export const addNotification = async (req, res) => {
    const userId = req.user._id; // Người sẽ nhận thông báo
    const { fromUserId, type, content } = req.body;

    try {
        const notification = await addNotificationService(userId, fromUserId, type, content);

        // Gửi thông báo realtime nếu có socket đang kết nối
        if (global._io) {
            // Gửi thông báo chỉ đến user nhận (đã join room userId trước đó)
            global._io.to(userId.toString()).emit("new-notification", notification);
        }

        res.status(200).json({ success: true, notification });
    } catch (error) {
        console.error("Error adding notification:", error);
        res.status(500).json({ success: false, message: "Không thể thêm thông báo" });
    }
};

/**
 * Controller để gửi notification đến followers khi user thực hiện hành động
 * POST /notifications/followers
 * body: { type, content }
 */
export const sendToFollowersController = async (req, res) => {
    const fromUser = req.user._id; // Giả sử đã xác thực và gán user vào req.user

    const { type, content } = req.body;
    try {
        await notifyFollowersService(fromUser, type, content);
        res.status(200).json({ success: true, message: "Notifications sent to followers." });
    } catch (error) {
        console.error("Error sending notifications to followers:", error);
        res.status(500).json({ success: false, message: "Failed to notify followers." });
    }
};

export const updateSeenStatus = async (req, res) => {
    const userId = req.user._id; // Giả sử đã xác thực và gán user vào req.user
    const { notificationId } = req.body;

    try {
        const updatedNotification = await updateSeenStatusService(userId, notificationId);
        res.status(200).json({ success: true, notification: updatedNotification });
    } catch (error) {
        console.error("Error updating notification status:", error);
        res.status(500).json({ success: false, message: "Không thể cập nhật trạng thái thông báo" });
    }
};