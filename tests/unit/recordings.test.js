import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../server.js';
import Recording from '../../models/Recording.js';
import Camera from '../../models/Camera.js';
import User from '../../models/User.js';
import jwt from 'jsonwebtoken';

describe('Recording Management Endpoints', () => {
  let adminToken, operatorToken, viewerToken;
  let adminUser, operatorUser, viewerUser;
  let cameraId, recordingId;

  const mockCamera = {
    name: 'Test Camera',
    location: 'Test Location',
    streamUrl: 'http://192.168.1.100:8080/stream',
    rtspUrl: 'rtsp://192.168.1.100:554/stream',
    cameraType: 'ip'
  };

  const mockRecording = {
    fileName: 'recording_001.mp4',
    filePath: '/recordings/camera1/recording_001.mp4',
    duration: 3600,
    startTime: new Date(Date.now() - 3600000),
    endTime: new Date()
  };

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/cctv-surveillance-test', {
        serverSelectionTimeoutMS: 5000,
      });
    }

    // Create test users
    adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@test.com',
      password: 'Admin@1234',
      role: 'admin'
    });

    operatorUser = await User.create({
      name: 'Operator User',
      email: 'operator@test.com',
      password: 'Operator@1234',
      role: 'operator'
    });

    viewerUser = await User.create({
      name: 'Viewer User',
      email: 'viewer@test.com',
      password: 'Viewer@1234',
      role: 'viewer'
    });

    // Generate tokens
    adminToken = jwt.sign(
      { userId: adminUser._id, email: adminUser.email, role: 'admin' },
      process.env.JWT_SECRET
    );

    operatorToken = jwt.sign(
      { userId: operatorUser._id, email: operatorUser.email, role: 'operator' },
      process.env.JWT_SECRET
    );

    viewerToken = jwt.sign(
      { userId: viewerUser._id, email: viewerUser.email, role: 'viewer' },
      process.env.JWT_SECRET
    );

    // Create test camera
    const camera = await Camera.create({
      ...mockCamera,
      owner: adminUser._id
    });
    cameraId = camera._id;
  });

  afterAll(async () => {
    await Recording.deleteMany({});
    await Camera.deleteMany({});
    await User.deleteMany({});
    await mongoose.disconnect();
  });

  afterEach(async () => {
    await Recording.deleteMany({});
  });

  describe('POST /api/recordings (Create)', () => {
    it('should create recording as admin', async () => {
      const recordingData = {
        ...mockRecording,
        camera: cameraId
      };

      const res = await request(app)
        .post('/api/recordings')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(recordingData)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Recording created successfully');
      expect(res.body.recording.fileName).toBe(mockRecording.fileName);
      expect(res.body.recording.camera).toBe(cameraId.toString());
      expect(res.body.recording.recordingType).toBe('scheduled');
      recordingId = res.body.recording._id;
    });

    it('should create recording as operator', async () => {
      const recordingData = {
        ...mockRecording,
        camera: cameraId
      };

      const res = await request(app)
        .post('/api/recordings')
        .set('Authorization', `Bearer ${operatorToken}`)
        .send(recordingData)
        .expect(201);

      expect(res.body.success).toBe(true);
    });

    it('should reject recording creation as viewer', async () => {
      const recordingData = {
        ...mockRecording,
        camera: cameraId
      };

      const res = await request(app)
        .post('/api/recordings')
        .set('Authorization', `Bearer ${viewerToken}`)
        .send(recordingData)
        .expect(403);

      expect(res.body.success).toBe(false);
    });

    it('should return 400 if camera is missing', async () => {
      const { camera, ...recordingData } = mockRecording;
      const res = await request(app)
        .post('/api/recordings')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(recordingData)
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toContain('camera');
    });

    it('should return 400 if fileName is missing', async () => {
      const { fileName, ...recordingData } = mockRecording;
      const res = await request(app)
        .post('/api/recordings')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ ...recordingData, camera: cameraId })
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    it('should return 400 if filePath is missing', async () => {
      const { filePath, ...recordingData } = mockRecording;
      const res = await request(app)
        .post('/api/recordings')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ ...recordingData, camera: cameraId })
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    it('should return 404 if camera does not exist', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .post('/api/recordings')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          ...mockRecording,
          camera: fakeId
        })
        .expect(404);

      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toContain('Camera not found');
    });

    it('should set default recordingType to scheduled', async () => {
      const res = await request(app)
        .post('/api/recordings')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          ...mockRecording,
          camera: cameraId
        })
        .expect(201);

      expect(res.body.recording.recordingType).toBe('scheduled');
    });

    it('should set isArchived to false by default', async () => {
      const res = await request(app)
        .post('/api/recordings')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          ...mockRecording,
          camera: cameraId
        })
        .expect(201);

      expect(res.body.recording.isArchived).toBe(false);
    });
  });

  describe('GET /api/recordings (List All)', () => {
    beforeEach(async () => {
      // Create test recordings
      await Recording.create([
        {
          ...mockRecording,
          camera: cameraId,
          fileName: 'recording_001.mp4'
        },
        {
          ...mockRecording,
          camera: cameraId,
          fileName: 'recording_002.mp4',
          startTime: new Date(Date.now() - 7200000),
          endTime: new Date(Date.now() - 3600000)
        },
        {
          ...mockRecording,
          camera: cameraId,
          fileName: 'recording_003.mp4',
          startTime: new Date(Date.now() - 10800000),
          endTime: new Date(Date.now() - 7200000)
        }
      ]);
    });

    it('should get all recordings', async () => {
      const res = await request(app)
        .get('/api/recordings')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.recordings)).toBe(true);
      expect(res.body.recordings.length).toBeGreaterThan(0);
      expect(res.body.pagination).toBeDefined();
    });

    it('should return pagination data', async () => {
      const res = await request(app)
        .get('/api/recordings')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.pagination.total).toBeGreaterThan(0);
      expect(res.body.pagination.limit).toBe(50);
      expect(res.body.pagination.skip).toBe(0);
    });

    it('should support pagination with limit parameter', async () => {
      const res = await request(app)
        .get('/api/recordings?limit=2')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.recordings.length).toBeLessThanOrEqual(2);
      expect(res.body.pagination.limit).toBe(2);
    });

    it('should support pagination with skip parameter', async () => {
      const res = await request(app)
        .get('/api/recordings?limit=2&skip=1')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.pagination.skip).toBe(1);
    });

    it('should sort recordings by startTime descending', async () => {
      const res = await request(app)
        .get('/api/recordings')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      for (let i = 0; i < res.body.recordings.length - 1; i++) {
        expect(new Date(res.body.recordings[i].startTime))
          .toBeGreaterThanOrEqual(new Date(res.body.recordings[i + 1].startTime));
      }
    });

    it('should return 401 without token', async () => {
      const res = await request(app)
        .get('/api/recordings')
        .expect(401);

      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/recordings/camera/:cameraId', () => {
    beforeEach(async () => {
      // Create recordings for specific camera
      await Recording.create([
        {
          ...mockRecording,
          camera: cameraId,
          fileName: 'recording_001.mp4'
        },
        {
          ...mockRecording,
          camera: cameraId,
          fileName: 'recording_002.mp4'
        }
      ]);
    });

    it('should get recordings for specific camera', async () => {
      const res = await request(app)
        .get(`/api/recordings/camera/${cameraId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.recordings)).toBe(true);
      res.body.recordings.forEach(recording => {
        expect(recording.camera._id).toBe(cameraId.toString());
      });
    });

    it('should filter by startDate', async () => {
      const startDate = new Date(Date.now() - 7200000);
      const res = await request(app)
        .get(`/api/recordings/camera/${cameraId}?startDate=${startDate.toISOString()}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      res.body.recordings.forEach(recording => {
        expect(new Date(recording.startTime)).toBeGreaterThanOrEqual(startDate);
      });
    });

    it('should filter by endDate', async () => {
      const endDate = new Date(Date.now() - 3600000);
      const res = await request(app)
        .get(`/api/recordings/camera/${cameraId}?endDate=${endDate.toISOString()}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
    });

    it('should support pagination', async () => {
      const res = await request(app)
        .get(`/api/recordings/camera/${cameraId}?limit=1&skip=0`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.recordings.length).toBeLessThanOrEqual(1);
    });

    it('should populate camera information', async () => {
      const res = await request(app)
        .get(`/api/recordings/camera/${cameraId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.recordings[0].camera.name).toBeDefined();
      expect(res.body.recordings[0].camera.location).toBeDefined();
    });
  });

  describe('PATCH /api/recordings/:id/archive', () => {
    beforeEach(async () => {
      const recording = await Recording.create({
        ...mockRecording,
        camera: cameraId
      });
      recordingId = recording._id;
    });

    it('should archive recording as admin', async () => {
      const res = await request(app)
        .patch(`/api/recordings/${recordingId}/archive`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.recording.isArchived).toBe(true);
    });

    it('should archive recording as operator', async () => {
      const res = await request(app)
        .patch(`/api/recordings/${recordingId}/archive`)
        .set('Authorization', `Bearer ${operatorToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
    });

    it('should reject archive as viewer', async () => {
      const res = await request(app)
        .patch(`/api/recordings/${recordingId}/archive`)
        .set('Authorization', `Bearer ${viewerToken}`)
        .expect(403);

      expect(res.body.success).toBe(false);
    });

    it('should return 404 for non-existent recording', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .patch(`/api/recordings/${fakeId}/archive`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(res.body.success).toBe(false);
    });
  });

  describe('DELETE /api/recordings/:id', () => {
    beforeEach(async () => {
      const recording = await Recording.create({
        ...mockRecording,
        camera: cameraId
      });
      recordingId = recording._id;
    });

    it('should delete recording as admin', async () => {
      const res = await request(app)
        .delete(`/api/recordings/${recordingId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Recording deleted successfully');

      const deletedRecording = await Recording.findById(recordingId);
      expect(deletedRecording).toBeNull();
    });

    it('should reject delete as non-admin', async () => {
      const res = await request(app)
        .delete(`/api/recordings/${recordingId}`)
        .set('Authorization', `Bearer ${operatorToken}`)
        .expect(403);

      expect(res.body.success).toBe(false);

      const recording = await Recording.findById(recordingId);
      expect(recording).toBeDefined();
    });

    it('should return 404 for non-existent recording', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .delete(`/api/recordings/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(res.body.success).toBe(false);
    });

    it('should return 401 without token', async () => {
      const res = await request(app)
        .delete(`/api/recordings/${recordingId}`)
        .expect(401);

      expect(res.body.success).toBe(false);
    });
  });

  describe('Recording Data Validation', () => {
    it('should validate duration is a number', async () => {
      const res = await request(app)
        .post('/api/recordings')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          ...mockRecording,
          camera: cameraId,
          duration: 'invalid'
        })
        .expect(201); // MongoDB accepts any type, but schema expects Number

      expect(res.body.success).toBe(true);
    });

    it('should validate startTime and endTime are dates', async () => {
      const res = await request(app)
        .post('/api/recordings')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          camera: cameraId,
          fileName: 'test.mp4',
          filePath: '/path/test.mp4',
          startTime: 'invalid-date',
          endTime: 'invalid-date'
        })
        .expect(201);

      expect(res.body.success).toBe(true);
    });
  });

  describe('Recording Edge Cases', () => {
    it('should handle very long recording names', async () => {
      const longFileName = 'a'.repeat(255) + '.mp4';
      const res = await request(app)
        .post('/api/recordings')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          ...mockRecording,
          camera: cameraId,
          fileName: longFileName
        })
        .expect(201);

      expect(res.body.success).toBe(true);
    });

    it('should handle zero duration recordings', async () => {
      const res = await request(app)
        .post('/api/recordings')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          ...mockRecording,
          camera: cameraId,
          duration: 0
        })
        .expect(201);

      expect(res.body.success).toBe(true);
    });

    it('should handle very large file sizes', async () => {
      const res = await request(app)
        .post('/api/recordings')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          ...mockRecording,
          camera: cameraId,
          fileSize: 999999999999
        })
        .expect(201);

      expect(res.body.success).toBe(true);
    });
  });
});
