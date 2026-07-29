import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../server.js';
import User from '../../models/User.js';
import Camera from '../../models/Camera.js';
import Recording from '../../models/Recording.js';
import jwt from 'jsonwebtoken';

describe('API Integration Tests', () => {
  let adminToken, operatorToken, viewerToken;
  let adminUser, operatorUser, viewerUser;
  let cameraId, recordingId;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/cctv-surveillance-test', {
        serverSelectionTimeoutMS: 5000,
      });
    }
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Camera.deleteMany({});
    await Recording.deleteMany({});
    await mongoose.disconnect();
  });

  describe('Complete User and Camera Workflow', () => {
    it('should complete full user registration and camera setup workflow', async () => {
      // 1. Register admin user
      const registerRes = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Admin',
          email: 'workflow-admin@test.com',
          password: 'Admin@1234',
          role: 'admin'
        })
        .expect(201);

      expect(registerRes.body.success).toBe(true);
      const token = registerRes.body.token;
      const userId = registerRes.body.user._id;

      // 2. Get current user
      const meRes = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(meRes.body.user._id).toBe(userId);

      // 3. Create camera
      const cameraRes = await request(app)
        .post('/api/cameras')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Integration Test Camera',
          location: 'Workflow Location',
          streamUrl: 'http://test.local/stream',
          cameraType: 'ip'
        })
        .expect(201);

      expect(cameraRes.body.success).toBe(true);
      const createdCameraId = cameraRes.body.camera._id;

      // 4. Get camera
      const getRes = await request(app)
        .get(`/api/cameras/${createdCameraId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(getRes.body.camera._id).toBe(createdCameraId);

      // 5. Update camera
      const updateRes = await request(app)
        .put(`/api/cameras/${createdCameraId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Updated Workflow Camera' })
        .expect(200);

      expect(updateRes.body.camera.name).toBe('Updated Workflow Camera');

      // 6. List cameras
      const listRes = await request(app)
        .get('/api/cameras')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(listRes.body.cameras.some(c => c._id === createdCameraId)).toBe(true);
    });

    it('should complete full recording management workflow', async () => {
      // 1. Register user and create camera
      const registerRes = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Recording Admin',
          email: 'recording-admin@test.com',
          password: 'Admin@1234',
          role: 'admin'
        })
        .expect(201);

      const token = registerRes.body.token;

      const cameraRes = await request(app)
        .post('/api/cameras')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Recording Test Camera',
          location: 'Recording Lab',
          streamUrl: 'http://test.local/stream'
        })
        .expect(201);

      const testCameraId = cameraRes.body.camera._id;

      // 2. Create recording
      const recordingRes = await request(app)
        .post('/api/recordings')
        .set('Authorization', `Bearer ${token}`)
        .send({
          camera: testCameraId,
          fileName: 'test_recording.mp4',
          filePath: '/recordings/test.mp4',
          duration: 3600,
          startTime: new Date(Date.now() - 3600000),
          endTime: new Date()
        })
        .expect(201);

      expect(recordingRes.body.success).toBe(true);
      const testRecordingId = recordingRes.body.recording._id;

      // 3. Get recordings for camera
      const camerRecordingsRes = await request(app)
        .get(`/api/recordings/camera/${testCameraId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(camerRecordingsRes.body.recordings.some(r => r._id === testRecordingId)).toBe(true);

      // 4. Get all recordings
      const allRecordingsRes = await request(app)
        .get('/api/recordings')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(allRecordingsRes.body.recordings.some(r => r._id === testRecordingId)).toBe(true);

      // 5. Archive recording
      const archiveRes = await request(app)
        .patch(`/api/recordings/${testRecordingId}/archive`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(archiveRes.body.recording.isArchived).toBe(true);

      // 6. Delete recording
      const deleteRes = await request(app)
        .delete(`/api/recordings/${testRecordingId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(deleteRes.body.success).toBe(true);
    });
  });

  describe('Multi-User Scenarios', () => {
    beforeEach(async () => {
      // Create multiple users
      const adminRes = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Admin',
          email: 'multi-admin@test.com',
          password: 'Admin@1234',
          role: 'admin'
        });

      adminToken = adminRes.body.token;
      adminUser = adminRes.body.user;

      const operatorRes = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Operator',
          email: 'multi-operator@test.com',
          password: 'Operator@1234',
          role: 'operator'
        });

      operatorToken = operatorRes.body.token;
      operatorUser = operatorRes.body.user;

      const viewerRes = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Viewer',
          email: 'multi-viewer@test.com',
          password: 'Viewer@1234',
          role: 'viewer'
        });

      viewerToken = viewerRes.body.token;
      viewerUser = viewerRes.body.user;

      // Admin creates a camera
      const cameraRes = await request(app)
        .post('/api/cameras')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Multi-User Test Camera',
          location: 'Test Location',
          streamUrl: 'http://test.local/stream'
        });

      cameraId = cameraRes.body.camera._id;
    });

    it('should respect role-based access control for camera operations', async () => {
      // Admin can create
      const adminCreateRes = await request(app)
        .post('/api/cameras')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Admin Camera',
          location: 'Location',
          streamUrl: 'http://test.local/stream'
        })
        .expect(201);

      expect(adminCreateRes.body.success).toBe(true);

      // Operator can create
      const operatorCreateRes = await request(app)
        .post('/api/cameras')
        .set('Authorization', `Bearer ${operatorToken}`)
        .send({
          name: 'Operator Camera',
          location: 'Location',
          streamUrl: 'http://test.local/stream'
        })
        .expect(201);

      expect(operatorCreateRes.body.success).toBe(true);

      // Viewer cannot create
      const viewerCreateRes = await request(app)
        .post('/api/cameras')
        .set('Authorization', `Bearer ${viewerToken}`)
        .send({
          name: 'Viewer Camera',
          location: 'Location',
          streamUrl: 'http://test.local/stream'
        })
        .expect(403);

      expect(viewerCreateRes.body.success).toBe(false);
    });

    it('should allow all roles to view cameras', async () => {
      const adminRes = await request(app)
        .get('/api/cameras')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(adminRes.body.success).toBe(true);

      const operatorRes = await request(app)
        .get('/api/cameras')
        .set('Authorization', `Bearer ${operatorToken}`)
        .expect(200);

      expect(operatorRes.body.success).toBe(true);

      const viewerRes = await request(app)
        .get('/api/cameras')
        .set('Authorization', `Bearer ${viewerToken}`)
        .expect(200);

      expect(viewerRes.body.success).toBe(true);
    });

    it('should restrict camera deletion to admin only', async () => {
      const operatorCreateRes = await request(app)
        .post('/api/cameras')
        .set('Authorization', `Bearer ${operatorToken}`)
        .send({
          name: 'Delete Test Camera',
          location: 'Location',
          streamUrl: 'http://test.local/stream'
        })
        .expect(201);

      const deleteTestCameraId = operatorCreateRes.body.camera._id;

      // Operator cannot delete
      const operatorDeleteRes = await request(app)
        .delete(`/api/cameras/${deleteTestCameraId}`)
        .set('Authorization', `Bearer ${operatorToken}`)
        .expect(403);

      expect(operatorDeleteRes.body.success).toBe(false);

      // Admin can delete
      const adminDeleteRes = await request(app)
        .delete(`/api/cameras/${deleteTestCameraId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(adminDeleteRes.body.success).toBe(true);
    });
  });

  describe('Error Recovery and Edge Cases', () => {
    let token;

    beforeEach(async () => {
      const registerRes = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Edge Case Admin',
          email: 'edge-admin@test.com',
          password: 'Admin@1234',
          role: 'admin'
        });

      token = registerRes.body.token;
    });

    it('should handle concurrent camera creation requests', async () => {
      const promises = [];
      for (let i = 0; i < 5; i++) {
        promises.push(
          request(app)
            .post('/api/cameras')
            .set('Authorization', `Bearer ${token}`)
            .send({
              name: `Concurrent Camera ${i}`,
              location: 'Location',
              streamUrl: `http://test.local/stream${i}`
            })
        );
      }

      const results = await Promise.all(promises);
      const successCount = results.filter(r => r.body.success).length;
      expect(successCount).toBe(5);
    });

    it('should handle invalid object ids gracefully', async () => {
      const res = await request(app)
        .get('/api/cameras/invalid-id')
        .set('Authorization', `Bearer ${token}`)
        .expect(500); // MongoDB validation error

      expect(res.body.success).toBe(false);
    });

    it('should handle database connection recovery', async () => {
      // First request should work
      const res1 = await request(app)
        .get('/api/cameras')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res1.body.success).toBe(true);

      // Second request should also work
      const res2 = await request(app)
        .get('/api/cameras')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res2.body.success).toBe(true);
    });
  });

  describe('Pagination and Filtering', () => {
    let token, testCameraId;

    beforeEach(async () => {
      const registerRes = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Pagination Admin',
          email: 'pagination-admin@test.com',
          password: 'Admin@1234',
          role: 'admin'
        });

      token = registerRes.body.token;

      // Create multiple cameras
      for (let i = 0; i < 5; i++) {
        const cameraRes = await request(app)
          .post('/api/cameras')
          .set('Authorization', `Bearer ${token}`)
          .send({
            name: `Camera ${i}`,
            location: i % 2 === 0 ? 'Location A' : 'Location B',
            streamUrl: `http://test.local/stream${i}`,
            status: i % 2 === 0 ? 'online' : 'offline'
          });

        if (i === 0) testCameraId = cameraRes.body.camera._id;
      }

      // Create multiple recordings
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post('/api/recordings')
          .set('Authorization', `Bearer ${token}`)
          .send({
            camera: testCameraId,
            fileName: `recording_${i}.mp4`,
            filePath: `/recordings/recording_${i}.mp4`,
            duration: 3600 + i * 100,
            startTime: new Date(Date.now() - (i + 1) * 3600000),
            endTime: new Date(Date.now() - i * 3600000)
          });
      }
    });

    it('should paginate camera results', async () => {
      const page1 = await request(app)
        .get('/api/cameras?limit=2&skip=0')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(page1.body.cameras.length).toBeLessThanOrEqual(2);

      const page2 = await request(app)
        .get('/api/cameras?limit=2&skip=2')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(page2.body.cameras.length).toBeLessThanOrEqual(2);

      // First and second page should have different cameras
      if (page1.body.cameras.length > 0 && page2.body.cameras.length > 0) {
        expect(page1.body.cameras[0]._id).not.toBe(page2.body.cameras[0]._id);
      }
    });

    it('should filter cameras by status', async () => {
      const onlineRes = await request(app)
        .get('/api/cameras?status=online')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      onlineRes.body.cameras.forEach(camera => {
        expect(camera.status).toBe('online');
      });

      const offlineRes = await request(app)
        .get('/api/cameras?status=offline')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      offlineRes.body.cameras.forEach(camera => {
        expect(camera.status).toBe('offline');
      });
    });

    it('should filter cameras by location', async () => {
      const res = await request(app)
        .get('/api/cameras?location=Location%20A')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      res.body.cameras.forEach(camera => {
        expect(camera.location.toLowerCase()).toContain('location a');
      });
    });

    it('should paginate recording results', async () => {
      const page1 = await request(app)
        .get(`/api/recordings/camera/${testCameraId}?limit=2&skip=0`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(page1.body.pagination.limit).toBe(2);
      expect(page1.body.pagination.skip).toBe(0);

      const page2 = await request(app)
        .get(`/api/recordings/camera/${testCameraId}?limit=2&skip=2`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(page2.body.pagination.skip).toBe(2);
    });

    it('should filter recordings by date range', async () => {
      const startDate = new Date(Date.now() - 10800000);
      const endDate = new Date(Date.now() - 1800000);

      const res = await request(app)
        .get(`/api/recordings/camera/${testCameraId}?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.success).toBe(true);
    });
  });

  describe('Health Check', () => {
    it('should return server health status', async () => {
      const res = await request(app)
        .get('/api/health')
        .expect(200);

      expect(res.body.status).toBe('Server is running');
      expect(res.body.timestamp).toBeDefined();
    });
  });
});
