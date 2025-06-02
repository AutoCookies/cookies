// __tests__/auth.controller.test.js

import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';

// --- Mock services and rate limiter before importing controllers ---
jest.mock('../../services/auth.service.js', () => ({
  __esModule: true,
  registerUserService: jest.fn(),
  loginUserService: jest.fn(),
  logoutUserService: jest.fn(),
  getUserInfoService: jest.fn(),
}));

jest.mock('../../middlewares/rateLimit.middleware.js', () => ({
  __esModule: true,
  loginRateLimiter: {
    handler: jest.fn((req, res, next) => next()),
    resetKey: jest.fn(),
  },
}));

// Now import controllers and the mocked services/middleware
import {
  registerUser,
  loginUser,
  logoutUser,
  getAuthUser,
} from '../../controllers/auth.controller.js';

import {
  registerUserService,
  loginUserService,
  logoutUserService,
  getUserInfoService,
} from '../../services/auth.service.js';

import { loginRateLimiter } from '../../middlewares/rateLimit.middleware.js';

// --- Create an Express app for testing ---
function createApp() {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());

  app.post('/api/v1/auth/register', registerUser);
  app.post('/api/v1/auth/login', loginRateLimiter.handler, loginUser);
  app.post('/api/v1/auth/logout', logoutUser);

  // GET /api/v1/auth/me: simulate auth middleware by checking req.user
  app.get(
    '/api/v1/auth/me',
    (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      next();
    },
    getAuthUser
  );

  return app;
}

describe('Auth Controller', () => {
  let app;

  beforeAll(() => {
    app = createApp();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ---------------------------
  // registerUser
  // ---------------------------
  describe('POST /api/v1/auth/register', () => {
    it('should return 200 and message if any field is missing', async () => {
      registerUserService.mockResolvedValue({ error: true, message: 'All fields are required!' });

      const resp = await request(app)
        .post('/api/v1/auth/register')
        .send({ email: 'a@a.com' }); // missing username, fullName, password

      expect(registerUserService).toHaveBeenCalledWith(
        { email: 'a@a.com' },
        expect.any(Object)
      );
      expect(resp.status).toBe(200);
      expect(resp.body).toEqual({ message: 'All fields are required!' });
    });

    it('should return 200 and message if validation error occurs', async () => {
      registerUserService.mockResolvedValue({ error: true, message: 'Invalid email!' });

      const payload = {
        username: 'bob',
        fullName: 'Bob Smith',
        email: 'not-an-email',
        password: 'password123',
      };

      const resp = await request(app)
        .post('/api/v1/auth/register')
        .send(payload);

      expect(registerUserService).toHaveBeenCalledWith(payload, expect.any(Object));
      expect(resp.status).toBe(200);
      expect(resp.body).toEqual({ message: 'Invalid email!' });
    });

    it('should return 201 and data when service succeeds', async () => {
      const fakeData = {
        _id: 'uid123',
        username: 'alice',
        email: 'alice@example.com',
        role: 'user',
        token: 'jwt-xyz',
      };
      registerUserService.mockResolvedValue({ error: false, data: fakeData });

      const payload = {
        username: 'alice',
        fullName: 'Alice Wonderland',
        email: 'alice@example.com',
        password: 'secret123',
      };

      const resp = await request(app)
        .post('/api/v1/auth/register')
        .send(payload);

      expect(registerUserService).toHaveBeenCalledWith(payload, expect.any(Object));
      expect(resp.status).toBe(201);
      expect(resp.body).toEqual(fakeData);
    });

    it('should return 500 on unexpected error', async () => {
      registerUserService.mockRejectedValue(new Error('DB failure'));

      const payload = {
        username: 'jane',
        fullName: 'Jane Doe',
        email: 'jane@example.com',
        password: 'password123',
      };

      const resp = await request(app)
        .post('/api/v1/auth/register')
        .send(payload);

      expect(registerUserService).toHaveBeenCalledWith(payload, expect.any(Object));
      expect(resp.status).toBe(500);
      expect(resp.body).toEqual({ message: 'Internal server error' });
    });
  });

  // ---------------------------
  // loginUser
  // ---------------------------
  describe('POST /api/v1/auth/login', () => {
    it('should return 400 if email or password is missing', async () => {
      const resp = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'test@example.com' }); // missing password

      expect(resp.status).toBe(400);
      expect(resp.body).toEqual({ message: 'Email and password are required!' });
      expect(loginUserService).not.toHaveBeenCalled();
    });

    it('should return 401 if service throws "Wrong email or password!"', async () => {
      loginUserService.mockRejectedValue(new Error('Wrong email or password!'));

      const resp = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'test@example.com', password: 'wrong' });

      expect(loginRateLimiter.handler).toHaveBeenCalled();
      expect(loginUserService).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'wrong',
        res: expect.any(Object),
      });
      expect(resp.status).toBe(401);
      expect(resp.body).toEqual({ message: 'Wrong email or password!' });
    });

    it('should return 200 and user data when service succeeds', async () => {
      const fakeUserData = {
        _id: 'u123',
        username: 'bob',
        fullname: 'Bob Builder',
        email: 'bob@example.com',
        role: 'user',
        isBaned: false,
        token: 'jwt-abc',
      };
      loginUserService.mockResolvedValue(fakeUserData);

      const resp = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'bob@example.com', password: 'password123' });

      expect(loginRateLimiter.handler).toHaveBeenCalled();
      expect(loginUserService).toHaveBeenCalledWith({
        email: 'bob@example.com',
        password: 'password123',
        res: expect.any(Object),
      });
      expect(loginRateLimiter.resetKey).toHaveBeenCalledWith('bob@example.com');
      expect(resp.status).toBe(200);
      expect(resp.body).toEqual(fakeUserData);
    });

    it('should return 500 on unexpected error', async () => {
      loginUserService.mockRejectedValue(new Error('Some DB failure'));

      const resp = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'bob@example.com', password: 'password123' });

      expect(resp.status).toBe(500);
      expect(resp.body).toEqual({ message: 'Internal server error' });
    });
  });

  // ---------------------------
  // logoutUser
  // ---------------------------
  describe('POST /api/v1/auth/logout', () => {
    it('should return 400 if no jwt-token cookie', async () => {
      const resp = await request(app).post('/api/v1/auth/logout');
      expect(resp.status).toBe(400);
      expect(resp.body).toEqual({ message: 'Bạn chưa đăng nhập!' });
      expect(logoutUserService).not.toHaveBeenCalled();
    });

    it('should return 200 and call logoutUserService when cookie present', async () => {
      const resp = await request(app)
        .post('/api/v1/auth/logout')
        .set('Cookie', ['jwt-token=some-token']);

      expect(logoutUserService).toHaveBeenCalledWith(expect.any(Object), expect.any(Object));
      expect(resp.status).toBe(200);
      expect(resp.body).toEqual({ message: 'Đăng xuất thành công!' });
    });
  });

  // ---------------------------
  // getAuthUser
  // ---------------------------
  describe('GET /api/v1/auth/me', () => {
    it('should return 401 if req.user not set', async () => {
      const resp = await request(app).get('/api/v1/auth/me');
      expect(resp.status).toBe(401);
      expect(resp.body).toEqual({ message: 'Unauthorized' });
      expect(getUserInfoService).not.toHaveBeenCalled();
    });

    it('should return 404 if service throws "User not found"', async () => {
      const fakeUserId = 'uid-nonexist';
      getUserInfoService.mockRejectedValue(new Error('User not found'));

      // Override to set req.user
      const tempApp = express();
      tempApp.use(express.json());
      tempApp.use((req, res, next) => {
        req.user = { _id: fakeUserId };
        next();
      });
      tempApp.get('/api/v1/auth/me', getAuthUser);

      const resp = await request(tempApp).get('/api/v1/auth/me');
      expect(getUserInfoService).toHaveBeenCalledWith(fakeUserId);
      expect(resp.status).toBe(404);
      expect(resp.body).toEqual({ message: 'User not found' });
    });

    it('should return 200 and user object when service succeeds', async () => {
      const fakeUser = {
        _id: 'u456',
        username: 'charlie',
        role: 'user',
        email: 'charlie@example.com',
        profilePicture: 'avatar.png',
      };
      getUserInfoService.mockResolvedValue(fakeUser);

      const tempApp = express();
      tempApp.use(express.json());
      tempApp.use((req, res, next) => {
        req.user = { _id: fakeUser._id };
        next();
      });
      tempApp.get('/api/v1/auth/me', getAuthUser);

      const resp = await request(tempApp).get('/api/v1/auth/me');
      expect(getUserInfoService).toHaveBeenCalledWith(fakeUser._id);
      expect(resp.status).toBe(200);
      expect(resp.body).toEqual(fakeUser);
    });
  });
});
