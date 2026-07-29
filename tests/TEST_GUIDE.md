# CCTV Surveillance System - Test Suite Guide

## Overview

This comprehensive test suite provides production-quality testing for the CCTV Surveillance System. The suite includes unit tests, integration tests, load tests, and security tests.

## Test Structure

```
tests/
├── unit/
│   ├── auth.test.js           # Authentication endpoint tests
│   ├── cameras.test.js        # Camera management tests
│   └── recordings.test.js     # Recording management tests
├── integration/
│   └── api.integration.test.js # End-to-end API workflow tests
├── load.test.js               # Performance and load testing
├── security.test.js           # Security vulnerability testing
└── TEST_GUIDE.md             # This file
```

## Prerequisites

### Environment Setup

1. **MongoDB Test Database**
   - Ensure MongoDB is running locally or configure `MONGODB_TEST_URI` in `.env`
   - Default test database: `mongodb://localhost:27017/cctv-surveillance-test`

2. **Environment Variables**
   Create or update `.env` file with:
   ```env
   # Server
   PORT=5000
   NODE_ENV=test
   
   # JWT
   JWT_SECRET=your-secret-key-for-testing
   JWT_EXPIRY=7d
   
   # MongoDB
   MONGODB_URI=mongodb://localhost:27017/cctv-surveillance
   MONGODB_TEST_URI=mongodb://localhost:27017/cctv-surveillance-test
   
   # CORS
   CORS_ORIGIN=http://localhost:3000
   ```

3. **Dependencies Installation**
   ```bash
   npm install
   ```

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Specific Test Suite

#### Unit Tests
```bash
# All unit tests
npm test tests/unit/

# Individual test file
npm test tests/unit/auth.test.js
npm test tests/unit/cameras.test.js
npm test tests/unit/recordings.test.js
```

#### Integration Tests
```bash
npm test tests/integration/api.integration.test.js
```

#### Load Tests
```bash
npm test tests/load.test.js
```

#### Security Tests
```bash
npm test tests/security.test.js
```

### Run with Coverage
```bash
npm test -- --coverage
```

### Run Tests in Watch Mode
```bash
npm test -- --watch
```

### Run Specific Test Cases
```bash
# Run only authentication tests
npm test -- --testNamePattern="Authentication"

# Run only authorization tests
npm test -- --testNamePattern="Authorization"
```

## Test Descriptions

### 1. Unit Tests

#### `auth.test.js` - Authentication Tests
- **Registration (POST /api/auth/register)**
  - ✅ Successfully register a new user
  - ✅ Register with default viewer role
  - ✅ Validate required fields (name, email, password)
  - ✅ Prevent duplicate user registration
  - ✅ Hash passwords correctly
  - ✅ Generate valid JWT tokens

- **Login (POST /api/auth/login)**
  - ✅ Login with correct credentials
  - ✅ Validate required fields
  - ✅ Reject non-existent users
  - ✅ Reject incorrect passwords
  - ✅ Prevent login for inactive users
  - ✅ Update lastLogin timestamp
  - ✅ Return valid JWT token

- **Get Current User (GET /api/auth/me)**
  - ✅ Return current user with valid token
  - ✅ Reject requests without token
  - ✅ Reject invalid tokens
  - ✅ Reject expired tokens
  - ✅ Return 404 for non-existent user

#### `cameras.test.js` - Camera Management Tests
- **Create Camera (POST /api/cameras)**
  - ✅ Create camera as admin/operator
  - ✅ Reject creation by viewer (authorization)
  - ✅ Validate required fields
  - ✅ Set default values (status, frameRate)

- **List Cameras (GET /api/cameras)**
  - ✅ Get all cameras
  - ✅ Filter by status
  - ✅ Filter by location
  - ✅ Role-based access (viewers see only own cameras)
  - ✅ Populate owner information

- **Get Single Camera (GET /api/cameras/:id)**
  - ✅ Get camera by ID
  - ✅ Return 404 for non-existent camera

- **Update Camera (PUT /api/cameras/:id)**
  - ✅ Update camera as admin/operator
  - ✅ Reject updates by viewer
  - ✅ Update only provided fields
  - ✅ Update timestamps

- **Delete Camera (DELETE /api/cameras/:id)**
  - ✅ Delete camera as admin only
  - ✅ Reject deletion by non-admin
  - ✅ Remove from database

- **Update Status (PATCH /api/cameras/:id/status)**
  - ✅ Update status to online/offline/error
  - ✅ Allow authenticated users to update status

#### `recordings.test.js` - Recording Management Tests
- **Create Recording (POST /api/recordings)**
  - ✅ Create recording as admin/operator
  - ✅ Validate camera exists
  - ✅ Validate required fields
  - ✅ Set default recordingType to 'scheduled'

- **List Recordings (GET /api/recordings)**
  - ✅ Get all recordings with pagination
  - ✅ Return pagination metadata
  - ✅ Sort by startTime descending

- **Get Camera Recordings (GET /api/recordings/camera/:cameraId)**
  - ✅ Get recordings for specific camera
  - ✅ Filter by date range
  - ✅ Support pagination
  - ✅ Populate camera information

- **Archive Recording (PATCH /api/recordings/:id/archive)**
  - ✅ Archive recording as admin/operator
  - ✅ Reject archival by viewer
  - ✅ Set isArchived flag

- **Delete Recording (DELETE /api/recordings/:id)**
  - ✅ Delete recording as admin only
  - ✅ Remove from database

### 2. Integration Tests

`api.integration.test.js` - End-to-End Workflows

- **Complete User and Camera Workflow**
  - User registration → Get user profile → Create camera → Get camera → Update camera → List cameras

- **Complete Recording Management Workflow**
  - User registration → Create camera → Create recording → Get recordings → Archive recording → Delete recording

- **Multi-User Scenarios**
  - Role-based access control enforcement
  - All roles can view cameras
  - Only admin can delete cameras

- **Pagination and Filtering**
  - Camera pagination with limit/skip
  - Recording pagination with limit/skip
  - Date range filtering for recordings
  - Status and location filtering

- **Error Recovery**
  - Handle concurrent requests
  - Invalid object ID handling
  - Database connection recovery

### 3. Load Tests

`load.test.js` - Performance and Load Testing

- **Authentication Load**
  - Small load: 10 login requests
  - Medium load: 50 login requests
  - Measures response times and throughput

- **Camera Operations Load**
  - Concurrent camera list requests
  - Camera creation load
  - Camera update load

- **Recording Operations Load**
  - Concurrent recording list requests
  - Recording creation load
  - Recording archival load

- **Mixed Workload**
  - Combined operations under load
  - Sustained load for 5 seconds
  - Error rate monitoring

- **Database Performance**
  - Large query result handling
  - Pagination efficiency

**Performance Thresholds:**
- Average response time: < 2000ms
- Error rate: < 5%
- Throughput (sustained): > 10 req/s

### 4. Security Tests

`security.test.js` - Security Vulnerability Testing

- **Authentication Security**
  - Token validation
  - Expired token rejection
  - Tampered token detection
  - Invalid token signature detection

- **Authorization Security**
  - Role-based access control
  - Prevent unauthorized operations
  - Permission enforcement

- **Input Validation**
  - NoSQL injection prevention
  - XSS payload handling
  - Directory traversal prevention
  - Long input string handling

- **Password Security**
  - Password hashing verification
  - Password not exposed in responses
  - Password field excluded from output

- **Sensitive Data**
  - Error messages don't expose internals
  - Database connection strings not leaked
  - User IDs not exposed in errors

- **CORS & Headers**
  - Proper CORS handling
  - Cross-origin request handling

- **Brute Force & Rate Limiting**
  - Rapid login attempts handling
  - Concurrent registration handling

## Test Metrics and Reporting

### Coverage Report
After running tests with coverage:
```bash
npm test -- --coverage
```

Coverage files are generated in `coverage/` directory. Open `coverage/lcov-report/index.html` in a browser for visual report.

### Test Output
Tests provide detailed output including:
- Number of tests passed/failed
- Test execution time
- Coverage percentages
- Performance metrics (for load tests)

Example output:
```
PASS  tests/unit/auth.test.js
  Authentication Endpoints
    POST /api/auth/register
      ✓ should successfully register a new user (25ms)
      ✓ should hash passwords correctly (18ms)
      ...
    
PASS  tests/integration/api.integration.test.js
  API Integration Tests
    Complete User and Camera Workflow
      ✓ should complete full user registration and camera setup workflow (156ms)
```

## Common Issues and Solutions

### MongoDB Connection Errors
**Problem:** `MongoDB connection error: connect ECONNREFUSED`

**Solution:**
1. Ensure MongoDB is running: `mongod`
2. Or use MongoDB Atlas and set `MONGODB_TEST_URI` in `.env`
3. Check MongoDB is listening on default port 27017

### Token Expiration
**Problem:** Tests fail with "Invalid token" errors

**Solution:**
1. Check `JWT_SECRET` is set correctly in `.env`
2. Ensure `JWT_EXPIRY` is set to a reasonable value (e.g., '7d')
3. Verify system clock is synchronized

### Test Timeout
**Problem:** Tests hang or timeout

**Solution:**
1. Increase timeout in jest.config.js: `testTimeout: 60000`
2. Check database performance
3. Ensure no other services are blocking ports

### Port Already in Use
**Problem:** `Error: listen EADDRINUSE :::5000`

**Solution:**
1. Change PORT in `.env`
2. Kill process using port 5000: `lsof -ti:5000 | xargs kill -9`

## Best Practices

### Writing Tests
1. **Clear Descriptions**: Use descriptive test names
2. **Isolation**: Each test should be independent
3. **Setup/Teardown**: Use beforeEach/afterEach for cleanup
4. **Assertions**: Multiple specific assertions over vague ones
5. **Mock Data**: Use fixtures for consistent test data

### Running Tests
1. **Regular Execution**: Run tests after every code change
2. **Coverage Check**: Aim for >80% coverage
3. **Performance**: Monitor test execution time
4. **CI/CD**: Integrate tests into deployment pipeline

### Security Testing
1. **Update Payloads**: Regularly update with new attack vectors
2. **OWASP**: Follow OWASP Top 10 guidelines
3. **Penetration Testing**: Complement with manual penetration testing

## Continuous Integration

### GitHub Actions Example
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    services:
      mongodb:
        image: mongo:latest
        options: >-
          --health-cmd mongosh
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 27017:27017
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm test
```

## Troubleshooting Performance

### Slow Tests
1. Check database indexes are created
2. Profile slow queries with MongoDB
3. Increase server resources
4. Run tests in parallel: `jest --maxWorkers=4`

### High Memory Usage
1. Reduce concurrent test workers
2. Clear test data between runs
3. Monitor for memory leaks with `--detectOpenHandles`

## Contributing Tests

When adding new features:
1. Write tests first (TDD approach)
2. Ensure all tests pass
3. Maintain >80% coverage
4. Add security tests for sensitive features
5. Update this documentation

## References

- [Jest Documentation](https://jestjs.io/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [OWASP Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

## Support

For issues or questions about tests:
1. Check test output for specific error messages
2. Review this guide's troubleshooting section
3. Check MongoDB logs
4. Consult Jest documentation
5. Review test code comments
