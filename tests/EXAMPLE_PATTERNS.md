# Test Patterns & Examples

Common patterns used throughout the test suite for reference and extending tests.

## Basic Test Structure

```javascript
describe('Feature Name', () => {
  let testVariable;

  beforeAll(async () => {
    // Setup that runs once before all tests in this suite
    // Connect to database, create fixtures
  });

  beforeEach(async () => {
    // Setup that runs before each individual test
    // Reset state, create fresh test data
  });

  afterEach(async () => {
    // Cleanup after each test
    // Delete test data created by this test
  });

  afterAll(async () => {
    // Final cleanup after all tests
    // Disconnect database
  });

  describe('Specific functionality', () => {
    it('should do something specific', async () => {
      // Arrange: Set up test data
      const testData = { ...fixture };

      // Act: Perform the action
      const result = await performAction(testData);

      // Assert: Verify the result
      expect(result).toBe(expectedValue);
    });
  });
});
```

## Authentication Patterns

### Creating Authenticated User

```javascript
// Register and get token
const registerRes = await request(app)
  .post('/api/auth/register')
  .send({
    name: 'Test User',
    email: 'test@example.com',
    password: 'Password@1234',
    role: 'viewer'
  })
  .expect(201);

const token = registerRes.body.token;
const userId = registerRes.body.user._id;
```

### Making Authenticated Requests

```javascript
// Use Bearer token in Authorization header
const res = await request(app)
  .get('/api/cameras')
  .set('Authorization', `Bearer ${token}`)
  .expect(200);

expect(res.body.success).toBe(true);
```

### Testing Token Validation

```javascript
it('should reject invalid token', async () => {
  const res = await request(app)
    .get('/api/cameras')
    .set('Authorization', 'Bearer invalid.token.here')
    .expect(401);

  expect(res.body.success).toBe(false);
  expect(res.body.error.message).toContain('Invalid token');
});

it('should reject expired token', async () => {
  const expiredToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '-1h' });

  const res = await request(app)
    .get('/api/cameras')
    .set('Authorization', `Bearer ${expiredToken}`)
    .expect(401);

  expect(res.body.success).toBe(false);
});
```

## CRUD Operation Patterns

### Create with Validation

```javascript
it('should create resource with valid data', async () => {
  const res = await request(app)
    .post('/api/cameras')
    .set('Authorization', `Bearer ${token}`)
    .send({
      name: 'Test Camera',
      location: 'Test Location',
      streamUrl: 'http://test.local/stream'
    })
    .expect(201);

  expect(res.body.success).toBe(true);
  expect(res.body.camera.name).toBe('Test Camera');
  expect(res.body.camera._id).toBeDefined();
});

it('should return 400 for missing required fields', async () => {
  const res = await request(app)
    .post('/api/cameras')
    .set('Authorization', `Bearer ${token}`)
    .send({
      location: 'Test Location'
      // Missing: name, streamUrl
    })
    .expect(400);

  expect(res.body.success).toBe(false);
  expect(res.body.error.message).toContain('required');
});
```

### Read with Filtering

```javascript
it('should filter results', async () => {
  // Create test data
  await Camera.create([
    { name: 'Camera 1', status: 'online', owner: userId },
    { name: 'Camera 2', status: 'offline', owner: userId }
  ]);

  // Query with filter
  const res = await request(app)
    .get('/api/cameras?status=online')
    .set('Authorization', `Bearer ${token}`)
    .expect(200);

  // Verify filtering
  expect(res.body.cameras.length).toBeGreaterThan(0);
  res.body.cameras.forEach(camera => {
    expect(camera.status).toBe('online');
  });
});
```

### Update with Verification

```javascript
it('should update only specified fields', async () => {
  const camera = await Camera.create({
    name: 'Original',
    location: 'Original Location',
    owner: userId
  });

  const res = await request(app)
    .put(`/api/cameras/${camera._id}`)
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'Updated' })
    .expect(200);

  expect(res.body.camera.name).toBe('Updated');
  expect(res.body.camera.location).toBe('Original Location'); // Unchanged
});
```

### Delete with Verification

```javascript
it('should delete and verify removal', async () => {
  const camera = await Camera.create({
    name: 'To Delete',
    owner: userId
  });

  const res = await request(app)
    .delete(`/api/cameras/${camera._id}`)
    .set('Authorization', `Bearer ${adminToken}`)
    .expect(200);

  expect(res.body.success).toBe(true);

  // Verify it's deleted
  const deleted = await Camera.findById(camera._id);
  expect(deleted).toBeNull();
});
```

## Authorization Patterns

### Testing Role-Based Access

```javascript
describe('Role-based access control', () => {
  it('should allow admin to perform action', async () => {
    const res = await request(app)
      .post('/api/cameras')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(cameraData)
      .expect(201);

    expect(res.body.success).toBe(true);
  });

  it('should allow operator to perform action', async () => {
    const res = await request(app)
      .post('/api/cameras')
      .set('Authorization', `Bearer ${operatorToken}`)
      .send(cameraData)
      .expect(201);

    expect(res.body.success).toBe(true);
  });

  it('should prevent viewer from performing action', async () => {
    const res = await request(app)
      .post('/api/cameras')
      .set('Authorization', `Bearer ${viewerToken}`)
      .send(cameraData)
      .expect(403);

    expect(res.body.success).toBe(false);
    expect(res.body.error.message).toContain('Unauthorized');
  });
});
```

## Pagination Patterns

### Testing Pagination

```javascript
it('should paginate results correctly', async () => {
  // Create 30 test records
  for (let i = 0; i < 30; i++) {
    await Camera.create({
      name: `Camera ${i}`,
      owner: userId
    });
  }

  // Get first page
  const page1 = await request(app)
    .get('/api/cameras?limit=10&skip=0')
    .set('Authorization', `Bearer ${token}`)
    .expect(200);

  expect(page1.body.cameras.length).toBe(10);
  expect(page1.body.pagination.total).toBe(30);
  expect(page1.body.pagination.limit).toBe(10);
  expect(page1.body.pagination.skip).toBe(0);

  // Get second page
  const page2 = await request(app)
    .get('/api/cameras?limit=10&skip=10')
    .set('Authorization', `Bearer ${token}`)
    .expect(200);

  expect(page2.body.cameras.length).toBe(10);
  expect(page2.body.pagination.skip).toBe(10);

  // Verify different data
  expect(page1.body.cameras[0]._id).not.toBe(page2.body.cameras[0]._id);
});
```

## Error Handling Patterns

### Testing Error Responses

```javascript
it('should return proper error response', async () => {
  const res = await request(app)
    .get('/api/cameras/invalid-id')
    .set('Authorization', `Bearer ${token}`)
    .expect(500); // or appropriate status

  expect(res.body.success).toBe(false);
  expect(res.body.error).toBeDefined();
  expect(res.body.error.message).toBeDefined();
  expect(res.body.error.statusCode).toBeDefined();

  // Verify sensitive data not exposed
  expect(res.body.error.message).not.toContain('stack');
  expect(res.body.error.message).not.toContain('mongodb');
});
```

### Testing 404 Errors

```javascript
it('should return 404 for non-existent resource', async () => {
  const fakeId = new mongoose.Types.ObjectId();

  const res = await request(app)
    .get(`/api/cameras/${fakeId}`)
    .set('Authorization', `Bearer ${token}`)
    .expect(404);

  expect(res.body.success).toBe(false);
  expect(res.body.error.message).toContain('not found');
});
```

## Data Validation Patterns

### Testing XSS Prevention

```javascript
it('should store XSS payloads safely', async () => {
  const xssPayload = '<img src=x onerror=alert("XSS")>';

  const res = await request(app)
    .post('/api/cameras')
    .set('Authorization', `Bearer ${token}`)
    .send({
      name: xssPayload,
      location: 'Location',
      streamUrl: 'http://test.local/stream'
    })
    .expect(201);

  // Should store safely (not execute)
  expect(res.body.camera.name).toBe(xssPayload);

  // Verify in database
  const camera = await Camera.findById(res.body.camera._id);
  expect(camera.name).toBe(xssPayload);
});
```

### Testing Injection Prevention

```javascript
it('should prevent NoSQL injection', async () => {
  const res = await request(app)
    .get('/api/cameras?name[$ne]=null')
    .set('Authorization', `Bearer ${token}`)
    .expect(200);

  // Should return safely, not inject into query
  expect(res.body.success).toBe(true);
});
```

## Concurrency Patterns

### Testing Concurrent Operations

```javascript
it('should handle concurrent requests', async () => {
  const promises = [];

  for (let i = 0; i < 5; i++) {
    promises.push(
      request(app)
        .get('/api/cameras')
        .set('Authorization', `Bearer ${token}`)
    );
  }

  const results = await Promise.all(promises);

  // Verify all succeeded
  const successCount = results.filter(r => r.status === 200).length;
  expect(successCount).toBe(5);
});
```

### Testing Race Conditions

```javascript
it('should handle concurrent registration correctly', async () => {
  const promises = [];
  const baseEmail = 'concurrent@test.com';

  for (let i = 0; i < 3; i++) {
    promises.push(
      request(app)
        .post('/api/auth/register')
        .send({
          name: `User ${i}`,
          email: baseEmail,
          password: 'Password@1234'
        })
    );
  }

  const results = await Promise.all(promises);

  // Only one should succeed (others fail with duplicate)
  const successCount = results.filter(r => r.status === 201).length;
  expect(successCount).toBeLessThanOrEqual(1);
});
```

## Data Relationship Patterns

### Testing Related Data

```javascript
it('should handle camera-recording relationship', async () => {
  // Create camera
  const camera = await Camera.create({
    name: 'Test Camera',
    owner: userId
  });

  // Create recording for camera
  const recording = await Recording.create({
    camera: camera._id,
    fileName: 'test.mp4',
    filePath: '/path/test.mp4'
  });

  // Verify relationship
  const retrieved = await Recording.findById(recording._id).populate('camera');
  expect(retrieved.camera._id.toString()).toBe(camera._id.toString());
});
```

## Timestamps and Dates

### Testing Timestamp Updates

```javascript
it('should update timestamps on modification', async () => {
  const camera = await Camera.create({
    name: 'Test',
    owner: userId
  });

  const originalUpdate = camera.updatedAt;

  // Wait a bit
  await new Promise(resolve => setTimeout(resolve, 100));

  // Update camera
  const res = await request(app)
    .put(`/api/cameras/${camera._id}`)
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'Updated' })
    .expect(200);

  expect(new Date(res.body.camera.updatedAt)).toBeGreater(originalUpdate);
});
```

### Testing Date Filtering

```javascript
it('should filter by date range', async () => {
  const startDate = new Date(Date.now() - 86400000); // 1 day ago
  const endDate = new Date();

  const res = await request(app)
    .get(`/api/recordings/camera/${cameraId}`)
    .query({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    })
    .set('Authorization', `Bearer ${token}`)
    .expect(200);

  // Verify date filtering
  res.body.recordings.forEach(recording => {
    const recordStart = new Date(recording.startTime);
    expect(recordStart.getTime()).toBeGreaterThanOrEqual(startDate.getTime());
  });
});
```

## Response Assertion Patterns

### Common Response Assertions

```javascript
// Success response
expect(res.body.success).toBe(true);
expect(res.body.message).toBeDefined();
expect(res.body.data || res.body.camera || res.body.user).toBeDefined();

// Error response
expect(res.body.success).toBe(false);
expect(res.body.error).toBeDefined();
expect(res.body.error.message).toBeDefined();
expect(res.body.error.statusCode).toBeDefined();

// Paginated response
expect(res.body.pagination).toBeDefined();
expect(res.body.pagination.total).toBeDefined();
expect(res.body.pagination.limit).toBeGreaterThan(0);
expect(res.body.pagination.skip).toBeGreaterThanOrEqual(0);

// Array response
expect(Array.isArray(res.body.cameras)).toBe(true);
expect(res.body.cameras.length).toBeGreaterThanOrEqual(0);

// Populated relationship
expect(res.body.camera.owner).toBeDefined();
expect(res.body.camera.owner.name).toBeDefined();
expect(res.body.camera.owner.email).toBeDefined();
```

## Using Fixtures

### Creating Tests with Fixtures

```javascript
import { fixtures, generateMockData } from '../fixtures.js';

it('should register user from fixture', async () => {
  const userData = fixtures.users.admin;

  const res = await request(app)
    .post('/api/auth/register')
    .send(userData)
    .expect(201);

  expect(res.body.user.role).toBe('admin');
});

it('should create camera from fixture', async () => {
  const cameraData = generateMockData.camera({
    name: 'Custom Camera'
  });

  const res = await request(app)
    .post('/api/cameras')
    .set('Authorization', `Bearer ${token}`)
    .send(cameraData)
    .expect(201);

  expect(res.body.camera.name).toBe('Custom Camera');
});
```

---

These patterns cover most common testing scenarios. Mix and combine them for your specific needs!
