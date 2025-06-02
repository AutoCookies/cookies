// __tests__/auth/auth.rateLimiter.test.js

import request from "supertest";
import express from "express";

import { loginUser } from "../../controllers/auth.controller.js";
import { loginRateLimiter } from "../../middlewares/rateLimit.middleware.js";

import { loginUserService } from "../../services/auth.service.js";
jest.mock("../../services/auth.service.js", () => ({
  __esModule: true,
  loginUserService: jest.fn(),
}));

let app;
beforeAll(() => {
  app = express();
  app.use(express.json());
  // Gắn middleware rate limiter rồi tới controller:
  app.post("/api/v1/auth/login", loginRateLimiter, loginUser);
});

beforeEach(() => {
  jest.clearAllMocks();
  // Reset counter cũ của limiter cho IP "::ffff:127.0.0.1"
  // (đây là giá trị req.ip khi dùng supertest với localhost)
  loginRateLimiter.resetKey("::ffff:127.0.0.1");
});

describe("Brute‐force protection on POST /api/v1/auth/login", () => {
  it("n lần thất bại (401) → lần thứ 6 trả về 429", async () => {
    loginUserService.mockRejectedValue(new Error("Wrong email or password!"));

    // Gửi 5 lần request thất bại:
    for (let i = 1; i <= 5; i++) {
      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: "test@example.com", password: "badpass" });
      expect(res.status).toBe(401);
      expect(res.body).toEqual({ message: "Wrong email or password!" });
    }

    // Lần thứ 6 liên tiếp → 429
    const res6 = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "test@example.com", password: "badpass" });
    expect(res6.status).toBe(429);
    expect(res6.body).toEqual({
      status: 429,
      error: "Too many failed login attempts. Please try again later.",
    });
  });

  it("đạt 3 thất bại, rồi 1 thành công (không tăng count), tiếp tục 2 thất bại → 429 ở lần tiếp theo", async () => {
    // 1) 3 lần đầu thất bại → 401
    loginUserService.mockRejectedValue(new Error("Wrong email or password!"));
    for (let i = 1; i <= 3; i++) {
      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: "test@example.com", password: "badpass" });
      expect(res.status).toBe(401);
    }

    // Khi ê test tới đây, counter (cho IP) = 3

    // 2) Giờ giả lập thành công: loginUserService.resolve → status 200
    loginUserService.mockResolvedValue({
      _id: "user123",
      username: "testuser",
      fullname: "Test User",
      email: "test@example.com",
      role: "user",
      isBaned: false,
      token: "token-ok",
    });

    const successRes = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "test@example.com", password: "correctpass" });
    expect(successRes.status).toBe(200);
    expect(successRes.body).toHaveProperty("token", "token-ok");

    // Vì skipSuccessfulRequests: true, limiter sẽ không tăng counter,
    // nên counter vẫn = 3

    // 3) Bây giờ giả lập quay lại thất bại:
    loginUserService.mockRejectedValue(new Error("Wrong email or password!"));

    // 2 lần thất bại → counter = 5
    for (let i = 1; i <= 2; i++) {
      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: "test@example.com", password: "badpass" });
      expect(res.status).toBe(401);
    }

    // Lần thứ 6 (5+1) → 429
    const finalRes = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "test@example.com", password: "badpass" });
    expect(finalRes.status).toBe(429);
  });

  it("sau khi đã vượt quá limit (5 thất bại), ngay cả khi mật khẩu đúng cũng vẫn 429", async () => {
    // 1) 5 lần thất bại → 401
    loginUserService.mockRejectedValue(new Error("Wrong email or password!"));
    for (let i = 1; i <= 5; i++) {
      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: "test@example.com", password: "badpass" });
      expect(res.status).toBe(401);
    }

    // 2) Lần thứ 6 → 429
    const blockRes = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "test@example.com", password: "any" });
    expect(blockRes.status).toBe(429);

    // 3) Giả lập lần “thành công” (nhưng vẫn bị chặn vì IP đã vượt limit)
    loginUserService.mockResolvedValue({
      _id: "user123",
      username: "testuser",
      fullname: "Test User",
      email: "test@example.com",
      role: "user",
      isBaned: false,
      token: "token-ok",
    });

    const stillBlocked = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "test@example.com", password: "correctpass" });
    expect(stillBlocked.status).toBe(429);
    expect(stillBlocked.body).toEqual({
      status: 429,
      error: "Too many failed login attempts. Please try again later.",
    });
  });
});
