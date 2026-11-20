/**
 * Integration tests for authentication endpoints.
 */

import mongoose from 'mongoose';
import request from 'supertest';
import app from '../app';
import User from '../models/User';
import bcrypt from 'bcrypt';

describe('Auth API', () => {
  beforeAll(async () => {
    // Connect to test database if not already connected
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/test_db');
    }
  });

  afterAll(async () => {
    // Clean up test data
    await User.deleteMany({ email: /test.*@example\.com$/ });
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clean up before each test
    await User.deleteMany({ email: /test.*@example\.com$/ });
  });

  describe('POST /api/auth/login', () => {
    it('should return 400 when email is missing', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ password: 'password123' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 when password is missing', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 401 for non-existent user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should return 401 for invalid password', async () => {
      // Create a test user
      const hashedPassword = await bcrypt.hash('correctpassword', 10);
      await User.create({
        email: 'testlogin@example.com',
        password: hashedPassword,
        role: 'user',
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'testlogin@example.com',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should return token on successful login', async () => {
      // Create a test user
      const hashedPassword = await bcrypt.hash('correctpassword', 10);
      await User.create({
        email: 'testsuccess@example.com',
        password: hashedPassword,
        role: 'user',
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'testsuccess@example.com',
          password: 'correctpassword',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.token).toBeTruthy();
    });
  });
});
