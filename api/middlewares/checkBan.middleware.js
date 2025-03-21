export const checkBanStatus = async (req, res, next) => {
    const user = req.user; // User lấy từ middleware xác thực trước đó

    if (user.isBanned) {
        const now = new Date();
        
        // Kiểm tra nếu hết hạn ban thì bỏ cấm
        if (user.banExpiresAt && now >= new Date(user.banExpiresAt)) {
            user.isBanned = false;
            user.banExpiresAt = null;
            user.banReason = null;
            await user.save();
            return next(); // Cho phép tiếp tục vì đã hết hạn ban
        }

        return res.status(403).json({ 
            message: `Tài khoản của bạn đã bị cấm ${user.banExpiresAt ? `đến ${user.banExpiresAt}` : "vĩnh viễn"}.`,
            reason: user.banReason
        });
    }
    
    next();
};

