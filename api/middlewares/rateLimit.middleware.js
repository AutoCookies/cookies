import rateLimit from "express-rate-limit";

// Middleware giới hạn số request đăng nhập để tránh brute force
export const loginRateLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 phút
    max: 5, // Tối đa 5 lần đăng nhập thất bại
    handler: (req, res) => {
        return res.status(429).json({
            status: 429,
            error: "Too many failed login attempts. Please try again later.",
        });
    },
    skipSuccessfulRequests: true,
});

export const userRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100,
    message: "Too many requests to user API, please slow down.",
})

export const postRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 50,
    message: "Too many requests to post API, please slow down.",
});

export const createPostLimiter = rateLimit({
    windowMs: 30 * 60 * 1000, // 30 phút
    max: 10, // Tối đa 10 bài post mỗi 30 phút
    message: "Too many posts created. Please wait before posting again.",
});


export const commentLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 phút
    max: 20, // Tối đa 20 comment mỗi 10 phút
    message: "Too many comments. Please slow down.",
});