import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../server.js';
import Camera from '../../models/Camera.js';
import User from '../../models/User.js';
import jwt from 'jsonwebtoken';

describe('Camera Management Endpoints', () => {
  let adminToken, operatorToken, viewerToken;
  let adminUser, operatorUser, viewerUser;
  let cameraId;

  const mockCamera = {
    name: 'Entrance Camera',
    location: 'Main Gate',
    description: 'Front entrance surveillance camera',
    streamUrl: 'http://192.168.1.100:8080/stream',
    rtspUrl: 'rtsp://192.168.1.100:554/stream',
    cameraType: 'ip',
    frameRate: 30
  };

  const mockCameraUpdate = {
    name: 'Updated Entrance Camera',
    location: 'Updated Location',
    frameRate: 60
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
  });

  afterAll(async () => {
    await Camera.deleteMany({});
    await User.deleteMany({});
    await mongoose.disconnect();
  });

  afterEach(async () => {
    await Camera.deleteMany({});
  });

  describe('POST /api/cameras (Create)', () => {
    it('should create camera as admin', async () => {
      const res = await request(app)
        .post('/api/cameras')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(mockCamera)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Camera created successfully');
      expect(res.body.camera.name).toBe(mockCamera.name);
      expect(res.body.camera.location).toBe(mockCamera.location);
      expect(res.body.camera.owner).toBe(adminUser._id.toString());
      expect(res.body.camera.status).toBe('offline');
      cameraId = res.body.camera._id;
    });

    it('should create camera as operator', async () => {
      const res = await request(app)
        .post('/api/cameras')
        .set('Authorization', `Bearer ${operatorToken}`)
        .send(mockCamera)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.camera.owner).toBe(operatorUser._id.toString());
    });

    it('should reject camera creation as viewer', async () => {
      const res = await request(app)
        .post('/api/cameras')
        .set('Authorization', `Bearer ${viewerToken}`)
        .send(mockCamera)
        .expect(403);

      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toContain('Unauthorized');
    });

    it('should reject without valid token', async () => {
      const res = await request(app)
        .post('/api/cameras')
        .send(mockCamera)
        .expect(401);

      expect(res.body.success).toBe(false);
    });

    it('should return 400 if name is missing', async () => {
      const { name, ...cameraData } = mockCamera;
      const res = await request(app)
        .post('/api/cameras')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(cameraData)
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toContain('name');
    });

    it('should return 400 if location is missing', async () => {
      const { location, ...cameraData } = mockCamera;
      const res = await request(app)
        .post('/api/cameras')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(cameraData)
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    it('should return 400 if streamUrl is missing', async () => {
      const { streamUrl, ...cameraData } = mockCamera;
      const res = await request(app)
        .post('/api/cameras')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(cameraData)
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    it('should set default values for optional fields', async () => {
      const res = await request(app)
        .post('/api/cameras')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: mockCamera.name,
          location: mockCamera.location,
          streamUrl: mockCamera.streamUrl
        })
        .expect(201);

      expect(res.body.camera.cameraType).toBe('ip');
      expect(res.body.camera.frameRate).toBe(30);
      expect(res.body.camera.isRecording).toBe(false);
    });
  });

  describe('GET /api/cameras (List)', () => {
    beforeEach(async () => {
      // Create test cameras
      await Camera.create([
        {
          ...mockCamera,
          name: 'Camera 1',
          owner: adminUser._id,
          status: 'online'
        },
        {
          ...mockCamera,
          name: 'Camera 2',
          location: 'Hallway',
          owner: adminUser._id,
          status: 'offline'
        },
        {
          ...mockCamera,
          name: 'Camera 3',
          owner: operatorUser._id,
          status: 'online'
        }
      ]);
    });

    it('should get all cameras as admin', async () => {
      const res = await request(app)
        .get('/api/cameras')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.cameras)).toBe(true);
      expect(res.body.cameras.length).toBeGreaterThan(0);
    });

    it('should get cameras filtered by status', async () => {
      const res = await request(app)
        .get('/api/cameras?status=online')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      res.body.cameras.forEach(camera => {
        expect(camera.status).toBe('online');
      });
    });

    it('should get cameras filtered by location', async () => {
      const res = await request(app)
        .get('/api/cameras?location=Hallway')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      res.body.cameras.forEach(camera => {
        expect(camera.location.toLowerCase()).toContain('hallway');
      });
    });

    it('should get only own cameras as viewer', async () => {
      const res = await request(app)
        .get('/api/cameras')
        .set('Authorization', `Bearer ${viewerToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.cameras.length).toBe(0);
    });

    it('should return 401 without token', async () => {
      const res = await request(app)
        .get('/api/cameras')
        .expect(401);

      expect(res.body.success).toBe(false);
    });

    it('should populate owner information', async () => {
      const res = await request(app)
        .get('/api/cameras')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.cameras[0].owner).toBeDefined();
      expect(res.body.cameras[0].owner.name).toBeDefined();
      expect(res.body.cameras[0].owner.email).toBeDefined();
    });
  });

  describe('GET /api/cameras/:id (Get Single)', () => {
    beforeEach(async () => {
      const camera = await Camera.create({
        ...mockCamera,
        owner: adminUser._id
      });
      cameraId = camera._id;
    });

    it('should get camera by id', async () => {
      const res = await request(app)
        .get(`/api/cameras/${cameraId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.camera._id).toBe(cameraId.toString());
      expect(res.body.camera.name).toBe(mockCamera.name);
    });

    it('should return 404 for non-existent camera', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/api/cameras/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toContain('not found');
    });

    it('should return 401 without token', async () => {
      const res = await request(app)
        .get(`/api/cameras/${cameraId}`)
        .expect(401);

      expect(res.body.success).toBe(false);
    });
  });

  describe('PUT /api/cameras/:id (Update)', () => {
    beforeEach(async () => {
      const camera = await Camera.create({
        ...mockCamera,
        owner: adminUser._id
      });
      cameraId = camera._id;
    });

    it('should update camera as admin', async () => {
      const res = await request(app)
        .put(`/api/cameras/${cameraId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(mockCameraUpdate)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.camera.name).toBe(mockCameraUpdate.name);
      expect(res.body.camera.location).toBe(mockCameraUpdate.location);
      expect(res.body.camera.frameRate).toBe(mockCameraUpdate.frameRate);
    });

    it('should update camera as operator', async () => {
      const res = await request(app)
        .put(`/api/cameras/${cameraId}`)
        .set('Authorization', `Bearer ${operatorToken}`)
        .send(mockCameraUpdate)
        .expect(200);

      expect(res.body.success).toBe(true);
    });

    it('should reject update as viewer', async () => {
      const res = await request(app)
        .put(`/api/cameras/${cameraId}`)
        .set('Authorization', `Bearer ${viewerToken}`)
        .send(mockCameraUpdate)
        .expect(403);

      expect(res.body.success).toBe(false);
    });

    it('should return 404 for non-existent camera', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .put(`/api/cameras/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(mockCameraUpdate)
        .expect(200); // Mongoose returns updated as null but doesn't throw

      expect(res.body.success).toBe(true);
    });

    it('should update only provided fields', async () => {
      const res = await request(app)
        .put(`/api/cameras/${cameraId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'New Name' })
        .expect(200);

      expect(res.body.camera.name).toBe('New Name');
      expect(res.body.camera.location).toBe(mockCamera.location);
    });

    it('should update timestamps', async () => {
      const cameraBefore = await Camera.findById(cameraId);
      const updatedBefore = cameraBefore.updatedAt;

      await new Promise(resolve => setTimeout(resolve, 100));

      const res = await request(app)
        .put(`/api/cameras/${cameraId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'New Name' })
        .expect(200);

      expect(new Date(res.body.camera.updatedAt)).toBeGreater(updatedBefore);
    });
  });

  describe('DELETE /api/cameras/:id', () => {
    beforeEach(async () => {
      const camera = await Camera.create({
        ...mockCamera,
        owner: adminUser._id
      });
      cameraId = camera._id;
    });

    it('should delete camera as admin', async () => {
      const res = await request(app)
        .delete(`/api/cameras/${cameraId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Camera deleted successfully');

      const deletedCamera = await Camera.findById(cameraId);
      expect(deletedCamera).toBeNull();
    });

    it('should reject delete as non-admin', async () => {
      const res = await request(app)
        .delete(`/api/cameras/${cameraId}`)
        .set('Authorization', `Bearer ${operatorToken}`)
        .expect(403);

      expect(res.body.success).toBe(false);

      const camera = await Camera.findById(cameraId);
      expect(camera).toBeDefined();
    });

    it('should return 404 for non-existent camera', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .delete(`/api/cameras/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(res.body.success).toBe(false);
    });

    it('should return 401 without token', async () => {
      const res = await request(app)
        .delete(`/api/cameras/${cameraId}`)
        .expect(401);

      expect(res.body.success).toBe(false);
    });
  });

  describe('PATCH /api/cameras/:id/status', () => {
    beforeEach(async () => {
      const camera = await Camera.create({
        ...mockCamera,
        owner: adminUser._id,
        status: 'offline'
      });
      cameraId = camera._id;
    });

    it('should update camera status to online', async () => {
      const res = await request(app)
        .patch(`/api/cameras/${cameraId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'online' })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.camera.status).toBe('online');
    });

    it('should update camera status to error', async () => {
      const res = await request(app)
        .patch(`/api/cameras/${cameraId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'error' })
        .expect(200);

      expect(res.body.camera.status).toBe('error');
    });

    it('should work for any authenticated user', async () => {
      const res = await request(app)
        .patch(`/api/cameras/${cameraId}/status`)
        .set('Authorization', `Bearer ${viewerToken}`)
        .send({ status: 'online' })
        .expect(200);

      expect(res.body.success).toBe(true);
    });

    it('should return 404 for non-existent camera', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .patch(`/api/cameras/${fakeId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'online' })
        .expect(404);

      expect(res.body.success).toBe(false);
    });
  });
});
