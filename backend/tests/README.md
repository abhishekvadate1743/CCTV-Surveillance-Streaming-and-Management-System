# Test Suite Documentation

## Quick Start

### Prerequisites
```bash
# Install dependencies
npm install

# Create .env file with test configuration
cp .env.example .env
```

### Run Tests
```bash
# Run all tests
npm test

# Run with coverage report
npm test -- --coverage

# Run specific test file
npm test auth.test.js

# Run tests in watch mode
npm test -- --watch
```

## Test Suite Overview

### 1. Unit Tests (`unit/`)

#### `auth.test.js` - 30+ test cases
- User registration with validation
- User login with authentication
- JWT token generation and verification
- Password hashing and comparison
- Token expiry and invalidation
- Error handling for authentication failures

**Key metrics:**
- 8 test groups
- Covers happy paths and error scenarios
- Tests authentication middleware
- Validates all auth edge cases

#### `cameras.test.js` - 40+ test cases
- Camera CRUD operations
- Role-based access control (Admin, Operator, Viewer)
- Camera status updates
- Filtering and pagination
- Error handling and validation
- Populate owner information

**Key metrics:**
- 7 test groups
- Tests authorization enforcement
- Validates data consistency
- Covers all HTTP methods

#### `recordings.test.js` - 35+ test cases
- Recording creation with camera validation
- Recording retrieval with pagination
- Date range filtering
- Recording archival
- Recording deletion
- Archive status tracking

**Key metrics:**
- 6 test groups
- Tests cascading operations
- Validates data relationships
- Covers pagination extensively

### 2. Integration Tests (`integration/`)

#### `api.integration.test.js` - 20+ test cases
- Complete user registration and camera workflow
- Full recording lifecycle management
- Multi-user access scenarios
- Role-based permission enforcement
- Data consistency across operations
- Pagination and filtering in real workflows
- Error recovery and edge cases
- Health check endpoint

**Key metrics:**
- 5 test groups
- End-to-end workflow validation
- Multi-step transaction testing
- Permission integration testing

### 3. Load Tests (`load.test.js`) - 15+ test cases

Performance testing covering:
- **Authentication Load:**
  - 10 small load requests
  - 50 medium load requests
  - Response time analysis
  - Throughput measurement

- **Camera Operations:**
  - Concurrent list requests
  - Batch creation operations
  - Batch update operations
  - Status update performance

- **Recording Operations:**
  - Concurrent recording retrieval
  - Batch creation operations
  - Archive operations
  - Query performance

- **Mixed Workload:**
  - Combined operation testing
  - Sustained load for 5 seconds
  - Error rate monitoring

- **Database Performance:**
  - Large query result handling
  - Pagination efficiency
  - Index optimization verification

**Performance Targets:**
- Average response time: < 2000ms
- Success rate: > 95%
- Throughput: > 10 req/s (sustained)

### 4. Security Tests (`security.test.js`) - 40+ test cases

Comprehensive security testing:

- **Authentication Security (5 tests)**
  - Token validation
  - Expiry enforcement
  - Tampering detection
  - Signature verification

- **Authorization Security (6 tests)**
  - Role enforcement
  - Permission validation
  - Access control verification
  - RBAC compliance

- **Input Validation (7 tests)**
  - NoSQL injection prevention
  - XSS payload handling
  - URL validation
  - Long input handling
  - Special character handling

- **Password Security (3 tests)**
  - Password hashing verification
  - Password exposure prevention
  - Plaintext prevention

- **Sensitive Data (3 tests)**
  - Error message sanitization
  - Connection string protection
  - User ID concealment

- **HTTP Security (3 tests)**
  - CORS handling
  - Headers validation
  - Method abuse prevention

- **Brute Force Protection (2 tests)**
  - Rapid attempt handling
  - Concurrent request handling

- **Common Vulnerabilities (3 tests)**
  - Directory traversal
  - Null byte injection
  - Prototype pollution

## Test Execution Flow

```
Setup Phase
    ↓
┌─────────────────────────┐
│  Load Environment       │
│  Connect Database       │
│  Create Test Users      │
└──────────┬──────────────┘
           ↓
┌─────────────────────────────────────────────┐
│  Unit Tests                                 │
│  ├─ Authentication (auth.test.js)          │
│  ├─ Camera Management (cameras.test.js)    │
│  └─ Recording Management (recordings.test.js)
└──────────┬──────────────────────────────────┘
           ↓
┌─────────────────────────┐
│  Integration Tests      │
│  (api.integration.test.js)
└──────────┬──────────────┘
           ↓
┌─────────────────────────┐
│  Load Tests             │
│  (load.test.js)         │
└──────────┬──────────────┘
           ↓
┌─────────────────────────┐
│  Security Tests         │
│  (security.test.js)     │
└──────────┬──────────────┘
           ↓
Cleanup Phase
    ↓
┌──────────────────────────────────┐
│  Clean Test Data                 │
│  Disconnect Database             │
│  Generate Coverage Report        │
└──────────────────────────────────┘
    ↓
Report Results
```

## Test Data Management

### Database Cleanup
- Each test suite has `beforeAll` to setup test data
- Each test has `afterEach` to cleanup created records
- Full cleanup in `afterAll`

### Test Data Isolation
- Each test has unique email/name (using timestamp)
- Separate test database from production
- No shared state between tests

### Mock Data
See `fixtures.js` for:
- User templates
- Camera templates
- Recording templates
- Security payloads
- Test utilities

## Coverage Goals

| Category | Target |
|----------|--------|
| Statements | > 85% |
| Branches | > 80% |
| Functions | > 85% |
| Lines | > 85% |

Generate coverage report:
```bash
npm test -- --coverage
```

Open `coverage/lcov-report/index.html` for visual report.

## Common Test Patterns

### Authentication Testing
```javascript
// Generate valid token
const token = jwt.sign(payload, process.env.JWT_SECRET);

// Make authenticated request
await request(app)
  .get('/api/cameras')
  .set('Authorization', `Bearer ${token}`);
```

### Error Testing
```javascript
// Test error response
const res = await request(app)
  .post('/api/cameras')
  .send(invalidData)
  .expect(400);

expect(res.body.success).toBe(false);
expect(res.body.error.message).toContain('required');
```

### Pagination Testing
```javascript
// Test pagination
const res = await request(app)
  .get('/api/recordings?limit=10&skip=0')
  .set('Authorization', `Bearer ${token}`);

expect(res.body.pagination.total).toBeGreaterThan(0);
```

## Debugging Tests

### Run Single Test
```bash
npm test -- auth.test.js
```

### Run Single Test Case
```bash
npm test -- --testNamePattern="should successfully register"
```

### Debug Output
```bash
# Verbose output
npm test -- --verbose

# Show which tests ran
npm test -- --listTests
```

### Debug in Node
```bash
node --inspect-brk node_modules/.bin/jest --runInBand tests/unit/auth.test.js
```

## CI/CD Integration

### GitHub Actions Example
```yaml
- name: Run Tests
  run: npm test -- --coverage

- name: Upload Coverage
  uses: codecov/codecov-action@v2
  with:
    files: ./coverage/coverage-final.json
```

### Pre-commit Hook
```bash
npm test -- --bail --findRelatedTests
```

## Performance Profiling

### Identify Slow Tests
```bash
npm test -- --verbose --testTimeout=5000
```

### Test Execution Timeline
Check Jest output for test duration metrics.

### Database Query Profiling
```bash
# Enable MongoDB profiling in tests
db.setProfilingLevel(2);
```

## Troubleshooting

### MongoDB Connection Fails
```bash
# Check MongoDB is running
mongosh

# Or configure test database
export MONGODB_TEST_URI=mongodb://user:pass@host/dbname
```

### Tests Timeout
```javascript
// Increase timeout in jest.config.js
testTimeout: 60000 // 60 seconds
```

### Memory Leaks
```bash
npm test -- --detectOpenHandles --forceExit
```

### Port Already in Use
```bash
# Kill process using port
lsof -ti:5000 | xargs kill -9
```

## Best Practices

1. **Isolation**: Each test should be independent
2. **Clarity**: Use descriptive test names
3. **Speed**: Avoid unnecessary waits
4. **Coverage**: Aim for > 85% coverage
5. **DRY**: Use fixtures and helpers
6. **Safety**: Clean up after each test
7. **Assertions**: Use specific assertions

## Performance Benchmarks

Expected test execution times:
- Unit tests: 5-10 seconds
- Integration tests: 10-15 seconds
- Load tests: 30-60 seconds
- Security tests: 15-20 seconds
- **Total**: ~60-120 seconds

## Resources

- [Jest Documentation](https://jestjs.io/)
- [Supertest API](https://github.com/visionmedia/supertest)
- [Testing Best Practices](./TEST_GUIDE.md)
- [Test Fixtures](./fixtures.js)
- [OWASP Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)

## Contributing

When adding new tests:
1. Follow existing naming conventions
2. Use fixtures for test data
3. Ensure proper cleanup
4. Add documentation
5. Maintain > 85% coverage
6. Run full suite before submitting

See [TEST_GUIDE.md](./TEST_GUIDE.md) for detailed testing guidelines.
