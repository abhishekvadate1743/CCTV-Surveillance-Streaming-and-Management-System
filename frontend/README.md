# CCTV Surveillance System - Frontend

React-based dashboard for the CCTV Surveillance Streaming and Management System.

## Features

- **Authentication**: Secure login/register with JWT
- **Dashboard**: Real-time analytics and status overview
- **Camera Management**: Add, view, and manage cameras
- **Live Streaming**: View live camera feeds (integration ready)
- **Recording Management**: Browse and archive recordings
- **Analytics**: Track and acknowledge detection events
- **User Management**: Admin panel for user management
- **Real-time Updates**: WebSocket support for live notifications
- **Responsive Design**: Works on desktop, tablet, and mobile

## Tech Stack

- React 18
- Vite (build tool)
- Material-UI v5 (components)
- React Router v6 (routing)
- Axios (HTTP client)
- Socket.IO (real-time)
- Recharts (charts)
- Date-fns (date utilities)

## Installation

### Prerequisites
- Node.js v16+
- npm or yarn

### Setup

1. **Navigate to frontend directory**
```bash
cd frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development server**
```bash
npm run dev
```

Frontend will run on: `http://localhost:3000`

## Project Structure

```
frontend/
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable components
│   │   └── Layout.jsx   # Main layout with sidebar
│   ├── context/         # React context
│   │   └── AuthContext.jsx
│   ├── pages/           # Page components
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Cameras.jsx
│   │   ├── CameraDetail.jsx
│   │   ├── Recordings.jsx
│   │   ├── Analytics.jsx
│   │   └── Users.jsx
│   ├── services/        # API services
│   │   └── api.js
│   ├── App.jsx          # Main app component
│   ├── main.jsx         # Entry point
│   └── index.css        # Global styles
├── index.html           # HTML template
├── package.json         # Dependencies
└── vite.config.js       # Vite configuration
```

## Environment Setup

The frontend is configured to proxy API requests to `http://localhost:5000`

See `vite.config.js` for proxy configuration.

## Available Scripts

```bash
# Development server (with hot reload)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

## Pages Overview

### Login / Register
- User authentication with JWT tokens
- Role-based user creation

### Dashboard
- Overview of system statistics
- Camera status summary
- Recent events
- Real-time alerts

### Cameras
- List all cameras
- Add new cameras
- View camera details
- Live stream preview (integration ready)
- Update camera status

### Recordings
- View all recordings
- Filter by camera and date
- Archive old recordings
- Delete recordings

### Analytics
- View detection events (motion, person, vehicle, intrusion)
- Acknowledge alerts
- Filter by event type and camera
- Dashboard summary (last 24 hours)

### Users (Admin Only)
- View all users
- Change user roles (admin, operator, viewer)
- Activate/Deactivate users
- View user details and last login

## API Integration

All API calls are made through `src/services/api.js` using Axios.

Common patterns:
```javascript
// Get all cameras
cameraAPI.getAll()

// Create camera
cameraAPI.create({ name, location, streamUrl, ... })

// Get current user
authAPI.me()
```

See `src/services/api.js` for all available endpoints.

## Authentication Flow

1. User enters credentials on Login/Register page
2. API returns JWT token
3. Token stored in cookies
4. Subsequent requests include token in Authorization header
5. AuthContext maintains user state throughout app
6. Protected routes redirect to login if not authenticated

## Real-time Features (Coming Soon)

Socket.IO integration ready for:
- Live camera status updates
- Real-time event notifications
- Live recording status
- Multi-user notifications

## UI Components

Built with Material-UI, featuring:
- AppBar with navigation
- Responsive drawer sidebar
- Data tables with sorting
- Form dialogs
- Charts and graphs
- Status badges and chips
- Alert notifications

## State Management

- **AuthContext**: Manages user authentication state
- **Local State**: Component-level state with useState
- **API Calls**: Handled with Axios service layer

## Styling

- Material-UI theme with customization
- Global CSS in `index.css`
- Responsive grid system
- Mobile-first approach

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Development Tips

1. Use React DevTools browser extension for debugging
2. API proxy is configured in vite.config.js
3. Cookies are used for token storage (js-cookie)
4. Make API calls in useEffect or event handlers
5. Always handle errors with try-catch

## Troubleshooting

### "Cannot reach API"
- Ensure backend is running on localhost:5000
- Check vite.config.js proxy settings
- Verify API endpoints in services/api.js

### "Login not working"
- Ensure backend is running
- Check MongoDB connection
- Verify JWT_SECRET in backend .env

### "Components not displaying"
- Check Material-UI version in package.json
- Clear browser cache
- Run npm install again

### "CORS errors"
- Verify backend CORS_ORIGIN in .env (should include http://localhost:3000)
- Check proxy settings in vite.config.js

## Next Steps

- [ ] Implement live video streaming with HLS
- [ ] Add WebSocket real-time updates
- [ ] Integrate AI model for analytics
- [ ] Add email notifications
- [ ] Add multi-language support
- [ ] Add dark mode theme
- [ ] Mobile app (React Native)

## License

MIT
