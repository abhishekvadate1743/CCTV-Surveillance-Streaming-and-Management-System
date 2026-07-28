# CCTV Surveillance Streaming and Management System

A comprehensive full-stack solution for managing, monitoring, and analyzing CCTV surveillance systems. This system provides real-time video streaming, recording management, motion detection, and analytics with role-based access control.

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

## Installation

### Prerequisites
- Node.js (v16+)
- MongoDB (local or Atlas)
- npm or yarn

### Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd CCTV-Surveillance-Streaming-and-Management-System
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Start the server**
```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

The server will run on `http://localhost:5000`

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

### Adding New Features

1. Create model if needed in `/models`
2. Create routes in `/routes`
3. Add middleware if authentication needed
4. Update documentation

## Future Enhancements

- [ ] Frontend React dashboard
- [ ] Mobile app (React Native)
- [ ] AI/ML-based video analytics
- [ ] Cloud storage integration
- [ ] Advanced search and filtering
- [ ] Multi-site support
- [ ] Email/SMS notifications
- [ ] Geographic mapping of cameras

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

## License

MIT
