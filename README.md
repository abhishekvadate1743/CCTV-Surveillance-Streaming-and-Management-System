# CCTV Surveillance Streaming and Management System

A comprehensive full-stack solution for managing, monitoring, and analyzing CCTV surveillance systems. This system provides real-time video streaming, recording management, motion detection, and analytics with role-based access control.

## Project Workflow & Status

### ✅ Completed (Backend - MVP)
- [x] Express server setup with Socket.IO
- [x] MongoDB database with 4 models (User, Camera, Recording, Analytics)
- [x] JWT authentication & authorization
- [x] User management (Admin, Operator, Viewer roles)
- [x] Camera CRUD operations
- [x] Recording management
- [x] Analytics/Event tracking
- [x] Error handling middleware
- [x] API documentation
- [x] Docker compose setup
- [x] Postman collection for testing

### 🔄 In Progress / Remaining

#### Phase 2: Frontend Development
- [ ] React dashboard (Main UI)
- [ ] Login/Auth pages
- [ ] Camera list & grid view
- [ ] Live streaming viewer
- [ ] Recording management UI
- [ ] Analytics dashboard
- [ ] User management panel
- [ ] Real-time notifications

#### Phase 3: Video Streaming Features
- [ ] RTSP to HLS conversion
- [ ] Live stream endpoint
- [ ] Video player integration
- [ ] Stream quality adaptation
- [ ] Recording from streams

#### Phase 4: Advanced Analytics
- [ ] Motion detection algorithm
- [ ] Person detection (AI/ML)
- [ ] Vehicle detection (AI/ML)
- [ ] Intrusion detection
- [ ] Event notifications (Email, SMS, Push)
- [ ] Alert acknowledgment system

#### Phase 5: DevOps & Deployment
- [ ] Docker containerization
- [ ] Docker Hub image
- [ ] Kubernetes deployment configs
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Production environment setup
- [ ] Monitoring & logging

#### Phase 6: Optimization & Polish
- [ ] Performance optimization
- [ ] Caching strategy (Redis)
- [ ] Database optimization
- [ ] Security hardening
- [ ] Rate limiting
- [ ] Comprehensive testing

### Architecture Diagram
```
┌─────────────────────────────────────────────────────────────┐
│                       Frontend (React)                        │
│  [Dashboard] [Live Streams] [Recordings] [Analytics] [Users]  │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP/WebSocket
┌──────────────────────────▼──────────────────────────────────┐
│                    Express.js API Server                     │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Routes: Auth | Cameras | Recordings | Users | Analytics │
│  └──────────────────┬────────────────────────────────┬──┘   │
│                     │ JWT Auth                       │      │
│  ┌──────────────────▼────────────────────────────────▼──┐   │
│  │         Middleware: Auth, Error Handler             │   │
│  └──────────────────┬────────────────────────────────┬──┘   │
└─────────────────────┼────────────────────────────────┼───────┘
                      │                                 │
        ┌─────────────▼─────────────┐    ┌─────────────▼─────────────┐
        │    MongoDB Database       │    │   Video Stream Server     │
        │ (User, Camera, Recording, │    │  (RTSP/HLS Conversion)    │
        │  Analytics Collections)   │    │  (Live Streaming)         │
        └──────────────────────────┘    └───────────────────────────┘
        
        ┌─────────────────────────────────────────────────────┐
        │  CCTV Cameras                                       │
        │  (IP Cameras, USB Cameras, Analog via Converter)    │
        └─────────────────────────────────────────────────────┘
```

## Features

### Core Features
- **Multi-Camera Management**: Add, configure, and manage multiple CCTV cameras
- **Live Streaming**: Real-time video streaming via RTSP/HTTP
- **Recording Management**: Automatic and manual recording with scheduling
- **Motion Detection**: AI-powered motion and object detection (person, vehicle)
- **Event Analytics**: Track and analyze surveillance events
- **Alert System**: Real-time alerts for detected events
- **User Management**: Role-based access control (Admin, Operator, Viewer)

### Advanced Features
- **WebSocket Real-time Updates**: Live camera status and event notifications
- **Recording Archive**: Automatic retention and archival policies
- **Dashboard**: Comprehensive analytics and monitoring dashboard
- **API-First Architecture**: RESTful API for all operations
- **Scalable Design**: Built for multiple camera deployments

## Tech Stack

### Backend
- **Runtime**: Node.js with ES Modules
- **Framework**: Express.js
- **Database**: MongoDB
- **Real-time**: Socket.IO
- **Authentication**: JWT
- **Password Hashing**: bcryptjs
- **Video Processing**: FFmpeg (for recording conversion)

### Models
- **User**: User management with role-based access
- **Camera**: Camera configuration and status tracking
- **Recording**: Video recording metadata and storage
- **Analytics**: Event detection and analysis logs

## Project Structure

```
├── server.js                 # Main application entry point
├── package.json              # Dependencies and scripts
├── .env.example              # Environment variables template
├── middleware/
│   ├── auth.js              # JWT verification and authorization
│   └── errorHandler.js      # Global error handling
├── models/
│   ├── User.js              # User schema and authentication
│   ├── Camera.js            # Camera configuration schema
│   ├── Recording.js         # Recording metadata schema
│   └── Analytics.js         # Event analytics schema
└── routes/
    ├── auth.js              # Authentication endpoints
    ├── cameras.js           # Camera management endpoints
    ├── recordings.js        # Recording management endpoints
    ├── users.js             # User management endpoints
    └── analytics.js         # Analytics endpoints
```

## Quick Start (5 Minutes)

### Prerequisites
- Node.js (v16+)
- npm or yarn

### Setup

1. **Install dependencies**
```bash
npm install
```

2. **Configure MongoDB** - Choose one option:

#### Option A: MongoDB Atlas (Recommended - Easiest)
- Go to https://www.mongodb.com/cloud/atlas
- Create FREE account
- Create free cluster (wait ~10 minutes)
- Click "Connect" → "Drivers" → Copy connection string
- Edit `.env` and update:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cctv-surveillance?retryWrites=true&w=majority
```

#### Option B: Local MongoDB (Windows)
- Download from https://www.mongodb.com/try/download/community
- Run installer, select "Install MongoDB as Service"
- MongoDB starts automatically
- `.env` already configured for local:
```
MONGODB_URI=mongodb://localhost:27017/cctv-surveillance
```

#### Option C: Docker
```bash
docker-compose up -d
npm run dev
```

3. **Start the server**
```bash
npm run dev
```

Server runs on: `http://localhost:5000`

### Verify Setup
```bash
# Test in browser or curl:
curl http://localhost:5000/api/health

# Should return:
# {"status":"Server is running","timestamp":"2024-01-XX..."}
```

### Environment Variables
Create `.env` file (or copy from `.env.example`):
```
MONGODB_URI=mongodb://localhost:27017/cctv-surveillance
JWT_SECRET=your_super_secret_key_change_this_in_production
JWT_EXPIRY=7d
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
MAX_FILE_SIZE=52428800
UPLOAD_DIR=./uploads
```

## API Documentation

### Authentication Endpoints

#### Register User
```
POST /api/auth/register
Body: { name, email, password, role? }
```

#### Login
```
POST /api/auth/login
Body: { email, password }
Response: { token, user }
```

#### Get Current User
```
GET /api/auth/me
Headers: Authorization: Bearer {token}
```

### Camera Management

#### Get All Cameras
```
GET /api/cameras
Query: ?status={status}&location={location}
```

#### Get Single Camera
```
GET /api/cameras/:id
```

#### Create Camera
```
POST /api/cameras
Body: { name, location, streamUrl, rtspUrl?, cameraType? }
```

#### Update Camera
```
PUT /api/cameras/:id
Body: { name?, location?, streamUrl?, ... }
```

#### Delete Camera
```
DELETE /api/cameras/:id
```

#### Update Camera Status
```
PATCH /api/cameras/:id/status
Body: { status: 'online'|'offline'|'error' }
```

### Recording Management

#### Get Recordings by Camera
```
GET /api/recordings/camera/:cameraId
Query: ?startDate={date}&endDate={date}&limit=50&skip=0
```

#### Get All Recordings
```
GET /api/recordings
Query: ?limit=50&skip=0
```

#### Create Recording
```
POST /api/recordings
Body: { camera, fileName, filePath, duration?, startTime, endTime }
```

#### Archive Recording
```
PATCH /api/recordings/:id/archive
```

#### Delete Recording
```
DELETE /api/recordings/:id
```

### User Management

#### Get All Users
```
GET /api/users
Headers: Authorization: Bearer {admin-token}
```

#### Get User by ID
```
GET /api/users/:id
```

#### Update User
```
PUT /api/users/:id
Body: { name?, phone?, department? }
```

#### Deactivate User
```
PATCH /api/users/:id/deactivate
```

#### Activate User
```
PATCH /api/users/:id/activate
```

#### Change User Role
```
PATCH /api/users/:id/role
Body: { role: 'admin'|'operator'|'viewer' }
```

### Analytics

#### Get Camera Analytics
```
GET /api/analytics/camera/:cameraId
Query: ?eventType={type}&startDate={date}&endDate={date}&limit=50
```

#### Get Unacknowledged Alerts
```
GET /api/analytics/alerts/unacknowledged
```

#### Create Analytics Event
```
POST /api/analytics
Body: { camera, eventType, confidence?, details?, snapshotPath? }
```

#### Acknowledge Alert
```
PATCH /api/analytics/:id/acknowledge
```

#### Get Dashboard Summary
```
GET /api/analytics/summary/dashboard
```

## Environment Variables

```
# Database
MONGODB_URI=mongodb://localhost:27017/cctv-surveillance

# JWT
JWT_SECRET=your_super_secret_key
JWT_EXPIRY=7d

# Server
PORT=5000
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:3000

# File Upload
MAX_FILE_SIZE=52428800
UPLOAD_DIR=./uploads
```

## User Roles

- **Admin**: Full system access, user management, system configuration
- **Operator**: Camera management, recording control, alert acknowledgment
- **Viewer**: View-only access to cameras and recordings

## First Time Setup - Create Admin User

Once server is running, register a user:

### Using cURL
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Admin User\",
    \"email\": \"admin@cctv.com\",
    \"password\": \"admin123\",
    \"role\": \"admin\"
  }"
```

### Using Postman
1. Import `postman-collection.json` into Postman
2. Go to Authentication → Register User
3. Send request
4. Copy token from response
5. Set token as Postman variable

Response includes JWT token - save for future API requests.

## WebSocket Events

### Client to Server
- `subscribe-camera`: Subscribe to camera stream updates
- `unsubscribe-camera`: Unsubscribe from camera updates

### Server to Client
- `camera-status`: Camera status changed
- `event-detected`: New event/alert detected
- `recording-started`: Recording started
- `recording-stopped`: Recording stopped

## Development

### Run Tests
```bash
npm test
```

### Linting
```bash
npm run lint
```

### Test API
```bash
npm run test-api
```

### Server Commands
```bash
npm run dev      # Development with auto-reload
npm start        # Production mode
npm test         # Run tests
npm run lint     # Run linter
```

### Troubleshooting

**Cannot connect to MongoDB:**
- Verify MongoDB is running
- Check MONGODB_URI in .env is correct
- If using Atlas, ensure IP whitelist includes your current IP (use 0.0.0.0/0 for testing)

**Port 5000 already in use:**
- Change PORT in .env to different number (e.g., 5001)
- Or kill process using port 5000

**Module not found errors:**
- Run: `npm install` again
- Delete node_modules: `rm -r node_modules` then `npm install`

**Invalid JWT token:**
- Ensure token from login/register response is used
- Token format: `Authorization: Bearer <token>`
- Tokens expire based on JWT_EXPIRY setting

**Server won't start:**
- Check Node.js version: `node --version` (should be v16+)
- Check dependencies installed: `npm list`
- Check for syntax errors: `npm run lint`

## Performance Considerations

- Pagination implemented for large datasets
- Database indexes on frequently queried fields
- Connection pooling via Mongoose
- Async/await for non-blocking operations

## Database Indexes

The system includes automatic TTL indexes for:
- Analytics: 90 days retention
- Recordings: 30 days retention (configurable per camera)

## Performance Considerations

- Pagination implemented for large datasets
- Database indexes on frequently queried fields
- Connection pooling via Mongoose
- Async/await for non-blocking operations

## Security

- JWT-based authentication
- Password hashing with bcryptjs
- Role-based access control
- Input validation with Joi/express-validator
- CORS configuration
- Environment-based configuration

## Development Roadmap

### Phase 1: Backend API ✅ COMPLETE
**Current Status**: MVP backend ready
- Express server with Socket.IO
- MongoDB integration
- User authentication & authorization
- Camera management API
- Recording management API
- Analytics/Events tracking
- Error handling

**How to use**:
1. Set up MongoDB (Atlas/Local/Docker)
2. Run `npm run dev`
3. Test endpoints with Postman collection
4. Create users and cameras via API

---

### Phase 2: React Frontend 🔄 NEXT PRIORITY
**What needs to be built**:
- React dashboard app
- Authentication pages (Login/Register)
- Camera management interface
- Live video viewer
- Recording browser
- Analytics dashboard
- User management panel
- Real-time notifications

**Estimated time**: 2-3 weeks

**Tech stack**: React, Redux, Material-UI, Axios, Socket.IO client

---

### Phase 3: Video Streaming 🔄 HIGH PRIORITY
**What needs to be built**:
- RTSP to HLS converter (FFmpeg)
- Live stream endpoint
- HLS video player
- Stream quality adaptation
- Recording from streams
- Video thumbnail generation

**Estimated time**: 1-2 weeks

---

### Phase 4: Analytics & AI 🔄 MEDIUM PRIORITY
**What needs to be built**:
- Motion detection service
- AI model integration (TensorFlow/OpenCV)
- Person detection
- Vehicle detection
- Intrusion detection
- Event notifications (Email/SMS)
- Alert management

**Estimated time**: 2-3 weeks

---

### Phase 5: DevOps & Deployment 🔄 MEDIUM PRIORITY
**What needs to be built**:
- Docker containers
- Docker Compose for full stack
- Kubernetes manifests
- CI/CD pipeline (GitHub Actions)
- Production environment setup
- SSL/TLS configuration

**Estimated time**: 1-2 weeks

---

### Phase 6: Testing & Optimization 🔄 LOW PRIORITY
**What needs to be built**:
- Unit tests
- Integration tests
- API tests
- Frontend tests
- Performance optimization
- Caching strategy (Redis)
- Security hardening

**Estimated time**: 2 weeks

---

## Quick Reference: API Endpoints Summary

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Cameras
- `GET /api/cameras` - List all cameras
- `POST /api/cameras` - Create camera
- `GET /api/cameras/:id` - Get camera details
- `PUT /api/cameras/:id` - Update camera
- `PATCH /api/cameras/:id/status` - Update status
- `DELETE /api/cameras/:id` - Delete camera

### Recordings
- `GET /api/recordings` - List recordings
- `GET /api/recordings/camera/:cameraId` - Camera recordings
- `POST /api/recordings` - Create recording
- `PATCH /api/recordings/:id/archive` - Archive recording
- `DELETE /api/recordings/:id` - Delete recording

### Users
- `GET /api/users` - List users (admin only)
- `GET /api/users/:id` - Get user
- `PUT /api/users/:id` - Update user
- `PATCH /api/users/:id/role` - Change role
- `PATCH /api/users/:id/activate` - Activate user
- `PATCH /api/users/:id/deactivate` - Deactivate user

### Analytics
- `GET /api/analytics/camera/:cameraId` - Camera events
- `GET /api/analytics/alerts/unacknowledged` - Pending alerts
- `POST /api/analytics` - Create event
- `PATCH /api/analytics/:id/acknowledge` - Acknowledge alert
- `GET /api/analytics/summary/dashboard` - Dashboard stats

## License

MIT
