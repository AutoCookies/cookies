import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app'; // import app
import User from '../models/User';

beforeAll(async () => {
  // Kết nối MongoDB test
  await mongoose.connect('mongodb://127.0.0.1:27017/test-auth', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  await mongoose.connection.db.dropDatabase(); // Xóa db test
  await mongoose.connection.close();
});

describe('Auth API', () => {
  const testUser = {
    username: 'testuser',
    fullName: 'Test User',
    email: 'test@example.com',
    password: '123456',
  };

  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/v1/auth/signup')
      .send(testUser);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('user');
  });

  it('should login the user and return token', async () => {
    const res = await request(app)
      .post('/api/v1/auth/signin')
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.email).toBe(testUser.email);
  });

  it('should fail with wrong password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/signin')
      .send({
        email: testUser.email,
        password: 'wrongpassword',
      });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message');
  });
});
