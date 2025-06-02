// __tests__/post.controller.test.js

import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';

// A fake auth middleware that injects req.user
const mockAuth = (req, res, next) => {
  req.user = { _id: 'user123' };
  next();
};

// Mock all service functions before importing the controllers
jest.mock('../../services/post.service.js', () => ({
  __esModule: true,
  createPostService: jest.fn(),
  getOwnPostsService: jest.fn(),
  updatePostService: jest.fn(),
  deletePostService: jest.fn(),
  sharePostService: jest.fn(),
  getAllPostsService: jest.fn(),
  updateSharePostService: jest.fn(),
  getPostsByUserIdService: jest.fn(),
}));

// Now import the controller functions (using the mocked services)
import {
  createPost,
  getOwnPosts,
  updatePost,
  deletePost,
  sharePost,
  getAllPosts,
  updateSharePost,
  getPostsByUserId,
} from '../../controllers/post.controller.js';

import {
  createPostService,
  getOwnPostsService,
  updatePostService,
  deletePostService,
  sharePostService,
  getAllPostsService,
  updateSharePostService,
  getPostsByUserIdService,
} from '../../services/post.service.js';

describe('Post Controller', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());

    // Mount each controller on a test route
    app.post('/api/posts', mockAuth, createPost);
    app.get('/api/posts', mockAuth, getOwnPosts);
    app.put('/api/posts/:postId', mockAuth, updatePost);
    app.put('/api/posts/share/:sharePostId', mockAuth, updateSharePost);
    app.delete('/api/posts/:postId', mockAuth, deletePost);
    app.post('/api/posts/:postId/share', mockAuth, sharePost);
    app.get('/api/posts/all', mockAuth, getAllPosts);
    app.get('/api/posts/user/:userId', getPostsByUserId);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ---------------------------
  // 1. createPost
  // ---------------------------
  describe('POST /api/posts', () => {
    it('should return 400 if visibility is invalid', async () => {
      const resp = await request(app)
        .post('/api/posts')
        .send({ title: 'Hello', content: 'World', visibility: 'invalid' });

      expect(resp.status).toBe(400);
      expect(resp.body).toEqual({ message: 'Chế độ hiển thị không hợp lệ!' });
      expect(createPostService).not.toHaveBeenCalled();
    });

    it('should return 400 if createPostService throws', async () => {
      createPostService.mockRejectedValue(new Error('Service error'));
      const resp = await request(app)
        .post('/api/posts')
        .send({ title: 'Hello', content: 'World', visibility: 'public' });

      expect(createPostService).toHaveBeenCalledWith('user123', 'Hello', 'World', null, 'public');
      expect(resp.status).toBe(400);
      expect(resp.body).toEqual({ message: 'Service error' });
    });

    it('should return 201 and new post when successful', async () => {
      const fakePost = { _id: 'p1', title: 'Hello', content: 'World' };
      createPostService.mockResolvedValue(fakePost);

      const resp = await request(app)
        .post('/api/posts')
        .send({ title: 'Hello', content: 'World', visibility: 'friends' });

      expect(createPostService).toHaveBeenCalledWith('user123', 'Hello', 'World', null, 'friends');
      expect(resp.status).toBe(201);
      expect(resp.body).toEqual({
        message: 'Bài đăng đã được tạo thành công!',
        post: fakePost,
      });
    });
  });

  // ---------------------------
  // 2. getOwnPosts
  // ---------------------------
  describe('GET /api/posts', () => {
    it('should return 200 and posts when service succeeds', async () => {
      const fakeArray = [{ _id: '1' }, { _id: '2' }];
      getOwnPostsService.mockResolvedValue(fakeArray);

      const resp = await request(app).get('/api/posts?page=2&limit=5');
      expect(getOwnPostsService).toHaveBeenCalledWith('user123', 2, 5);
      expect(resp.status).toBe(200);
      expect(resp.body).toEqual({
        message: 'Lấy danh sách bài đăng thành công!',
        posts: fakeArray,
      });
    });

    it('should return 400 if service throws', async () => {
      getOwnPostsService.mockRejectedValue(new Error('Get error'));
      const resp = await request(app).get('/api/posts');
      expect(resp.status).toBe(400);
      expect(resp.body).toEqual({ message: 'Get error' });
    });
  });

  // ---------------------------
  // 3. updatePost
  // ---------------------------
  describe('PUT /api/posts/:postId', () => {
    it('should return 200 and updated post when successful', async () => {
      const updated = { _id: 'p2', title: 'New Title' };
      updatePostService.mockResolvedValue(updated);

      const resp = await request(app)
        .put('/api/posts/p2')
        .send({ title: 'New Title', content: 'New content' });

      expect(updatePostService).toHaveBeenCalledWith('user123', 'p2', 'New Title', 'New content', null);
      expect(resp.status).toBe(200);
      expect(resp.body).toEqual({
        message: 'Bài đăng đã được cập nhật thành công!',
        post: updated,
      });
    });

    it('should return 400 if service throws', async () => {
      updatePostService.mockRejectedValue(new Error('Update error'));
      const resp = await request(app)
        .put('/api/posts/p2')
        .send({ title: 'X' });

      expect(resp.status).toBe(400);
      expect(resp.body).toEqual({ message: 'Update error' });
    });
  });

  // ---------------------------
  // 4. updateSharePost
  // ---------------------------
  describe('PUT /api/posts/share/:sharePostId', () => {
    it('should return 400 if caption is missing', async () => {
      const resp = await request(app).put('/api/posts/share/s1').send({});
      expect(resp.status).toBe(400);
      expect(resp.body).toEqual({ message: 'Vui lý nhập caption!' });
      expect(updateSharePostService).not.toHaveBeenCalled();
    });

    it('should return 200 and updated share when successful', async () => {
      const updatedShare = { _id: 's2', caption: 'New caption' };
      updateSharePostService.mockResolvedValue(updatedShare);

      const resp = await request(app)
        .put('/api/posts/share/s2')
        .send({ caption: 'New caption' });

      expect(updateSharePostService).toHaveBeenCalledWith('user123', 's2', 'New caption');
      expect(resp.status).toBe(200);
      expect(resp.body).toEqual({
        message: 'Bài đăng đã được cập nhật thành công!',
        post: updatedShare,
      });
    });

    it('should return 400 if service throws', async () => {
      updateSharePostService.mockRejectedValue(new Error('Share update error'));
      const resp = await request(app)
        .put('/api/posts/share/s3')
        .send({ caption: 'Hi' });

      expect(resp.status).toBe(400);
      expect(resp.body).toEqual({ message: 'Share update error' });
    });
  });

  // ---------------------------
  // 5. deletePost
  // ---------------------------
  describe('DELETE /api/posts/:postId', () => {
    it('should return 200 and result when successful', async () => {
      const result = { message: 'Deleted' };
      deletePostService.mockResolvedValue(result);

      const resp = await request(app).delete('/api/posts/p3');
      expect(deletePostService).toHaveBeenCalledWith('user123', 'p3');
      expect(resp.status).toBe(200);
      expect(resp.body).toEqual(result);
    });

    it('should return 400 if service throws', async () => {
      deletePostService.mockRejectedValue(new Error('Delete error'));
      const resp = await request(app).delete('/api/posts/p3');

      expect(resp.status).toBe(400);
      expect(resp.body).toEqual({ message: 'Delete error' });
    });
  });

  // ---------------------------
  // 6. sharePost
  // ---------------------------
  describe('POST /api/posts/:postId/share', () => {
    it('should return 201 and shared post when successful', async () => {
      const shared = { _id: 's4', originalPost: 'p4' };
      sharePostService.mockResolvedValue(shared);

      const resp = await request(app)
        .post('/api/posts/p4/share')
        .send({ caption: 'Nice', visibility: 'private' });

      expect(sharePostService).toHaveBeenCalledWith('user123', 'p4', 'Nice', 'private');
      expect(resp.status).toBe(201);
      expect(resp.body).toEqual({
        message: 'Bài viết đã được chia sẻ!',
        sharedPost: shared,
      });
    });

    it('should return 400 if service throws', async () => {
      sharePostService.mockRejectedValue(new Error('Share error'));
      const resp = await request(app)
        .post('/api/posts/p5/share')
        .send({ caption: 'Hello' });

      expect(resp.status).toBe(400);
      expect(resp.body).toEqual({ message: 'Share error' });
    });
  });

  // ---------------------------
  // 7. getAllPosts
  // ---------------------------
  describe('GET /api/posts/all', () => {
    it('should return 200 and posts array when successful', async () => {
      const all = [{ _id: 'a1' }, { _id: 'a2' }];
      getAllPostsService.mockResolvedValue(all);

      const resp = await request(app).get('/api/posts/all?page=3&limit=2');
      expect(getAllPostsService).toHaveBeenCalledWith('user123', 3, 2);
      expect(resp.status).toBe(200);
      expect(resp.body).toEqual(all);
    });

    it('should return 500 if service throws', async () => {
      getAllPostsService.mockRejectedValue(new Error('All error'));
      const resp = await request(app).get('/api/posts/all');

      expect(resp.status).toBe(500);
      expect(resp.body).toEqual({ message: 'All error' });
    });
  });

  // ---------------------------
  // 8. getPostsByUserId
  // ---------------------------
  describe('GET /api/posts/user/:userId', () => {
    it('should return 200 and posts array when successful', async () => {
      const userPosts = [{ _id: 'u1' }];
      getPostsByUserIdService.mockResolvedValue(userPosts);

      const resp = await request(app).get('/api/posts/user/u123?page=1&limit=5');
      expect(getPostsByUserIdService).toHaveBeenCalledWith('u123', 1, 5);
      expect(resp.status).toBe(200);
      expect(resp.body).toEqual(userPosts);
    });

    it('should return 500 if service throws', async () => {
      getPostsByUserIdService.mockRejectedValue(new Error('User posts error'));
      const resp = await request(app).get('/api/posts/user/u123');

      expect(resp.status).toBe(500);
      expect(resp.body).toEqual({ message: 'User posts error' });
    });
  });
});
