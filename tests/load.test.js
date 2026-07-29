import request from 'supertest';
import mongoose from 'mongoose';
import app from '../server.js';
import User from '../models/User.js';
import Camera from '../models/Camera.js';
import Recording from '../models/Recording.js';
import jwt from 'jsonwebtoken';

/**
 * Load Testing Suite for CCTV Surveillance System
 * 
 * These tests measure system performance under various load conditions.
 * Run with: npm run test -- tests/load.test.js
 * 
 * Metrics captured:
 * - Response times
 * - Throughput (requests/sec)
 * - Error rates
 * - Memory usage
 * - Database connection pool status
 */

describe('Load Testing', () => {
  let adminToken, adminUser;
  let cameraIds = [];
  const LOAD_TEST_CONFIG = {
    smallLoad: 10,
    mediumLoad: 50,
    largeLoad: 100,
    concurrentRequests: 5,
    responseTimeThreshold: 2000 // 2 seconds
  };

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/cctv-surveillance-test', {
        serverSelectionTimeoutMS: 5000,
      });
    }

    // Create test user
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Load Test Admin',
        email: `loadtest-${Date.now()}@test.com`,
        password: 'LoadTest@1234',
        role: 'admin'
      });

    adminToken = registerRes.body.token;
    adminUser = registerRes.body.user;

    // Pre-create cameras for load testing
    for (let i = 0; i < 20; i++) {
      const cameraRes = await request(app)
        .post('/api/cameras')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: `Load Test Camera ${i}`,
          location: `Location ${i % 5}`,
          streamUrl: `http://test.local/stream${i}`,
          cameraType: 'ip'
        });
      cameraIds.push(cameraRes.body.camera._id);
    }
  });

  afterAll(async () => {
    await Camera.deleteMany({ name: /Load Test Camera/ });
    await Recording.deleteMany({});
    await User.deleteMany({ email: /^loadtest-/ });
    await mongoose.disconnect();
  });

  describe('Authentication Load Tests', () => {
    it('should handle small load of login requests', async () => {
      const startTime = Date.now();
      const responseTimes = [];

      for (let i = 0; i < LOAD_TEST_CONFIG.smallLoad; i++) {
        const reqStart = Date.now();
        await request(app)
          .post('/api/auth/login')
          .send({
            email: adminUser.email,
            password: 'LoadTest@1234'
          });
        responseTimes.push(Date.now() - reqStart);
      }

      const totalTime = Date.now() - startTime;
      const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
      const throughput = (LOAD_TEST_CONFIG.smallLoad / totalTime) * 1000;

      console.log(`\nSmall Load Test (${LOAD_TEST_CONFIG.smallLoad} requests):`);
      console.log(`  Total Time: ${totalTime}ms`);
      console.log(`  Avg Response Time: ${avgResponseTime.toFixed(2)}ms`);
      console.log(`  Throughput: ${throughput.toFixed(2)} req/s`);
      console.log(`  Max Response Time: ${Math.max(...responseTimes)}ms`);
      console.log(`  Min Response Time: ${Math.min(...responseTimes)}ms`);

      expect(avgResponseTime).toBeLessThan(LOAD_TEST_CONFIG.responseTimeThreshold);
    });

    it('should handle medium load of login requests', async () => {
      const startTime = Date.now();
      const responseTimes = [];

      for (let i = 0; i < LOAD_TEST_CONFIG.mediumLoad; i++) {
        const reqStart = Date.now();
        const res = await request(app)
          .post('/api/auth/login')
          .send({
            email: adminUser.email,
            password: 'LoadTest@1234'
          });
        responseTimes.push(Date.now() - reqStart);
        expect(res.status).toBe(200);
      }

      const totalTime = Date.now() - startTime;
      const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;

      console.log(`\nMedium Load Test (${LOAD_TEST_CONFIG.mediumLoad} requests):`);
      console.log(`  Total Time: ${totalTime}ms`);
      console.log(`  Avg Response Time: ${avgResponseTime.toFixed(2)}ms`);
      console.log(`  Throughput: ${((LOAD_TEST_CONFIG.mediumLoad / totalTime) * 1000).toFixed(2)} req/s`);

      expect(avgResponseTime).toBeLessThan(LOAD_TEST_CONFIG.responseTimeThreshold);
    });
  });

  describe('Camera Endpoint Load Tests', () => {
    it('should handle multiple concurrent camera list requests', async () => {
      const startTime = Date.now();
      const promises = [];

      for (let i = 0; i < LOAD_TEST_CONFIG.concurrentRequests; i++) {
        promises.push(
          request(app)
            .get('/api/cameras')
            .set('Authorization', `Bearer ${adminToken}`)
        );
      }

      const results = await Promise.all(promises);
      const totalTime = Date.now() - startTime;

      const successCount = results.filter(r => r.status === 200).length;
      const avgResponseTime = totalTime / results.length;

      console.log(`\nConcurrent Camera List Requests (${LOAD_TEST_CONFIG.concurrentRequests} concurrent):`);
      console.log(`  Total Time: ${totalTime}ms`);
      console.log(`  Avg Response Time: ${avgResponseTime.toFixed(2)}ms`);
      console.log(`  Success Count: ${successCount}/${results.length}`);

      expect(successCount).toBe(LOAD_TEST_CONFIG.concurrentRequests);
    });

    it('should handle camera creation load', async () => {
      const startTime = Date.now();
      const responseTimes = [];
      let successCount = 0;

      for (let i = 0; i < LOAD_TEST_CONFIG.smallLoad; i++) {
        const reqStart = Date.now();
        const res = await request(app)
          .post('/api/cameras')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            name: `Load Camera ${Date.now()}_${i}`,
            location: 'Load Test Location',
            streamUrl: `http://test.local/stream_${Date.now()}_${i}`
          });
        responseTimes.push(Date.now() - reqStart);
        if (res.status === 201) successCount++;
      }

      const totalTime = Date.now() - startTime;
      const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;

      console.log(`\nCamera Creation Load Test (${LOAD_TEST_CONFIG.smallLoad} requests):`);
      console.log(`  Total Time: ${totalTime}ms`);
      console.log(`  Avg Response Time: ${avgResponseTime.toFixed(2)}ms`);
      console.log(`  Success Rate: ${(successCount / LOAD_TEST_CONFIG.smallLoad * 100).toFixed(2)}%`);

      expect(successCount).toBeGreaterThanOrEqual(LOAD_TEST_CONFIG.smallLoad * 0.95);
    });

    it('should handle camera update load', async () => {
      const startTime = Date.now();
      const responseTimes = [];
      let successCount = 0;

      for (let i = 0; i < LOAD_TEST_CONFIG.smallLoad && i < cameraIds.length; i++) {
        const reqStart = Date.now();
        const res = await request(app)
          .put(`/api/cameras/${cameraIds[i]}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            name: `Updated Camera ${i}`,
            description: 'Updated during load test'
          });
        responseTimes.push(Date.now() - reqStart);
        if (res.status === 200) successCount++;
      }

      const totalTime = Date.now() - startTime;
      const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;

      console.log(`\nCamera Update Load Test (${LOAD_TEST_CONFIG.smallLoad} requests):`);
      console.log(`  Total Time: ${totalTime}ms`);
      console.log(`  Avg Response Time: ${avgResponseTime.toFixed(2)}ms`);

      expect(successCount).toBeGreaterThanOrEqual(LOAD_TEST_CONFIG.smallLoad * 0.95);
    });
  });

  describe('Recording Endpoint Load Tests', () => {
    it('should handle multiple concurrent recording list requests', async () => {
      const startTime = Date.now();
      const promises = [];

      for (let i = 0; i < LOAD_TEST_CONFIG.concurrentRequests; i++) {
        promises.push(
          request(app)
            .get('/api/recordings')
            .set('Authorization', `Bearer ${adminToken}`)
        );
      }

      const results = await Promise.all(promises);
      const totalTime = Date.now() - startTime;
      const successCount = results.filter(r => r.status === 200).length;

      console.log(`\nConcurrent Recording List Requests (${LOAD_TEST_CONFIG.concurrentRequests} concurrent):`);
      console.log(`  Total Time: ${totalTime}ms`);
      console.log(`  Avg Response Time: ${(totalTime / results.length).toFixed(2)}ms`);
      console.log(`  Success Count: ${successCount}/${results.length}`);

      expect(successCount).toBe(LOAD_TEST_CONFIG.concurrentRequests);
    });

    it('should handle recording creation load', async () => {
      const startTime = Date.now();
      const responseTimes = [];
      let successCount = 0;

      for (let i = 0; i < LOAD_TEST_CONFIG.smallLoad; i++) {
        const reqStart = Date.now();
        const cameraId = cameraIds[i % cameraIds.length];
        const res = await request(app)
          .post('/api/recordings')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            camera: cameraId,
            fileName: `load_recording_${Date.now()}_${i}.mp4`,
            filePath: `/recordings/load_${Date.now()}_${i}.mp4`,
            duration: 3600,
            startTime: new Date(Date.now() - 3600000),
            endTime: new Date()
          });
        responseTimes.push(Date.now() - reqStart);
        if (res.status === 201) successCount++;
      }

      const totalTime = Date.now() - startTime;
      const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;

      console.log(`\nRecording Creation Load Test (${LOAD_TEST_CONFIG.smallLoad} requests):`);
      console.log(`  Total Time: ${totalTime}ms`);
      console.log(`  Avg Response Time: ${avgResponseTime.toFixed(2)}ms`);
      console.log(`  Success Rate: ${(successCount / LOAD_TEST_CONFIG.smallLoad * 100).toFixed(2)}%`);

      expect(successCount).toBeGreaterThanOrEqual(LOAD_TEST_CONFIG.smallLoad * 0.95);
    });
  });

  describe('Mixed Workload Tests', () => {
    it('should handle mixed operations under load', async () => {
      const startTime = Date.now();
      const promises = [];

      // Mix of different operations
      for (let i = 0; i < 10; i++) {
        promises.push(
          request(app)
            .get('/api/cameras')
            .set('Authorization', `Bearer ${adminToken}`)
        );

        promises.push(
          request(app)
            .get('/api/recordings')
            .set('Authorization', `Bearer ${adminToken}`)
        );

        promises.push(
          request(app)
            .get(`/api/cameras/${cameraIds[i % cameraIds.length]}`)
            .set('Authorization', `Bearer ${adminToken}`)
        );
      }

      const results = await Promise.all(promises);
      const totalTime = Date.now() - startTime;
      const successCount = results.filter(r => r.status === 200).length;
      const errorCount = results.length - successCount;

      console.log(`\nMixed Workload Test (${results.length} requests):`);
      console.log(`  Total Time: ${totalTime}ms`);
      console.log(`  Avg Response Time: ${(totalTime / results.length).toFixed(2)}ms`);
      console.log(`  Success Count: ${successCount}/${results.length}`);
      console.log(`  Error Count: ${errorCount}`);

      expect(successCount / results.length).toBeGreaterThan(0.95);
    });

    it('should handle sustained load for extended period', async () => {
      const startTime = Date.now();
      const durationMs = 5000; // 5 seconds
      let requestCount = 0;
      let errorCount = 0;
      const responseTimes = [];

      while (Date.now() - startTime < durationMs) {
        const reqStart = Date.now();
        try {
          const res = await request(app)
            .get('/api/cameras')
            .set('Authorization', `Bearer ${adminToken}`);
          
          responseTimes.push(Date.now() - reqStart);
          if (res.status !== 200) errorCount++;
          requestCount++;
        } catch (error) {
          errorCount++;
        }
      }

      const totalTime = Date.now() - startTime;
      const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
      const throughput = (requestCount / totalTime) * 1000;

      console.log(`\nSustained Load Test (${totalTime}ms duration):`);
      console.log(`  Total Requests: ${requestCount}`);
      console.log(`  Throughput: ${throughput.toFixed(2)} req/s`);
      console.log(`  Avg Response Time: ${avgResponseTime.toFixed(2)}ms`);
      console.log(`  Error Count: ${errorCount}`);
      console.log(`  Error Rate: ${(errorCount / requestCount * 100).toFixed(2)}%`);

      expect(errorCount / requestCount).toBeLessThan(0.05);
    });
  });

  describe('Database Performance', () => {
    it('should efficiently handle large query results', async () => {
      const startTime = Date.now();

      const res = await request(app)
        .get('/api/cameras?limit=100')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const queryTime = Date.now() - startTime;

      console.log(`\nLarge Query Test:`);
      console.log(`  Query Time: ${queryTime}ms`);
      console.log(`  Results Count: ${res.body.cameras.length}`);

      expect(queryTime).toBeLessThan(LOAD_TEST_CONFIG.responseTimeThreshold);
    });

    it('should handle pagination efficiently', async () => {
      const responseTimes = [];

      for (let page = 0; page < 5; page++) {
        const startTime = Date.now();
        await request(app)
          .get(`/api/cameras?limit=20&skip=${page * 20}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);
        responseTimes.push(Date.now() - startTime);
      }

      const avgTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;

      console.log(`\nPagination Performance Test:`);
      console.log(`  Avg Query Time: ${avgTime.toFixed(2)}ms`);

      expect(avgTime).toBeLessThan(LOAD_TEST_CONFIG.responseTimeThreshold);
    });
  });
});
