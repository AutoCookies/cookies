// __tests__/post.service.test.js

import { jest } from '@jest/globals';

import {
  createPostService,
  getOwnPostsService,
  updatePostService,
  updateSharePostService,
  deletePostService,
  sharePostService,
  getAllPostsService,
  getPostsByUserIdService,
} from '../../services/post.service.js';

import User from '../../models/user.model.js';
import Post from '../../models/post.model.js';
import { SharePost } from '../../models/sharedPost.model.js';
import LikePost from '../../models/likePost.model.js';
import { uploadImageService } from '../../services/upload.service.js';
import cloudinary from '../../config/cloudinary.js';
import redisClient from '../../config/redisClient.js';

// --- Mock external dependencies and models ---
jest.mock('../../models/user.model.js', () => ({
  __esModule: true,
  default: {
    findById: jest.fn(),
  },
}));

jest.mock('../../models/post.model.js', () => ({
  __esModule: true,
  default: {
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  },
}));

jest.mock('../../models/sharedPost.model.js', () => {
  const mSharePost = jest.fn().mockImplementation((data) => ({
    ...data,
    save: jest.fn(),
    deleteOne: jest.fn(),
  }));
  mSharePost.find = jest.fn();
  mSharePost.findById = jest.fn();
  mSharePost.findByIdAndUpdate = jest.fn();
  return {
    __esModule: true,
    SharePost: mSharePost,
  };
});

jest.mock('../../models/likePost.model.js', () => ({
  __esModule: true,
  default: {
    find: jest.fn(),
  },
}));

jest.mock('../../services/upload.service.js', () => ({
  __esModule: true,
  uploadImageService: jest.fn(),
}));

jest.mock('../../config/cloudinary.js', () => ({
  __esModule: true,
  default: {
    uploader: {
      destroy: jest.fn(),
    },
  },
}));

jest.mock('../../config/redisClient.js', () => ({
  __esModule: true,
  default: {
    set: jest.fn(),
    get: jest.fn(),
    del: jest.fn(),
  },
}));

describe('Post Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ---------------------------
  // 1. createPostService
  // ---------------------------
  describe('createPostService', () => {
    const userId = 'user123';

    it('throws if user does not exist', async () => {
      User.findById.mockResolvedValue(null);
      await expect(createPostService(userId, 'Title', 'Content', null)).rejects.toThrow(
        'Người dùng không tồn tại!'
      );
      expect(User.findById).toHaveBeenCalledWith(userId);
    });

    it('throws if title missing and no content/image', async () => {
      const fakeUser = { _id: userId, posts: [], save: jest.fn() };
      User.findById.mockResolvedValue(fakeUser);
      await expect(createPostService(userId, '', '', null)).rejects.toThrow(
        'Bài đăng phải có tiêu đề và ít nhất nội dung hoặc ảnh!'
      );
    });

    it('throws if invalid visibility', async () => {
      const fakeUser = { _id: userId, posts: [], save: jest.fn() };
      User.findById.mockResolvedValue(fakeUser);
      await expect(
        createPostService(userId, 'Title', 'Content', null, 'invalid')
      ).rejects.toThrow('Chế độ hiển thị không hợp lệ!');
    });

    it('creates post without image and caches it', async () => {
      const fakeUser = { _id: userId, posts: [], save: jest.fn() };
      User.findById.mockResolvedValue(fakeUser);

      const fakePost = {
        _id: 'post123',
        user: userId,
        title: 'Title',
        content: 'Content',
        image: '',
        visibility: 'public',
      };
      Post.create.mockResolvedValue(fakePost);

      redisClient.set.mockResolvedValue('OK');

      const result = await createPostService(userId, 'Title', 'Content', null, 'public');

      expect(User.findById).toHaveBeenCalledWith(userId);
      expect(Post.create).toHaveBeenCalledWith({
        user: userId,
        title: 'Title',
        content: 'Content',
        image: '',
        visibility: 'public',
      });
      expect(fakeUser.posts).toContain(fakePost._id);
      expect(fakeUser.save).toHaveBeenCalled();
      expect(redisClient.set).toHaveBeenCalledWith(
        `post:${fakePost._id}`,
        JSON.stringify(fakePost),
        { EX: 600 }
      );
      expect(result).toEqual(fakePost);
    });

    it('uploads image when imageBuffer provided', async () => {
      const fakeUser = { _id: userId, posts: [], save: jest.fn() };
      User.findById.mockResolvedValue(fakeUser);

      uploadImageService.mockResolvedValue('http://image.url/img.png');
      const fakePost = {
        _id: 'post456',
        user: userId,
        title: 'Title',
        content: '',
        image: 'http://image.url/img.png',
        visibility: 'public',
      };
      Post.create.mockResolvedValue(fakePost);
      redisClient.set.mockResolvedValue('OK');

      const buffer = Buffer.from('fake');
      const result = await createPostService(userId, 'Title', '', buffer, 'public');

      expect(uploadImageService).toHaveBeenCalledWith(buffer);
      expect(Post.create).toHaveBeenCalledWith({
        user: userId,
        title: 'Title',
        content: '',
        image: 'http://image.url/img.png',
        visibility: 'public',
      });
      expect(result).toEqual(fakePost);
    });
  });

  // ---------------------------
  // 2. getOwnPostsService
  // ---------------------------
  describe('getOwnPostsService', () => {
    const userId = 'user789';

    it('throws if user does not exist', async () => {
      User.findById.mockResolvedValue(null);
      await expect(getOwnPostsService(userId)).rejects.toThrow('Người dùng không tồn tại!');
      expect(User.findById).toHaveBeenCalledWith(userId);
    });

    it('returns combined posts and shared posts with like status', async () => {
      const fakeUser = { _id: userId };
      User.findById.mockResolvedValue(fakeUser);

      const fakePost = {
        _id: 'p1',
        user: userId,
        content: 'Post content',
        createdAt: new Date('2023-01-02'),
      };
      const postChain = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([fakePost]),
      };
      Post.find.mockReturnValue(postChain);

      const fakeShared = {
        _id: 's1',
        user: userId,
        originalPost: { _id: 'p2', createdAt: new Date('2023-01-01') },
        createdAt: new Date('2023-01-01'),
      };
      const shareChain = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([fakeShared]),
      };
      SharePost.find.mockReturnValue(shareChain);

      LikePost.find.mockReturnValue({
        distinct: jest.fn().mockResolvedValue(['p1']),
      });

      const result = await getOwnPostsService(userId, 1, 10);

      expect(Post.find).toHaveBeenCalledWith({ user: userId });
      expect(SharePost.find).toHaveBeenCalledWith({ user: userId });
      expect(result).toEqual([
        { ...fakePost, isLiked: true },
        { ...fakeShared, isLiked: false },
      ]);
    });
  });

  // ---------------------------
  // 3. updatePostService
  // ---------------------------
  describe('updatePostService', () => {
    const userId = 'userUpdate';
    const postId = 'postUpdate';

    it('throws if user not found', async () => {
      User.findById.mockResolvedValue(null);
      await expect(updatePostService(userId, postId, 'New', 'Content', null)).rejects.toThrow(
        'Người dùng không tồn tại!'
      );
      expect(User.findById).toHaveBeenCalledWith(userId);
    });

    it('throws if post not found', async () => {
      const fakeUser = { _id: userId };
      User.findById.mockResolvedValue(fakeUser);
      Post.findById.mockResolvedValue(null);
      await expect(
        updatePostService(userId, postId, 'New', 'Content', null)
      ).rejects.toThrow('Bài viết không tồn tại!');
      expect(Post.findById).toHaveBeenCalledWith(postId);
    });

    it('throws if not owner', async () => {
      const fakeUser = { _id: userId };
      User.findById.mockResolvedValue(fakeUser);
      const otherPost = { _id: postId, user: 'otherUser', image: '', save: jest.fn() };
      Post.findById.mockResolvedValue(otherPost);
      await expect(
        updatePostService(userId, postId, 'Title', 'Content', null)
      ).rejects.toThrow('Bạn không có quyền chỉnh sửa bài viết này!');
    });

    it('updates without changing image', async () => {
      const fakeUser = { _id: userId };
      User.findById.mockResolvedValue(fakeUser);

      const fakePost = {
        _id: postId,
        user: userId,
        title: 'Old',
        content: 'OldC',
        image: 'url',
      };
      Post.findById.mockResolvedValue(fakePost);
      const updatedPost = { ...fakePost, title: 'New', content: 'NewC' };
      Post.findByIdAndUpdate.mockResolvedValue(updatedPost);
      redisClient.del.mockResolvedValue(1);

      const result = await updatePostService(userId, postId, 'New', 'NewC', null);

      expect(Post.findByIdAndUpdate).toHaveBeenCalledWith(
        postId,
        { title: 'New', content: 'NewC', image: 'url' },
        { new: true, runValidators: true }
      );
      expect(redisClient.del).toHaveBeenCalledWith(`post:${postId}`);
      expect(result).toEqual(updatedPost);
    });

    it('updates with new image and deletes old from Cloudinary', async () => {
      const fakeUser = { _id: userId };
      User.findById.mockResolvedValue(fakeUser);

      const fakePost = {
        _id: postId,
        user: userId,
        title: 'Old',
        content: 'OldC',
        image: 'http://cloudinary.com/post_images/oldImg.png',
      };
      Post.findById.mockResolvedValue(fakePost);

      const buffer = Buffer.from('img');
      uploadImageService.mockResolvedValue('http://cloudinary.com/post_images/newImg.png');

      const updatedPost = { ...fakePost, image: 'http://cloudinary.com/post_images/newImg.png' };
      Post.findByIdAndUpdate.mockResolvedValue(updatedPost);
      redisClient.del.mockResolvedValue(1);

      const result = await updatePostService(userId, postId, undefined, undefined, buffer);

      const publicId = 'oldImg';
      expect(cloudinary.uploader.destroy).toHaveBeenCalledWith(`post_images/${publicId}`);
      expect(uploadImageService).toHaveBeenCalledWith(buffer);
      expect(Post.findByIdAndUpdate).toHaveBeenCalledWith(
        postId,
        { title: 'Old', content: 'OldC', image: 'http://cloudinary.com/post_images/newImg.png' },
        { new: true, runValidators: true }
      );
      expect(redisClient.del).toHaveBeenCalledWith(`post:${postId}`);
      expect(result).toEqual(updatedPost);
    });
  });

  // ---------------------------
  // 4. updateSharePostService
  // ---------------------------
  describe('updateSharePostService', () => {
    const userId = 'userShare';
    const sharePostId = 'share123';

    it('throws if share post not found', async () => {
      SharePost.findById.mockResolvedValue(null);
      await expect(updateSharePostService(userId, sharePostId, 'New Caption')).rejects.toThrow(
        'Bài viết không tồn tại!'
      );
    });

    it('throws if not owner', async () => {
      const fakeShare = { _id: sharePostId, user: 'otherUser' };
      SharePost.findById.mockResolvedValue(fakeShare);
      await expect(updateSharePostService(userId, sharePostId, 'New Caption')).rejects.toThrow(
        'Bạn không có quyền chỉnh sửa bài viết này!'
      );
    });

    it('updates caption and deletes cache', async () => {
      const fakeShare = { _id: sharePostId, user: userId };
      SharePost.findById.mockResolvedValue(fakeShare);

      const updatedShare = { ...fakeShare, caption: 'New Caption' };
      SharePost.findByIdAndUpdate.mockResolvedValue(updatedShare);
      redisClient.del.mockResolvedValue(1);

      const result = await updateSharePostService(userId, sharePostId, 'New Caption');

      expect(SharePost.findById).toHaveBeenCalledWith(sharePostId);
      expect(SharePost.findByIdAndUpdate).toHaveBeenCalledWith(
        sharePostId,
        { caption: 'New Caption' },
        { new: true, runValidators: true }
      );
      expect(redisClient.del).toHaveBeenCalledWith(`post:${sharePostId}`);
      expect(result).toEqual(updatedShare);
    });
  });

  // ---------------------------
  // 5. deletePostService
  // ---------------------------
  describe('deletePostService', () => {
    const userId = 'userDel';
    const postId = 'postDel';

    it('throws if user not found', async () => {
      User.findById.mockResolvedValue(null);
      await expect(deletePostService(userId, postId)).rejects.toThrow('Người dùng không tồn tại!');
      expect(User.findById).toHaveBeenCalledWith(userId);
    });

    it('throws if neither Post nor SharePost found', async () => {
      const fakeUser = { _id: userId, posts: [], save: jest.fn() };
      User.findById.mockResolvedValue(fakeUser);
      Post.findById.mockResolvedValue(null);
      SharePost.findById.mockResolvedValue(null);

      await expect(deletePostService(userId, postId)).rejects.toThrow('Bài viết không tồn tại!');
    });

    it('throws if not owner of either type', async () => {
      const fakeUser = { _id: userId, posts: [], save: jest.fn() };
      User.findById.mockResolvedValue(fakeUser);
      const fakePost = { _id: postId, user: 'otherUser', deleteOne: jest.fn() };
      Post.findById.mockResolvedValue(fakePost);
      SharePost.findById.mockResolvedValue(null);

      await expect(deletePostService(userId, postId)).rejects.toThrow(
        'Bạn không có quyền xóa bài viết này!'
      );
    });

    it('deletes a Post (with image) and clears cache', async () => {
      const fakeUser = { _id: userId, posts: [postId], save: jest.fn() };
      User.findById.mockResolvedValue(fakeUser);

      const fakePost = {
        _id: postId,
        user: userId,
        image: 'http://cloudinary.com/post_images/img123.png',
        deleteOne: jest.fn(),
      };
      Post.findById.mockResolvedValue(fakePost);
      SharePost.findById.mockResolvedValue(null);

      redisClient.del.mockResolvedValue(1);

      const result = await deletePostService(userId, postId);

      expect(cloudinary.uploader.destroy).toHaveBeenCalledWith('post_images/img123');
      expect(fakeUser.posts).not.toContain(postId);
      expect(fakeUser.save).toHaveBeenCalled();
      expect(fakePost.deleteOne).toHaveBeenCalled();
      expect(redisClient.del).toHaveBeenCalledWith(`post:${postId}`);
      expect(result).toEqual({ message: 'Bài viết đã được xóa thành công!' });
    });

    it('deletes a SharePost and clears cache', async () => {
      const fakeUser = { _id: userId, posts: [], save: jest.fn() };
      User.findById.mockResolvedValue(fakeUser);

      Post.findById.mockResolvedValue(null);
      const fakeShare = {
        _id: postId,
        user: userId,
        deleteOne: jest.fn(),
      };
      SharePost.findById.mockResolvedValue(fakeShare);

      redisClient.del.mockResolvedValue(1);

      const result = await deletePostService(userId, postId);

      expect(fakeUser.posts).not.toContain(postId);
      expect(fakeUser.save).toHaveBeenCalled();
      expect(fakeShare.deleteOne).toHaveBeenCalled();
      expect(redisClient.del).toHaveBeenCalledWith(`post:${postId}`);
      expect(result).toEqual({ message: 'Bài viết đã được xóa thành công!' });
    });
  });

  // ---------------------------
  // 6. sharePostService
  // ---------------------------
  describe('sharePostService', () => {
    const userId = 'userShare2';
    const postId = 'orig123';

    it('throws if original post nor share found', async () => {
      Post.findById.mockResolvedValue(null);
      SharePost.findById.mockResolvedValue(null);

      await expect(sharePostService(userId, postId, 'Caption', 'public')).rejects.toThrow(
        'Bài viết không tồn tại!'
      );
    });

    it('creates new SharePost for original Post', async () => {
      const fakePost = { _id: postId };
      Post.findById.mockResolvedValue(fakePost);
      SharePost.findById.mockResolvedValue(null);

      // Spy on SharePost constructor
      const saveMock = jest.fn();
      SharePost.mockImplementation(function (data) {
        Object.assign(this, data);
        this.save = saveMock;
      });

      const result = await sharePostService(userId, postId, 'Nice!', 'friends');

      expect(Post.findById).toHaveBeenCalledWith(postId);
      expect(saveMock).toHaveBeenCalled();
      expect(result).toBeInstanceOf(SharePost);
      expect(result.caption).toBe('Nice!');
      expect(result.visibility).toBe('friends');
      expect(result.originalPost).toBe(postId);
    });
  });

  // ---------------------------
  // 7. getAllPostsService
  // ---------------------------
  describe('getAllPostsService', () => {
    const userId = 'userAll';

    it('returns only public posts and shared posts with correct like status', async () => {
      const fakePost = {
        _id: 'pA',
        visibility: 'public',
        createdAt: new Date('2023-02-02'),
        user: { username: 'A', profilePicture: 'picA' },
      };
      const postChain = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([fakePost]),
      };
      Post.find.mockReturnValue(postChain);

      const fakeOrig = {
        _id: 'pB',
        visibility: 'public',
        createdAt: new Date('2023-02-01'),
        user: { username: 'B', profilePicture: 'picB' },
      };
      const fakeShared = {
        _id: 'sA',
        visibility: 'public',
        createdAt: new Date('2023-02-01'),
        user: { username: 'C', profilePicture: 'picC' },
        originalPost: fakeOrig,
      };
      const shareChain = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([fakeShared]),
      };
      SharePost.find.mockReturnValue(shareChain);

      LikePost.find.mockReturnValue({
        distinct: jest.fn().mockResolvedValue(['pA']),
      });

      const result = await getAllPostsService(userId, 1, 10);

      expect(Post.find).toHaveBeenCalledWith({ visibility: 'public' });
      expect(SharePost.find).toHaveBeenCalledWith({ visibility: 'public' });
      expect(result).toEqual([
        { ...fakePost, isLiked: true },
        { ...fakeShared, isLiked: false },
      ]);
    });
  });

  // ---------------------------
  // 8. getPostsByUserIdService
  // ---------------------------
  describe('getPostsByUserIdService', () => {
    const userId = 'userABC';

    it('returns undefined if user not found', async () => {
      User.findById.mockResolvedValue(null);
      const result = await getPostsByUserIdService(userId);
      expect(User.findById).toHaveBeenCalledWith(userId);
      expect(result).toBeUndefined();
    });

    it('returns only user posts and shared posts (public) with like status', async () => {
      const fakeUser = { _id: userId };
      User.findById.mockResolvedValue(fakeUser);

      const fakePost = {
        _id: 'pX',
        user: userId,
        createdAt: new Date('2023-03-02'),
        originalPost: { visibility: 'public' },
      };
      const postChain = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([fakePost]),
      };
      Post.find.mockReturnValue(postChain);

      const fakeShare1 = {
        _id: 'sX',
        user: userId,
        originalPost: { visibility: 'public', _id: 'pZ', createdAt: new Date('2023-03-01') },
        createdAt: new Date('2023-03-01'),
      };
      const fakeShare2 = {
        _id: 'sY',
        user: userId,
        originalPost: { visibility: 'private', _id: 'pW', createdAt: new Date('2023-03-00') },
        createdAt: new Date('2023-03-00'),
      };
      const shareChain = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([fakeShare1, fakeShare2]),
      };
      SharePost.find.mockReturnValue(shareChain);

      LikePost.find.mockReturnValue({
        distinct: jest.fn().mockResolvedValue(['pX']),
      });

      const result = await getPostsByUserIdService(userId, 1, 10);

      expect(User.findById).toHaveBeenCalledWith(userId);
      expect(Post.find).toHaveBeenCalledWith({ user: userId });
      expect(SharePost.find).toHaveBeenCalledWith({ user: userId });
      expect(result).toEqual([
        { ...fakePost, isLiked: true },
        { ...fakeShare1, isLiked: false },
      ]);
    });
  });
});
