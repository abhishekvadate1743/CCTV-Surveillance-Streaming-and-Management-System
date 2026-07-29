# Testing Quick Start Card

## 30-Second Setup

```bash
# 1. Install dependencies
npm install

# 2. Ensure MongoDB is running
mongod

# 3. Create .env with JWT_SECRET
echo "JWT_SECRET=your-test-secret" >> .env

# 4. Run tests
npm test
```

## Common Commands

```bash
# Run ALL tests
npm test

# Run specific test file
npm test auth.test.js

# Run with coverage report
npm test -- --coverage

# Run in watch mode (re-run on file change)
npm test -- --watch

# Run only failing tests
npm test -- --onlyChanged

# Run tests matching pattern
npm test -- --testNamePattern="should.*create"

# Run tests with verbose output
npm test -- --verbose

# Run specific test group
npm test -- tests/unit/

# Run security tests only
npm test tests/security.test.js

# Run load tests only
npm test tests/load.test.js
```

## Test Files at a Glance

| File | Tests | What It Tests |
|------|-------|--------------|
| `tests/unit/auth.test.js` | 30+ | Login, register, JWT tokens |
| `tests/unit/cameras.test.js` | 40+ | Create, read, update, delete cameras |
| `tests/unit/recordings.test.js` | 35+ | Recording CRUD, archiving |
| `tests/integration/api.integration.test.js` | 20+ | Full workflows, multi-user |
| `tests/load.test.js` | 15+ | Performance, response times |
| `tests/security.test.js` | 40+ | Auth bypass, XSS, injection, etc. |

## What's Tested

### ✅ Authentication
- User registration with password hashing
- User login with JWT tokens
- Token validation and expiry
- Error handling

### ✅ Authorization
- Admin-only operations
- Operator permissions
- Viewer read-only access
- Role-based access control

### ✅ Cameras
- Create, read, update, delete
- Status updates
- Filtering and pagination
- Ownership validation

### ✅ Recordings
- Create with camera validation
- Retrieve with pagination
- Date range filtering
- Archival and deletion

### ✅ Security
- NoSQL injection prevention
- XSS payload handling
- Brute force protection
- Sensitive data exposure

### ✅ Performance
- Response times (target: < 2000ms)
- Throughput under load
- Concurrent request handling
- Database query efficiency

## Expected Output

```
PASS  tests/unit/auth.test.js (2.5s)
  Authentication Endpoints
    POST /api/auth/register
      ✓ should successfully register a new user (25ms)
      ✓ should hash passwords correctly (18ms)
      ...

PASS  tests/unit/cameras.test.js (3.2s)
  Camera Management Endpoints
    POST /api/cameras (Create)
      ✓ should create camera as admin (32ms)
      ✓ should create camera as operator (28ms)
      ...

Test Suites: 6 passed, 6 total
Tests:       150+ passed, 150+ total
Coverage:    85%+ across all metrics
```

## Before Committing Code

```bash
# 1. Run full test suite
npm test

# 2. Check coverage
npm test -- --coverage

# 3. Fix any failing tests
npm test -- --verbose

# 4. Commit only if all tests pass
git commit -m "your message"
```

## Debugging Failed Tests

```bash
# 1. Run failing test in isolation
npm test auth.test.js

# 2. Add console.log and run in verbose mode
npm test -- --verbose --testNamePattern="specific test"

# 3. Debug in Node Inspector
node --inspect-brk node_modules/.bin/jest --runInBand

# 4. Check MongoDB connection
mongosh  # Test database connection

# 5. View full error details
npm test -- --verbose 2>&1 | head -50
```

## Test Data

### User Roles
```javascript
{
  admin: { email: 'admin@test.com', role: 'admin' },
  operator: { email: 'operator@test.com', role: 'operator' },
  viewer: { email: 'viewer@test.com', role: 'viewer' }
}
```

### API Endpoints Tested

**Authentication**
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

**Cameras**
- `POST /api/cameras` - Create camera
- `GET /api/cameras` - List cameras
- `GET /api/cameras/:id` - Get camera
- `PUT /api/cameras/:id` - Update camera
- `DELETE /api/cameras/:id` - Delete camera
- `PATCH /api/cameras/:id/status` - Update status

**Recordings**
- `POST /api/recordings` - Create recording
- `GET /api/recordings` - List all recordings
- `GET /api/recordings/camera/:cameraId` - Get camera recordings
- `PATCH /api/recordings/:id/archive` - Archive recording
- `DELETE /api/recordings/:id` - Delete recording

**Health**
- `GET /api/health` - Server health check

## Performance Targets

| Metric | Target |
|--------|--------|
| Login Response | < 500ms |
| Camera Create | < 1000ms |
| Camera List | < 1500ms |
| Recording Create | < 1000ms |
| Recording List | < 2000ms |
| Concurrent Requests (5) | < 2000ms avg |
| Success Rate | > 95% |

## Coverage Report

```bash
# Generate coverage report
npm test -- --coverage

# View in browser
# Coverage report generates HTML at: coverage/lcov-report/index.html

# Key metrics to watch:
# - Statements: > 85%
# - Branches: > 80%
# - Functions: > 85%
# - Lines: > 85%
```

## Common Issues

| Issue | Solution |
|-------|----------|
| MongoDB connection fails | Run `mongod` or set `MONGODB_TEST_URI` in .env |
| Tests timeout | Increase `testTimeout` in jest.config.js |
| Port 5000 in use | Kill process: `lsof -ti:5000 \| xargs kill -9` |
| Token errors | Check `JWT_SECRET` is set in .env |
| Test hangs | Use `--forceExit` flag or check for open handles |

## Key Files

| File | Purpose |
|------|---------|
| `jest.config.js` | Jest configuration |
| `tests/setup.js` | Test environment setup |
| `tests/fixtures.js` | Mock data and utilities |
| `tests/TEST_GUIDE.md` | Comprehensive guide |
| `.env` | Environment configuration |

## Continuous Integration

Tests are ready for CI/CD:
- GitHub Actions ready
- Pre-commit hooks compatible
- Coverage reporting supported
- Parallel execution capable

## Tips for Success

✅ Run tests after every code change  
✅ Check coverage regularly  
✅ Write tests for new features  
✅ Fix failing tests immediately  
✅ Review test output carefully  
✅ Keep MongoDB running during tests  
✅ Use fixtures for consistent test data  
✅ Increase test timeout if needed  

## Documentation

- **Detailed Guide**: See `tests/TEST_GUIDE.md`
- **Test Overview**: See `tests/README.md`
- **Full Summary**: See `TESTING_SUMMARY.md`
- **This Card**: `TESTING_QUICK_START.md`

## Get Help

```bash
# View Jest help
npm test -- --help

# View specific test file
cat tests/unit/auth.test.js

# Run with more details
npm test -- --verbose --no-coverage

# List all available tests
npm test -- --listTests
```

---

**Remember**: Tests are your safety net. Run them often! 🚀
