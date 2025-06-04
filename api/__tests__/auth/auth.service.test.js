// __tests__/auth.service.test.js

import { jest } from '@jest/globals';

import User from '../../models/user.model.js';
import redisClient from '../../config/redisClient.js';
import { generateTokenAndSetCookie } from '../../utils/generateToken.js';

import {
  registerUserService,
  loginUserService,
  logoutUserService,
  getUserInfoService,
} from '../../services/auth.service.js';

// --- Mock external dependencies ---
jest.mock('../../models/user.model.js', () => ({
  __esModule: true,
  default: {
    exists: jest.fn(),
    create: jest.fn(),
    findOne: jest.fn(),
    findById: jest.fn(),
  },
}));

jest.mock('../../config/redisClient.js', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  },
}));

jest.mock('../../utils/generateToken.js', () => ({
  __esModule: true,
  generateTokenAndSetCookie: jest.fn(),
}));

describe('Auth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ---------------------------
  // 1. registerUserService
  // ---------------------------
  describe('registerUserService', () => {
    const fakeRes = { cookie: jest.fn() };
    const validPayload = {
      username: 'alice',
      fullName: 'Alice Wonderland',
      email: 'alice@example.com',
      password: 'secret123',
    };

    it('returns error object if any field is missing', async () => {
      // Missing fullName, username, etc.
      let result = await registerUserService({ email: 'a@a.com' }, fakeRes);
      expect(result).toEqual({ error: true, message: 'All fields are required!' });

      result = await registerUserService(
        { username: 'a', fullName: '', email: 'a@a.com', password: '123456' },
        fakeRes
      );
      expect(result).toEqual({ error: true, message: 'All fields are required!' });
    });

    it('returns error object if email is invalid', async () => {
      const payload = { ...validPayload, email: 'invalid-email' };
      const result = await registerUserService(payload, fakeRes);
      expect(result).toEqual({ error: true, message: 'Invalid email!' });
    });

    it('returns error object if password is too short', async () => {
      const payload = { ...validPayload, password: '123' };
      const result = await registerUserService(payload, fakeRes);
      expect(result).toEqual({ error: true, message: 'Password must be at least 6 characters!' });
    });

    it('returns error object if email already exists', async () => {
      User.exists.mockResolvedValue(true);
      const result = await registerUserService(validPayload, fakeRes);
      expect(User.exists).toHaveBeenCalledWith({ email: validPayload.email });
      expect(result).toEqual({ error: true, message: 'Email already exists!' });
    });

    it('returns error object if create fails', async () => {
      User.exists.mockResolvedValue(false);
      User.create.mockResolvedValue(null);
      const result = await registerUserService(validPayload, fakeRes);
      expect(User.exists).toHaveBeenCalledWith({ email: validPayload.email });
      expect(User.create).toHaveBeenCalledWith({
        username: validPayload.username,
        fullName: validPayload.fullName,
        email: validPayload.email,
        password: validPayload.password,
        role: 'user',
      });
      expect(result).toEqual({ error: true, message: 'Create user failed!' });
    });

    it('returns data when creation succeeds', async () => {
      const fakeUser = {
        _id: 'user123',
        username: 'alice',
        email: 'alice@example.com',
        role: 'user',
      };
      User.exists.mockResolvedValue(false);
      User.create.mockResolvedValue(fakeUser);
      generateTokenAndSetCookie.mockReturnValue('jwt-token-xyz');

      const result = await registerUserService(validPayload, fakeRes);

      expect(User.exists).toHaveBeenCalledWith({ email: validPayload.email });
      expect(User.create).toHaveBeenCalledWith({
        username: validPayload.username,
        fullName: validPayload.fullName,
        email: validPayload.email,
        password: validPayload.password,
        role: 'user',
      });
      expect(generateTokenAndSetCookie).toHaveBeenCalledWith(fakeUser._id, fakeRes);

      expect(result).toEqual({
        error: false,
        data: {
          _id: fakeUser._id,
          username: fakeUser.username,
          email: fakeUser.email,
          role: fakeUser.role,
          token: 'jwt-token-xyz',
        },
      });
    });
  });

  // ---------------------------
  // 2. loginUserService
  // ---------------------------
  describe('loginUserService', () => {
    const fakeRes = { cookie: jest.fn() };
    const creds = { email: 'bob@example.com', password: 'password123', res: fakeRes };

    it('throws if res is missing', async () => {
      await expect(loginUserService({ email: 'a@a.com', password: '123456' })).rejects.toThrow(
        'Response object (res) is required!'
      );
    });

    it('throws if user not found or password mismatch', async () => {
      // User not found
      User.findOne.mockResolvedValue(null);
      await expect(loginUserService(creds)).rejects.toThrow('Wrong email or password!');
      expect(User.findOne).toHaveBeenCalledWith({ email: creds.email });

      // User found but matchPassword false
      const mockUser = { matchPassword: jest.fn().mockResolvedValue(false) };
      User.findOne.mockResolvedValue(mockUser);
      await expect(loginUserService(creds)).rejects.toThrow('Wrong email or password!');
      expect(mockUser.matchPassword).toHaveBeenCalledWith(creds.password);
    });

    it('deletes old session and returns data when Redis has existing token', async () => {
      const mockUser = {
        _id: 'bob123',
        username: 'bob',
        fullName: 'Bob Builder',
        email: creds.email,
        role: 'user',
        isBanned: false,
        matchPassword: jest.fn().mockResolvedValue(true),
      };
      User.findOne.mockResolvedValue(mockUser);
      redisClient.get.mockResolvedValue('old-session-token');
      redisClient.del.mockResolvedValue(1);
      generateTokenAndSetCookie.mockReturnValue('new-jwt-token');
      redisClient.set.mockResolvedValue('OK');

      const result = await loginUserService(creds);

      expect(User.findOne).toHaveBeenCalledWith({ email: creds.email });
      expect(mockUser.matchPassword).toHaveBeenCalledWith(creds.password);
      expect(redisClient.get).toHaveBeenCalledWith(`user_session:${mockUser._id}`);
      expect(redisClient.del).toHaveBeenCalledWith(`user_session:${mockUser._id}`);

      expect(generateTokenAndSetCookie).toHaveBeenCalledWith(mockUser._id, fakeRes);
      expect(redisClient.set).toHaveBeenCalledWith(
        `user_session:${mockUser._id}`,
        'new-jwt-token',
        'EX',
        24 * 60 * 60
      );

      expect(result).toEqual({
        _id: mockUser._id,
        username: mockUser.username,
        fullname: mockUser.fullName,
        email: mockUser.email,
        role: mockUser.role,
        isBaned: mockUser.isBanned,
        token: 'new-jwt-token',
      });
    });

    it('creates new session and returns data when no existing token', async () => {
      const mockUser = {
        _id: 'jane123',
        username: 'jane',
        fullName: 'Jane Doe',
        email: creds.email,
        role: 'user',
        isBanned: false,
        matchPassword: jest.fn().mockResolvedValue(true),
      };
      User.findOne.mockResolvedValue(mockUser);
      redisClient.get.mockResolvedValue(null);
      generateTokenAndSetCookie.mockReturnValue('fresh-jwt-token');
      redisClient.set.mockResolvedValue('OK');

      const result = await loginUserService(creds);

      expect(User.findOne).toHaveBeenCalledWith({ email: creds.email });
      expect(mockUser.matchPassword).toHaveBeenCalledWith(creds.password);
      expect(redisClient.get).toHaveBeenCalledWith(`user_session:${mockUser._id}`);
      expect(redisClient.del).not.toHaveBeenCalled();

      expect(generateTokenAndSetCookie).toHaveBeenCalledWith(mockUser._id, fakeRes);
      expect(redisClient.set).toHaveBeenCalledWith(
        `user_session:${mockUser._id}`,
        'fresh-jwt-token',
        'EX',
        24 * 60 * 60
      );

      expect(result).toEqual({
        _id: mockUser._id,
        username: mockUser.username,
        fullname: mockUser.fullName,
        email: mockUser.email,
        role: mockUser.role,
        isBaned: mockUser.isBanned,
        token: 'fresh-jwt-token',
      });
    });
  });

  // ---------------------------
  // 3. logoutUserService
  // ---------------------------
  describe('Auth Service - logoutUserService', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('clears cookie and does not call redis.del when req.user._id is missing', async () => {
      // Arrange: req.user undefined
      const fakeReq = { user: undefined };
      const fakeRes = { clearCookie: jest.fn() };

      // Act
      await logoutUserService(fakeReq, fakeRes);

      // Assert: clearCookie called with correct args
      expect(fakeRes.clearCookie).toHaveBeenCalledWith('jwt-token', {
        httpOnly: true,
        secure: true,
        sameSite: 'Strict',
        path: '/',
      });
      // redisClient.del should NOT be called
      expect(redisClient.del).not.toHaveBeenCalled();
    });

    it('clears cookie and calls redis.del with correct key when req.user._id exists', async () => {
      // Arrange: req.user._id provided
      const fakeReq = { user: { _id: 'user123' } };
      const fakeRes = { clearCookie: jest.fn() };

      // Act
      await logoutUserService(fakeReq, fakeRes);

      // Assert: clearCookie called
      expect(fakeRes.clearCookie).toHaveBeenCalledWith('jwt-token', {
        httpOnly: true,
        secure: true,
        sameSite: 'Strict',
        path: '/',
      });
      // redisClient.del called with "user_session:user123"
      expect(redisClient.del).toHaveBeenCalledWith('user_session:user123');
    });
  });

  // ---------------------------
  // 4. getUserInfoService
  // ---------------------------
  describe('getUserInfoService', () => {
    it('throws if user not found', async () => {
      // Mock chained: User.findById(...).select(...) returns promise resolving to null
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });

      await expect(getUserInfoService('nonexistent')).rejects.toThrow('User not found');
      expect(User.findById).toHaveBeenCalledWith('nonexistent');
    });

    it('returns user object when found', async () => {
      const fakeUser = {
        _id: 'uid999',
        username: 'charlie',
        role: 'user',
        email: 'charlie@example.com',
        profilePicture: 'pic.png',
      };
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(fakeUser),
      });

      const result = await getUserInfoService('uid999');
      expect(User.findById).toHaveBeenCalledWith('uid999');
      expect(result).toEqual(fakeUser);
    });
  });
});
