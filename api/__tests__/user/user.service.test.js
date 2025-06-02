// __tests__/user.service.test.js

import { jest } from '@jest/globals';
import bcrypt from 'bcryptjs';
import cloudinary from '../../config/cloudinary.js';

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
} from '../../services/user.service.js';

import User from '../../models/user.model.js';

// --- Mock User model methods ---
jest.mock('../../models/user.model.js', () => ({
  __esModule: true,
  default: {
    findById: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
  },
}));

// --- Mock bcrypt.compare ---
jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
}));

// --- Mock cloudinary uploader ---
jest.mock('../../config/cloudinary.js', () => ({
  __esModule: true,
  default: {
    uploader: {
      destroy: jest.fn(),
      upload_stream: jest.fn(),
    },
  },
}));

describe('User Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ------------------------
  // 1. getUser
  // ------------------------
  describe('getUser', () => {
    it('throws if user not found', async () => {
      // Mock: findById(...).select(...).lean() resolves to null
      User.findById.mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(null),
        }),
      });

      await expect(getUser('someId', { _id: 'otherId', role: 'user' })).rejects.toThrow(
        'User not found'
      );
      expect(User.findById).toHaveBeenCalledWith('someId');
    });

    it('returns limited fields for private profile when not owner or admin', async () => {
      const fakeUser = {
        _id: 'u1',
        username: 'user1',
        profilePicture: 'pic.png',
        bio: 'hello',
        visibility: 'private',
        coverPhoto: 'cover.png',
        // other fields omitted
      };

      User.findById.mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(fakeUser),
        }),
      });

      const result = await getUser('u1', { _id: 'otherUser', role: 'user' });
      expect(result).toEqual({
        username: 'user1',
        profilePicture: 'pic.png',
        bio: 'hello',
        visibility: 'private',
        coverPhoto: 'cover.png',
      });
    });

    it('returns full user object when public or owner or admin', async () => {
      const fakeUser = {
        _id: 'u2',
        username: 'user2',
        profilePicture: 'pic2.png',
        bio: 'hi',
        visibility: 'public',
        coverPhoto: 'cover2.png',
        email: 'a@b.com',
        role: 'user',
      };

      // Case: public profile
      User.findById.mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(fakeUser),
        }),
      });

      let result = await getUser('u2', { _id: 'other', role: 'user' });
      expect(result).toEqual(fakeUser);

      // Case: owner of private profile
      const privateUser = { ...fakeUser, visibility: 'private' };
      User.findById.mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(privateUser),
        }),
      });
      result = await getUser('u2', { _id: 'u2', role: 'user' });
      expect(result).toEqual(privateUser);

      // Case: admin viewing private profile
      User.findById.mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(privateUser),
        }),
      });
      result = await getUser('u2', { _id: 'someone', role: 'admin' });
      expect(result).toEqual(privateUser);
    });
  });

  // ------------------------
  // 2. changePasswordService
  // ------------------------
  describe('changePasswordService', () => {
    const userId = 'user123';

    it('throws if user not found', async () => {
      User.findById.mockResolvedValue(null);
      await expect(changePasswordService(userId, 'old', 'newpass')).rejects.toThrow(
        'Người dùng không tồn tại!'
      );
      expect(User.findById).toHaveBeenCalledWith(userId);
    });

    it('throws if current password does not match', async () => {
      const fakeUser = { password: 'hashed', save: jest.fn() };
      User.findById.mockResolvedValue(fakeUser);
      bcrypt.compare.mockResolvedValue(false);

      await expect(changePasswordService(userId, 'wrongOld', 'newpass')).rejects.toThrow(
        'Mật khẩu cũ không đúng!'
      );
      expect(bcrypt.compare).toHaveBeenCalledWith('wrongOld', 'hashed');
    });

    it('throws if new password is too short', async () => {
      const fakeUser = { password: 'hashed', save: jest.fn() };
      User.findById.mockResolvedValue(fakeUser);
      bcrypt.compare.mockResolvedValue(true);

      await expect(changePasswordService(userId, 'old', '123')).rejects.toThrow(
        'Mật khẩu mới phải có ít nhất 6 ký tự!'
      );
    });

    it('updates password successfully', async () => {
      const fakeUser = { password: 'hashed', save: jest.fn() };
      User.findById.mockResolvedValue(fakeUser);
      bcrypt.compare.mockResolvedValue(true);

      const result = await changePasswordService(userId, 'old', 'newpassword');

      expect(fakeUser.password).toBe('newpassword');
      expect(fakeUser.save).toHaveBeenCalled();
      expect(result).toEqual({ message: 'Mật khẩu đã được cập nhật thành công!' });
    });
  });

  // ------------------------
  // 3. changeUserNameService
  // ------------------------
  describe('changeUserNameService', () => {
    it('throws if user does not exist', async () => {
      User.findById.mockResolvedValue(null);
      await expect(changeUserNameService('u1', 'newName')).rejects.toThrow(
        'User does not exist'
      );
    });

    it('updates username successfully', async () => {
      const fakeUser = { username: 'old', save: jest.fn() };
      User.findById.mockResolvedValue(fakeUser);

      const result = await changeUserNameService('u1', 'newName');
      expect(fakeUser.username).toBe('newName');
      expect(fakeUser.save).toHaveBeenCalled();
      expect(result).toEqual({ message: 'Username updated successfully!' });
    });
  });

  // ------------------------
  // 4. changeUserFullnameService
  // ------------------------
  describe('changeUserFullnameService', () => {
    it('throws if user does not exist', async () => {
      User.findById.mockResolvedValue(null);
      await expect(changeUserFullnameService('u2', 'New Full')).rejects.toThrow(
        'User does not exist'
      );
    });

    it('updates fullName successfully', async () => {
      const fakeUser = { fullName: 'Old Full', save: jest.fn() };
      User.findById.mockResolvedValue(fakeUser);

      const result = await changeUserFullnameService('u2', 'New Full');
      expect(fakeUser.fullName).toBe('New Full');
      expect(fakeUser.save).toHaveBeenCalled();
      expect(result).toEqual({ message: 'Fullname updated successfully!' });
    });
  });

  // ------------------------
  // 5. changeUserPhoneNumberService
  // ------------------------
  describe('changeUserPhoneNumberService', () => {
    it('throws if user does not exist', async () => {
      User.findById.mockResolvedValue(null);
      await expect(changeUserPhoneNumberService('u3', '0123456789')).rejects.toThrow(
        'User does not exist'
      );
    });

    it('throws if new phone number is used by another user', async () => {
      const fakeUser = { _id: 'u3', phoneNumber: '000', save: jest.fn() };
      User.findById.mockResolvedValue(fakeUser);
      User.findOne.mockResolvedValue({ _id: 'otherUser', phoneNumber: '0123456789' });

      await expect(changeUserPhoneNumberService('u3', '0123456789')).rejects.toThrow(
        'Phone number is already in use by another user'
      );
      expect(User.findOne).toHaveBeenCalledWith({ phoneNumber: '0123456789' });
    });

    it('updates phone number successfully', async () => {
      const fakeUser = { _id: 'u3', phoneNumber: '000', save: jest.fn() };
      User.findById.mockResolvedValue(fakeUser);
      User.findOne.mockResolvedValue(null);

      const result = await changeUserPhoneNumberService('u3', '0987654321');
      expect(fakeUser.phoneNumber).toBe('0987654321');
      expect(fakeUser.save).toHaveBeenCalled();
      expect(result).toEqual({ message: 'Phone number changed successfully' });
    });
  });

  // ------------------------
  // 6. updateProfilePictureService
  // ------------------------
  describe('updateProfilePictureService', () => {
    const userId = 'u4';
    const buffer = Buffer.from('image data');

    it('throws if no imageBuffer provided', async () => {
      await expect(updateProfilePictureService(userId, null)).rejects.toThrow(
        'Không có ảnh để upload!'
      );
    });

    it('throws if user not found', async () => {
      User.findById.mockResolvedValue(null);
      await expect(updateProfilePictureService(userId, buffer)).rejects.toThrow(
        'Người dùng không tồn tại!'
      );
    });

    it('deletes old image and uploads new one', async () => {
      const fakeUser = {
        profilePicture: 'http://cloudinary.com/user_profiles/oldPic.png',
        save: jest.fn(),
      };
      User.findById.mockResolvedValue(fakeUser);

      cloudinary.uploader.destroy.mockResolvedValue({});
      const fakeResult = { secure_url: 'http://cloudinary.com/user_profiles/newPic.png' };
      cloudinary.uploader.upload_stream.mockImplementation((options, callback) => ({
        end: (buf) => callback(null, fakeResult),
      }));

      const result = await updateProfilePictureService(userId, buffer);
      expect(cloudinary.uploader.destroy).toHaveBeenCalledWith('user_profiles/oldPic');
      expect(cloudinary.uploader.upload_stream).toHaveBeenCalled();
      expect(fakeUser.profilePicture).toBe(fakeResult.secure_url);
      expect(fakeUser.save).toHaveBeenCalled();
      expect(result).toEqual({
        message: 'Ảnh đại diện đã được cập nhật thành công!',
        profilePicture: fakeResult.secure_url,
      });
    });

    it('throws if upload returns no secure_url', async () => {
      const fakeUser = { profilePicture: null, save: jest.fn() };
      User.findById.mockResolvedValue(fakeUser);
      cloudinary.uploader.upload_stream.mockImplementation((opts, cb) => ({
        end: () => cb(null, { url: 'no_secure' }),
      }));

      await expect(updateProfilePictureService(userId, buffer)).rejects.toThrow(
        'Không thể upload ảnh!'
      );
    });
  });

  // ------------------------
  // 7. updateCoverPhotoService
  // ------------------------
  describe('updateCoverPhotoService', () => {
    const userId = 'u5';
    const buffer = Buffer.from('cover data');

    it('throws if no imageBuffer provided', async () => {
      await expect(updateCoverPhotoService(userId, null)).rejects.toThrow(
        'Không có ảnh để upload!'
      );
    });

    it('throws if user not found', async () => {
      User.findById.mockResolvedValue(null);
      await expect(updateCoverPhotoService(userId, buffer)).rejects.toThrow(
        'Người dùng không tồn tại!'
      );
    });

    it('deletes old cover and uploads new one', async () => {
      const fakeUser = { coverPhoto: 'http://cloudinary.com/user_covers/oldCover.png', save: jest.fn() };
      User.findById.mockResolvedValue(fakeUser);

      cloudinary.uploader.destroy.mockResolvedValue({});
      const fakeResult = { secure_url: 'http://cloudinary.com/user_covers/newCover.png' };
      cloudinary.uploader.upload_stream.mockImplementation((opts, cb) => ({
        end: () => cb(null, fakeResult),
      }));

      const result = await updateCoverPhotoService(userId, buffer);
      expect(cloudinary.uploader.destroy).toHaveBeenCalledWith('user_covers/oldCover');
      expect(fakeUser.coverPhoto).toBe(fakeResult.secure_url);
      expect(fakeUser.save).toHaveBeenCalled();
      expect(result).toEqual({
        message: 'Ảnh bìa đã được cập nhật thành công!',
        coverPhoto: fakeResult.secure_url,
      });
    });

    it('throws if upload returns no secure_url', async () => {
      const fakeUser = { coverPhoto: null, save: jest.fn() };
      User.findById.mockResolvedValue(fakeUser);
      cloudinary.uploader.upload_stream.mockImplementation((opts, cb) => ({
        end: () => cb(null, { url: 'no_secure' }),
      }));

      await expect(updateCoverPhotoService(userId, buffer)).rejects.toThrow(
        'Không thể upload ảnh!'
      );
    });
  });

  // ------------------------
  // 8. getProfilePictureService & getCoverPhotoService
  // ------------------------
  describe('getProfilePictureService & getCoverPhotoService', () => {
    it('returns correct profile picture object', () => {
      const user = { _id: 'u6', profilePicture: 'pic.png' };
      const result = getProfilePictureService(user);
      expect(result).toEqual({ userId: 'u6', profilePicture: 'pic.png' });
    });

    it('returns coverPhoto: null if no coverPhoto', () => {
      expect(getCoverPhotoService({})).toEqual({ coverPhoto: null });
    });

    it('returns coverPhoto if exists', () => {
      expect(getCoverPhotoService({ coverPhoto: 'cover.png' })).toEqual({
        coverPhoto: 'cover.png',
      });
    });
  });

  // ------------------------
  // 9. getUserImagePageService
  // ------------------------
  describe('getUserImagePageService', () => {
    it('throws if user not found', async () => {
      // Mock: findById(...).select(...).lean() → null
      User.findById.mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(null),
        }),
      });
      await expect(getUserImagePageService('u7')).rejects.toThrow('User not found');
      expect(User.findById).toHaveBeenCalledWith('u7');
    });

    it('returns correct fields when user exists', async () => {
      const fakeUser = {
        username: 'user7',
        profilePicture: 'pp.png',
        coverPhoto: 'cp.png',
        followerCount: 10,
        followingCount: 5,
      };
      User.findById.mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(fakeUser),
        }),
      });

      const result = await getUserImagePageService('u7');
      expect(result).toEqual({
        username: 'user7',
        profilePicture: 'pp.png',
        coverPhoto: 'cp.png',
        followerCount: 10,
        followingCount: 5,
      });
    });

    it('fills missing fields with defaults', async () => {
      const fakeUser = { username: null }; 
      User.findById.mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(fakeUser),
        }),
      });

      const result = await getUserImagePageService('u8');
      expect(result).toEqual({
        username: null,
        profilePicture: null,
        coverPhoto: null,
        followerCount: 0,
        followingCount: 0,
      });
    });
  });

  // ------------------------
  // 10. searchUserByNameService
  // ------------------------
  describe('searchUserByNameService', () => {
    it('throws if query is empty or whitespace', async () => {
      await expect(searchUserByNameService('   ')).rejects.toThrow(
        'Tên tìm kiếm không hợp lệ!'
      );
    });

    it('limits result count to 50', async () => {
      // Mock .find(...).limit(...).select(...)
      const fakeUsers = Array(60).fill({ _id: 'u', username: 'a' });
      User.find.mockReturnValue({
        limit: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue(fakeUsers.slice(0, 50)),
        }),
      });

      const result = await searchUserByNameService('abc', 100);
      expect(User.find).toHaveBeenCalledWith({
        $or: [
          { fullname: { $regex: 'abc', $options: 'i' } },
          { username: { $regex: 'abc', $options: 'i' } },
        ],
      });
      expect(result).toHaveLength(50);
    });

    it('returns matched users when query is valid', async () => {
      const fakeUsers = [
        { _id: 'u9', username: 'john', fullname: 'John Doe', email: 'a@b.com', avatar: 'pic.png' },
      ];
      User.find.mockReturnValue({
        limit: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue(fakeUsers),
        }),
      });

      const result = await searchUserByNameService('john', 10);
      expect(result).toEqual(fakeUsers);
    });

    it('throws if underlying find throws', async () => {
      User.find.mockImplementation(() => {
        throw new Error('DB error');
      });
      await expect(searchUserByNameService('alice')).rejects.toThrow(
        'Lỗi khi tìm kiếm người dùng: DB error'
      );
    });
  });
});
