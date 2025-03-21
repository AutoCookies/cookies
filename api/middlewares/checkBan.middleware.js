import BanHistory from "../models/banHistory.model.js";

export const checkBanStatus = async (req, res, next) => {
    try {
        const userId = req.user?._id; // Lấy ID từ user đã đăng nhập
        if (!userId) {
            return res.status(401).json({ error: "Bạn chưa đăng nhập!" });
        }

        // Kiểm tra xem user có bị cấm không
        const activeBan = await BanHistory.findOne({
            user: userId,
            $or: [
                { banExpiresAt: null }, // Cấm vĩnh viễn
                { banExpiresAt: { $gte: new Date() } } // Cấm vẫn còn hiệu lực
            ]
        });

        if (activeBan) {
            return res.status(403).json({
                error: "Tài khoản của bạn đã bị cấm!",
                reason: activeBan.reason,
                banExpiresAt: activeBan.banExpiresAt
            });
        }

        next(); // Nếu không bị cấm thì tiếp tục xử lý
    } catch (error) {
        res.status(500).json({ error: "Lỗi kiểm tra trạng thái ban!" });
    }
};
