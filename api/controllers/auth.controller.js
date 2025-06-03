// controllers/auth.controller.js
import {
    registerUserService,
    loginUserService,
    logoutUserService,
    getUserInfoService
} from "../services/auth.service.js";
import { loginRateLimiter } from "../middlewares/rateLimit.middleware.js";
const FAIL_TTL = 10 * 60;

export const registerUser = async (req, res) => {
    try {
        // Gọi service
        const result = await registerUserService(req.body, res);

        // Nếu service trả về error: true, nghĩa là thiếu field hoặc validation fail
        if (result.error) {
            // Trả status 200 và thông điệp tương ứng
            return res.status(200).json({ message: result.message });
        }

        // Ngược lại, thành công
        return res.status(201).json(result.data);
    } catch (error) {
        // Trường hợp bất thường (chẳng hạn lỗi DB, v.v)
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const loginUser = async (req, res) => {
  const { email, password, recaptchaToken } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required!" });
  }

  const failKey = `login_fail:${email}`;

  try {
    // 1) Lấy số lần đăng nhập thất bại hiện tại
    const failCountRaw = await redisClient.get(failKey);
    const failCount = parseInt(failCountRaw) || 0;

    // 2) Nếu đã quá 3 lần thất bại, yêu cầu phải có recaptchaToken
    if (failCount >= 3) {
      if (!recaptchaToken) {
        return res.status(400).json({ message: "Vui lòng giải reCAPTCHA." });
      }
      // 2.1) Verify reCAPTCHA với Google
      const ip = req.ip || ""; // nếu Next.js không cung cấp req.ip, có thể dùng req.headers['x-forwarded-for']
      const recaptchaRes = await verifyRecaptchaToken(recaptchaToken, ip);

      if (!recaptchaRes.success) {
        return res
          .status(400)
          .json({ message: "reCAPTCHA xác thực thất bại, vui lòng thử lại." });
      }
      // (Nếu dùng v3, có thể check thêm recaptchaRes.score >= 0.5)
    }

    // 3) Tiếp tục gọi service để authenticate email/password
    const userData = await loginUserService({ email, password, res });

    // 4) Nếu thành công, reset failCount → xóa key
    await redisClient.del(failKey);

    // Reset rateLimiter key nếu có
    loginRateLimiter.resetKey(email);

    return res.status(200).json(userData);
  } catch (error) {
    // Nếu lỗi do sai email/password
    if (error.message === "Wrong email or password!") {
      // 5) Tăng failCount trên Redis
      // Sử dụng INCR và set expire nếu lần đầu
      const newFailCount = await redisClient.incr(failKey);
      if (newFailCount === 1) {
        // lần đầu tạo key, set expire
        await redisClient.expire(failKey, FAIL_TTL);
      }

      // Nếu mới tăng lên 3, bạn có thể muốn thông báo đặc biệt
      if (newFailCount === 3) {
        return res
          .status(401)
          .json({
            message:
              "Sai email hoặc mật khẩu. Bạn đã thử sai 3 lần, vui lòng giải reCAPTCHA ở lần thử tiếp theo.",
            needCaptcha: true,
          });
      }

      // Nếu vẫn < 3 lần, trả lỗi bình thường
      return res.status(401).json({ message: error.message });
    }

    // Những lỗi khác (ví dụ lỗi server, Redis không truy xuất được, v.v.)
    console.error("Lỗi loginUser:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const logoutUser = async (req, res) => {
    if (!req.cookies["jwt-token"]) {
        return res.status(400).json({ message: "Bạn chưa đăng nhập!" });
    }

    logoutUserService(req, res);
    return res.status(200).json({ message: "Đăng xuất thành công!" });
};

export const getAuthUser = async (req, res) => {
    try {
        const user = await getUserInfoService(req.user._id);
        res.json(user);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};
