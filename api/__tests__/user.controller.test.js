// __tests__/user.controller.test.js

import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';

import {
  getUserProfile,
  changeUserPassword,
  changeUserName,
  changeUserFullname,
  changeUserPhoneNumber,
  updateProfilePicture,
  updateCoverPhoto,
  getProfilePicture,
  getCoverPhoto,
  getUserImagePage,
  searchUserByName,
} from '../controllers/user.controller.js';

import {
  getUser,
  changePasswordService,
  changeUserNameService,
  changeUserFullnameService,
  changeUserPhoneNumberService,
  updateProfilePictureService,
  updateCoverPhotoService,
  getProfilePictureService,
  getCoverPhotoService,
  getUserImagePageService,
  searchUserByNameService,
} from '../services/user.service.js';

// 1) Mock all service functions
jest.mock('../services/user.service.js', () => ({
  __esModule: true,
  getUser: jest.fn(),
  changePasswordService: jest.fn(),
  changeUserNameService: jest.fn(),
  changeUserFullnameService: jest.fn(),
  changeUserPhoneNumberService: jest.fn(),
  updateProfilePictureService: jest.fn(),
  updateCoverPhotoService: jest.fn(),
  getProfilePictureService: jest.fn(),
  getCoverPhotoService: jest.fn(),
  getUserImagePageService: jest.fn(),
  searchUserByNameService: jest.fn(),
}));

describe('User Controller Endpoints', () => {
  let app;

  // A small middleware to inject req.user for every request
  const injectUser = (req, res, next) => {
    req.user = { _id: 'loggedInUser', role: 'user', username: 'johndoe' };
    next();
  };

  beforeAll(() => {
    app = express();
    app.use(express.json());
    // Always populate req.user
    app.use(injectUser);

    // Simulate an uploaded file if “x-test-file” header is present
    const simulateFileUpload = (req, res, next) => {
      if (req.headers['x-test-file']) {
        req.file = { buffer: Buffer.from('fake-image-bytes') };
      }
      next();
    };

    // ========== Register routes in the CORRECT order ==========
    // 1) Static/specialized GET endpoints first:
    app.get('/users/profile-picture', getProfilePicture);
    app.post('/users/profile-picture', simulateFileUpload, updateProfilePicture);

    app.get('/users/cover-photo', getCoverPhoto);
    app.post('/users/cover-photo', simulateFileUpload, updateCoverPhoto);

    app.get('/users/search', searchUserByName);
    app.get('/users/image-page/:userId', getUserImagePage);

    // 2) Other POST endpoints (none of these overlap with /users/:id):
    app.post('/users/password', changeUserPassword);
    app.post('/users/username', changeUserName);
    app.post('/users/fullname', changeUserFullname);
    app.post('/users/phone', changeUserPhoneNumber);

    // 3) Finally, the generic “/users/:id”:
    app.get('/users/:id', getUserProfile);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ------------------------------------------------------------
  // 1) GET /users/:id → getUserProfile
  // ------------------------------------------------------------
  describe('GET /users/:id (getUserProfile)', () => {
    it('returns 404 if getUser throws "User not found"', async () => {
      getUser.mockRejectedValue(new Error('User not found'));

      const resp = await request(app).get('/users/does-not-exist');
      expect(resp.status).toBe(404);
      expect(resp.body).toEqual({ message: 'User not found' });
      expect(getUser).toHaveBeenCalledWith(
        'does-not-exist',
        { _id: 'loggedInUser', role: 'user', username: 'johndoe' }
      );
    });

    it('returns 200 with user object when getUser resolves', async () => {
      const fakeUser = { _id: 'u1', username: 'alice', visibility: 'public' };
      getUser.mockResolvedValue(fakeUser);

      const resp = await request(app).get('/users/u1');
      expect(resp.status).toBe(200);
      expect(resp.body).toEqual(fakeUser);
      expect(getUser).toHaveBeenCalledWith(
        'u1',
        { _id: 'loggedInUser', role: 'user', username: 'johndoe' }
      );
    });
  });

  // ------------------------------------------------------------
  // 2) POST /users/password → changeUserPassword
  // ------------------------------------------------------------
  describe('POST /users/password (changeUserPassword)', () => {
    it('returns 400 if either field is missing', async () => {
      const resp = await request(app)
        .post('/users/password')
        .send({ currentPassword: 'abc' }); // no newPassword

      expect(resp.status).toBe(400);
      expect(resp.body).toEqual({
        message: 'Vui lòng nhập đủ mật khẩu cũ và mật khẩu mới!',
      });
      expect(changePasswordService).not.toHaveBeenCalled();
    });

    it('calls changePasswordService and returns 200 on success', async () => {
      changePasswordService.mockResolvedValue({
        message: 'Mật khẩu đã được cập nhật thành công!',
      });

      const resp = await request(app)
        .post('/users/password')
        .send({ currentPassword: 'oldpass', newPassword: 'newpass123' });

      expect(resp.status).toBe(200);
      expect(resp.body).toEqual({
        message: 'Mật khẩu đã được cập nhật thành công!',
      });
      expect(changePasswordService).toHaveBeenCalledWith(
        'loggedInUser',
        'oldpass',
        'newpass123'
      );
    });

    it('returns 400 if changePasswordService throws', async () => {
      changePasswordService.mockRejectedValue(
        new Error('Người dùng không tồn tại!')
      );

      const resp = await request(app)
        .post('/users/password')
        .send({ currentPassword: 'old', newPassword: 'new' });

      expect(resp.status).toBe(400);
      expect(resp.body).toEqual({ message: 'Người dùng không tồn tại!' });
      expect(changePasswordService).toHaveBeenCalledWith(
        'loggedInUser',
        'old',
        'new'
      );
    });
  });

  // ------------------------------------------------------------
  // 3) POST /users/username → changeUserName
  // ------------------------------------------------------------
  describe('POST /users/username (changeUserName)', () => {
    it('returns 400 if newUsername is missing', async () => {
      const resp = await request(app).post('/users/username').send({});

      expect(resp.status).toBe(400);
      expect(resp.body).toEqual({ message: 'All fields must be filled' });
      expect(changeUserNameService).not.toHaveBeenCalled();
    });

    it('returns 200 on successful changeUserNameService', async () => {
      changeUserNameService.mockResolvedValue({
        message: 'Username updated successfully!',
      });

      const resp = await request(app)
        .post('/users/username')
        .send({ newUsername: 'newalice' });

      expect(resp.status).toBe(200);
      expect(resp.body).toEqual({ message: 'Username updated successfully!' });
      expect(changeUserNameService).toHaveBeenCalledWith(
        'loggedInUser',
        'newalice'
      );
    });

    it('returns 400 if service throws', async () => {
      changeUserNameService.mockRejectedValue(new Error('User does not exist'));

      const resp = await request(app)
        .post('/users/username')
        .send({ newUsername: 'newalice' });

      expect(resp.status).toBe(400);
      expect(resp.body).toEqual({ message: 'User does not exist' });
      expect(changeUserNameService).toHaveBeenCalledWith(
        'loggedInUser',
        'newalice'
      );
    });
  });

  // ------------------------------------------------------------
  // 4) POST /users/fullname → changeUserFullname
  // ------------------------------------------------------------
  describe('POST /users/fullname (changeUserFullname)', () => {
    it('returns 400 if newUserFullName is missing', async () => {
      const resp = await request(app).post('/users/fullname').send({});

      expect(resp.status).toBe(400);
      expect(resp.body).toEqual({ message: 'All fields are required' });
      expect(changeUserFullnameService).not.toHaveBeenCalled();
    });

    it('returns 200 on successful changeUserFullnameService', async () => {
      changeUserFullnameService.mockResolvedValue({
        message: 'Fullname updated successfully!',
      });

      const resp = await request(app)
        .post('/users/fullname')
        .send({ newUserFullName: 'Alice Wonderland' });

      expect(resp.status).toBe(200);
      expect(resp.body).toEqual({ message: 'Fullname updated successfully!' });
      expect(changeUserFullnameService).toHaveBeenCalledWith(
        'loggedInUser',
        'Alice Wonderland'
      );
    });

    it('returns 400 if service throws', async () => {
      changeUserFullnameService.mockRejectedValue(
        new Error('User does not exist')
      );

      const resp = await request(app)
        .post('/users/fullname')
        .send({ newUserFullName: 'Alice Wonderland' });

      expect(resp.status).toBe(400);
      expect(resp.body).toEqual({ message: 'User does not exist' });
      expect(changeUserFullnameService).toHaveBeenCalledWith(
        'loggedInUser',
        'Alice Wonderland'
      );
    });
  });

  // ------------------------------------------------------------
  // 5) POST /users/phone → changeUserPhoneNumber
  // ------------------------------------------------------------
  describe('POST /users/phone (changeUserPhoneNumber)', () => {
    it('returns 400 if newUserPhoneNumber is missing', async () => {
      const resp = await request(app).post('/users/phone').send({});

      expect(resp.status).toBe(400);
      expect(resp.body).toEqual({ message: 'Phone number is required' });
      expect(changeUserPhoneNumberService).not.toHaveBeenCalled();
    });

    it('returns 200 on successful changeUserPhoneNumberService', async () => {
      changeUserPhoneNumberService.mockResolvedValue({
        message: 'Phone number changed successfully',
      });

      const resp = await request(app)
        .post('/users/phone')
        .send({ newUserPhoneNumber: '0123456789' });

      expect(resp.status).toBe(200);
      expect(resp.body).toEqual({ message: 'Phone number changed successfully' });
      expect(changeUserPhoneNumberService).toHaveBeenCalledWith(
        'loggedInUser',
        '0123456789'
      );
    });

    it('returns 400 if service throws', async () => {
      changeUserPhoneNumberService.mockRejectedValue(
        new Error('Phone number is already in use by another user')
      );

      const resp = await request(app)
        .post('/users/phone')
        .send({ newUserPhoneNumber: '0123456789' });

      expect(resp.status).toBe(400);
      expect(resp.body).toEqual({
        message: 'Phone number is already in use by another user',
      });
      expect(changeUserPhoneNumberService).toHaveBeenCalledWith(
        'loggedInUser',
        '0123456789'
      );
    });
  });

  // ------------------------------------------------------------
  // 6) POST /users/profile-picture → updateProfilePicture
  // ------------------------------------------------------------
  describe('POST /users/profile-picture (updateProfilePicture)', () => {
    it('returns 400 if no file is uploaded', async () => {
      const resp = await request(app).post('/users/profile-picture').send({});

      expect(resp.status).toBe(400);
      expect(resp.body).toEqual({ error: 'Không có file nào được tải lên!' });
      expect(updateProfilePictureService).not.toHaveBeenCalled();
    });

    it('returns 200 on successful updateProfilePictureService', async () => {
      updateProfilePictureService.mockResolvedValue({
        message: 'Ảnh đại diện đã được cập nhật thành công!',
        profilePicture: 'http://newpic.png',
      });

      const resp = await request(app)
        .post('/users/profile-picture')
        .set('x-test-file', 'true')
        .send();

      expect(resp.status).toBe(200);
      expect(resp.body).toEqual({
        message: 'Ảnh đại diện đã được cập nhật thành công!',
        profilePicture: 'http://newpic.png',
      });
      expect(updateProfilePictureService).toHaveBeenCalledWith(
        'loggedInUser',
        expect.any(Buffer)
      );
    });

    it('returns 500 if service throws', async () => {
      updateProfilePictureService.mockRejectedValue(new Error('Service error'));

      const resp = await request(app)
        .post('/users/profile-picture')
        .set('x-test-file', 'true')
        .send();

      expect(resp.status).toBe(500);
      expect(resp.body).toEqual({ error: 'Service error' });
      expect(updateProfilePictureService).toHaveBeenCalledWith(
        'loggedInUser',
        expect.any(Buffer)
      );
    });
  });

  // ------------------------------------------------------------
  // 7) POST /users/cover-photo → updateCoverPhoto
  // ------------------------------------------------------------
  describe('POST /users/cover-photo (updateCoverPhoto)', () => {
    it('returns 400 if no file is uploaded', async () => {
      const resp = await request(app).post('/users/cover-photo').send({});

      expect(resp.status).toBe(400);
      expect(resp.body).toEqual({ error: 'Không có file nào được tải lên!' });
      expect(updateCoverPhotoService).not.toHaveBeenCalled();
    });

    it('returns 200 on successful updateCoverPhotoService', async () => {
      updateCoverPhotoService.mockResolvedValue({
        message: 'Ảnh bìa đã được cập nhật thành công!',
        coverPhoto: 'http://newcover.png',
      });

      const resp = await request(app)
        .post('/users/cover-photo')
        .set('x-test-file', 'true')
        .send();

      expect(resp.status).toBe(200);
      expect(resp.body).toEqual({
        message: 'Ảnh bìa đã được cập nhật thành công!',
        coverPhoto: 'http://newcover.png',
      });
      expect(updateCoverPhotoService).toHaveBeenCalledWith(
        'loggedInUser',
        expect.any(Buffer)
      );
    });

    it('returns 500 if service throws', async () => {
      updateCoverPhotoService.mockRejectedValue(new Error('Cover service error'));

      const resp = await request(app)
        .post('/users/cover-photo')
        .set('x-test-file', 'true')
        .send();

      expect(resp.status).toBe(500);
      expect(resp.body).toEqual({ error: 'Cover service error' });
      expect(updateCoverPhotoService).toHaveBeenCalledWith(
        'loggedInUser',
        expect.any(Buffer)
      );
    });
  });

  // ------------------------------------------------------------
  // 8) GET /users/profile-picture → getProfilePicture
  // ------------------------------------------------------------
  describe('GET /users/profile-picture (getProfilePicture)', () => {
    it('returns 200 with correct payload', async () => {
      getProfilePictureService.mockReturnValue({
        userId: 'loggedInUser',
        profilePicture: 'pic.png',
      });

      const resp = await request(app).get('/users/profile-picture');
      expect(resp.status).toBe(200);
      expect(resp.body).toEqual({
        userId: 'loggedInUser',
        profilePicture: 'pic.png',
      });
      expect(getProfilePictureService).toHaveBeenCalledWith({
        _id: 'loggedInUser',
        role: 'user',
        username: 'johndoe',
      });
    });

    it('returns 400 if service throws', async () => {
      getProfilePictureService.mockImplementation(() => {
        throw new Error('Some error');
      });

      const resp = await request(app).get('/users/profile-picture');
      expect(resp.status).toBe(400);
      expect(resp.body).toEqual({ message: 'Some error' });
      expect(getProfilePictureService).toHaveBeenCalledWith({
        _id: 'loggedInUser',
        role: 'user',
        username: 'johndoe',
      });
    });
  });

  // ------------------------------------------------------------
  // 9) GET /users/cover-photo → getCoverPhoto
  // ------------------------------------------------------------
  describe('GET /users/cover-photo (getCoverPhoto)', () => {
    it('returns 404 if coverPhoto is missing', async () => {
      getCoverPhotoService.mockResolvedValue({ coverPhoto: null });

      const resp = await request(app).get('/users/cover-photo');
      expect(resp.status).toBe(404);
      expect(resp.body).toEqual({ message: 'Người dùng chưa có ảnh biến' });
      expect(getCoverPhotoService).toHaveBeenCalledWith({
        _id: 'loggedInUser',
        role: 'user',
        username: 'johndoe',
      });
    });

    it('returns 200 with coverPhoto when exists', async () => {
      getCoverPhotoService.mockResolvedValue({ coverPhoto: 'cover.png' });

      const resp = await request(app).get('/users/cover-photo');
      expect(resp.status).toBe(200);
      expect(resp.body).toEqual({ coverPhoto: 'cover.png' });
      expect(getCoverPhotoService).toHaveBeenCalledWith({
        _id: 'loggedInUser',
        role: 'user',
        username: 'johndoe',
      });
    });

    it('returns 400 if service throws', async () => {
      getCoverPhotoService.mockRejectedValue(new Error('Unexpected error'));

      const resp = await request(app).get('/users/cover-photo');
      expect(resp.status).toBe(400);
      expect(resp.body).toEqual({ message: 'Unexpected error' });
      expect(getCoverPhotoService).toHaveBeenCalledWith({
        _id: 'loggedInUser',
        role: 'user',
        username: 'johndoe',
      });
    });
  });

  // ------------------------------------------------------------
  // 10) GET /users/image-page/:userId → getUserImagePage
  // ------------------------------------------------------------
  describe('GET /users/image-page/:userId (getUserImagePage)', () => {
    it('returns 404 if service throws "User not found"', async () => {
      getUserImagePageService.mockRejectedValue(new Error('User not found'));

      const resp = await request(app).get('/users/image-page/XYZ');
      expect(resp.status).toBe(404);
      expect(resp.body).toEqual({ message: 'User not found' });
      expect(getUserImagePageService).toHaveBeenCalledWith('XYZ');
    });

    it('returns 200 and profile when service resolves', async () => {
      const fakeProfile = {
        username: 'bob',
        profilePicture: 'bobpic.png',
        coverPhoto: 'bobcover.png',
        followerCount: 5,
        followingCount: 3,
      };
      getUserImagePageService.mockResolvedValue(fakeProfile);

      const resp = await request(app).get('/users/image-page/u9');
      expect(resp.status).toBe(200);
      expect(resp.body).toEqual(fakeProfile);
      expect(getUserImagePageService).toHaveBeenCalledWith('u9');
    });

    it('returns 500 on other errors', async () => {
      getUserImagePageService.mockRejectedValue(new Error('DB connection lost'));

      const resp = await request(app).get('/users/image-page/u9');
      expect(resp.status).toBe(500);
      expect(resp.body).toEqual({ message: 'Internal server error' });
      expect(getUserImagePageService).toHaveBeenCalledWith('u9');
    });
  });

  // ------------------------------------------------------------
  // 11) GET /users/search?name=...&limit=... → searchUserByName
  // ------------------------------------------------------------
  describe('GET /users/search (searchUserByName)', () => {
    it('returns 400 if name is missing or blank', async () => {
      const resp1 = await request(app).get('/users/search');
      expect(resp1.status).toBe(400);
      expect(resp1.body).toEqual({ error: 'Vui lòng nhập tên cần tìm!' });

      const resp2 = await request(app)
        .get('/users/search')
        .query({ name: '   ' });
      expect(resp2.status).toBe(400);
      expect(resp2.body).toEqual({ error: 'Vui lòng nhập tên cần tìm!' });

      expect(searchUserByNameService).not.toHaveBeenCalled();
    });

    it('returns 200 with users array when service resolves', async () => {
      const fakeUsers = [{ _id: 'x1', username: 'charlie' }];
      searchUserByNameService.mockResolvedValue(fakeUsers);

      const resp = await request(app)
        .get('/users/search')
        .query({ name: 'char', limit: '5' });
      expect(resp.status).toBe(200);
      expect(resp.body).toEqual(fakeUsers);
      expect(searchUserByNameService).toHaveBeenCalledWith('char', 5);
    });

    it('treats missing limit as 10 and returns users', async () => {
      const fakeUsers = [{ _id: 'x2', username: 'dave' }];
      searchUserByNameService.mockResolvedValue(fakeUsers);

      const resp = await request(app)
        .get('/users/search')
        .query({ name: 'dav' });
      expect(resp.status).toBe(200);
      expect(resp.body).toEqual(fakeUsers);
      expect(searchUserByNameService).toHaveBeenCalledWith('dav', 10);
    });

    it('returns 500 if service throws', async () => {
      searchUserByNameService.mockRejectedValue(new Error('Search error'));

      const resp = await request(app)
        .get('/users/search')
        .query({ name: 'abc', limit: '3' });
      expect(resp.status).toBe(500);
      expect(resp.body).toEqual({ error: 'Search error' });
      expect(searchUserByNameService).toHaveBeenCalledWith('abc', 3);
    });
  });
});
