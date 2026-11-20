/**
 * Authorization tests for Google Search Console endpoints.
 * Verifies that project ownership is enforced on all GSC routes.
 */

import mongoose from 'mongoose';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../app';
import Project from '../models/Project';
import GSCConnection from '../models/GSCConnection';

const JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-for-testing-only';

function generateToken(email: string, role = 'admin'): string {
  return jwt.sign({ id: email, email, name: 'Test User', role }, JWT_SECRET, {
    expiresIn: '1h',
  });
}

describe('GSC Authorization', () => {
  const userAEmail = 'userA-gsc@example.com';
  const userBEmail = 'userB-gsc@example.com';

  let projectAId: string;
  let projectBId: string;
  let tokenA: string;
  let tokenB: string;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/test_db');
    }
  });

  afterAll(async () => {
    // Clean up test data
    await Project.deleteMany({ userId: { $in: [userAEmail, userBEmail] } });
    await GSCConnection.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clean up and re-seed
    await Project.deleteMany({ userId: { $in: [userAEmail, userBEmail] } });
    await GSCConnection.deleteMany({});

    // Create projects for both users
    const projectA = await Project.create({
      url: 'https://userA-site.com',
      name: 'User A Project',
      userId: userAEmail,
    });
    projectAId = projectA._id.toString();

    const projectB = await Project.create({
      url: 'https://userB-site.com',
      name: 'User B Project',
      userId: userBEmail,
    });
    projectBId = projectB._id.toString();

    // Create a fake GSC connection for User B's project
    await GSCConnection.create({
      projectId: new mongoose.Types.ObjectId(projectBId),
      accessToken: 'fake-access-token',
      refreshToken: 'fake-refresh-token',
      expiresAt: new Date(Date.now() + 3600000),
      siteUrl: 'https://userB-site.com',
      connectedAt: new Date(),
    });

    tokenA = generateToken(userAEmail);
    tokenB = generateToken(userBEmail);
  });

  describe('Cross-user access prevention', () => {
    it('should return 404 when User A tries to list properties for User B\'s project', async () => {
      const response = await request(app)
        .get(`/api/seo/gsc/properties/${projectBId}`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should return 404 when User A tries to disconnect User B\'s GSC connection', async () => {
      const response = await request(app)
        .delete(`/api/seo/gsc/disconnect/${projectBId}`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);

      // Verify the connection still exists
      const conn = await GSCConnection.findOne({ projectId: new mongoose.Types.ObjectId(projectBId) });
      expect(conn).not.toBeNull();
    });

    it('should return 404 when User A tries to submit sitemap to User B\'s property', async () => {
      const response = await request(app)
        .post(`/api/seo/gsc/sitemaps/${projectBId}`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ siteUrl: 'https://userB-site.com', feedpath: 'https://userB-site.com/sitemap.xml' });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should return 404 when User A tries to inspect URLs for User B\'s project', async () => {
      const response = await request(app)
        .post(`/api/seo/gsc/inspect/${projectBId}`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ url: 'https://userB-site.com/page' });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should return 404 when User A tries to list sitemaps with overridden siteUrl for User B\'s project', async () => {
      const response = await request(app)
        .get(`/api/seo/gsc/sitemaps/${projectBId}?siteUrl=https://evil-site.com`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should return 404 when User A tries to get GSC data for User B\'s project', async () => {
      const response = await request(app)
        .get(`/api/projects/${projectBId}/gsc/data`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should return 404 when User A tries to get GSC auth URL for User B\'s project', async () => {
      const response = await request(app)
        .get(`/api/projects/${projectBId}/gsc/auth-url`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should return 404 when User A tries to import GSC data for User B\'s project', async () => {
      const response = await request(app)
        .post(`/api/projects/${projectBId}/gsc/import`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ startDate: '2024-01-01', endDate: '2024-01-31' });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should return 404 when User A tries to get top queries for User B\'s project', async () => {
      const response = await request(app)
        .get(`/api/seo/gsc/top-queries/${projectBId}`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should return 404 when User A tries to get top pages for User B\'s project', async () => {
      const response = await request(app)
        .get(`/api/seo/gsc/top-pages/${projectBId}`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should return 404 when User A tries to get countries for User B\'s project', async () => {
      const response = await request(app)
        .get(`/api/seo/gsc/countries/${projectBId}`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should return 404 when User A tries to get devices for User B\'s project', async () => {
      const response = await request(app)
        .get(`/api/seo/gsc/devices/${projectBId}`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should return 404 when User A tries to get analytics by dimension for User B\'s project', async () => {
      const response = await request(app)
        .get(`/api/seo/gsc/analytics/${projectBId}?startDate=2024-01-01&endDate=2024-01-31&dimensions=query`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Invalid projectId handling', () => {
    it('should return 404 for an invalid ObjectId format', async () => {
      const response = await request(app)
        .get('/api/seo/gsc/properties/not-a-valid-id')
        .set('Authorization', `Bearer ${tokenA}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should return 404 for a valid but non-existent ObjectId', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const response = await request(app)
        .get(`/api/seo/gsc/properties/${fakeId}`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('OAuth callback ownership verification', () => {
    it('should reject code exchange for another user\'s project', async () => {
      // state contains User B's projectId but request is made by User A
      const response = await request(app)
        .get(`/api/gsc/callback?code=fake-code&state=${projectBId}`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should reject callback with invalid state parameter', async () => {
      const response = await request(app)
        .get('/api/gsc/callback?code=fake-code&state=invalid-id')
        .set('Authorization', `Bearer ${tokenA}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject callback without authentication', async () => {
      const response = await request(app)
        .get(`/api/gsc/callback?code=fake-code&state=${projectAId}`);

      expect(response.status).toBe(401);
    });
  });

  describe('Legitimate owner access', () => {
    it('should allow the project owner to access GSC config check', async () => {
      const response = await request(app)
        .get('/api/gsc/config')
        .set('Authorization', `Bearer ${tokenB}`);

      // Config endpoint doesn't require ownership — just auth
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should pass ownership check for the legitimate owner (may fail later due to no real GSC tokens)', async () => {
      // This verifies the middleware lets the owner through.
      // The actual GSC API call will fail because we use fake tokens,
      // but the authorization check should pass (status != 404).
      const response = await request(app)
        .get(`/api/seo/gsc/properties/${projectBId}`)
        .set('Authorization', `Bearer ${tokenB}`);

      // Should NOT be 404 (ownership denied). Will likely be 500 due to fake tokens.
      expect(response.status).not.toBe(404);
    });
  });

  describe('Unauthenticated access', () => {
    it('should return 401 without a token', async () => {
      const response = await request(app)
        .get(`/api/seo/gsc/properties/${projectBId}`);

      expect(response.status).toBe(401);
    });

    it('should return 401 with an invalid token', async () => {
      const response = await request(app)
        .get(`/api/seo/gsc/properties/${projectBId}`)
        .set('Authorization', 'Bearer invalid.token.here');

      expect(response.status).toBe(401);
    });
  });
});
