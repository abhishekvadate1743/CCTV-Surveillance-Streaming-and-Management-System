# Phase 3: Video Streaming Setup Guide

This guide will help you set up and run the RTSP to HLS video streaming features.

## What's Implemented

- ✅ RTSP to HLS converter (FFmpeg-based Flask service)
- ✅ Live stream endpoints
- ✅ HLS video player with HLS.js
- ✅ Stream quality adaptation (bitrate/resolution)
- ✅ Recording from streams
- ✅ Stream statistics and monitoring
- ✅ Multi-bitrate adaptive streaming

## Prerequisites

1. **Node.js** (v16+) - Already installed if you set up the project
2. **Python 3.9+** - For streaming service
3. **FFmpeg** - For video encoding (automatic with pip packages)
4. **MongoDB** - For storing camera configs
5. **RTSP Camera** or **RTSP Test URL** - For testing

## Quick Start (5 Minutes)

### Step 1: Install Python Packages

If you haven't already set up the virtual environment:

```bash
# Windows CMD
setup-venv.bat

# Or manually
python -m venv venv
venv\Scripts\activate.bat
pip install -r requirements.txt
```

Install Phase 3 specific packages:
```bash
venv\Scripts\activate.bat
pip install av streamlink ffmpeg-python m3u8
```

### Step 2: Start the Backend (Express API)

```bash
npm run dev
```

Server runs on: `http://localhost:5000`

### Step 3: Start the Streaming Service

In a new terminal:
```bash
# Activate virtual environment
venv\Scripts\activate.bat

# Run streaming service
python services/stream_service.py
```

Service runs on: `http://localhost:5001`

### Step 4: Start the Frontend

In another terminal:
```bash
cd frontend
npm install  # if not done yet
npm run dev
```

Frontend runs on: `http://localhost:3000`

### Step 5: Test Streaming

#### Option A: Using Test Script
```bash
python test-streaming.py
```

#### Option B: Manual Testing
1. Open browser: `http://localhost:3000`
2. Login with your account
3. Go to Dashboard → Cameras
4. Click on a camera
5. Add RTSP URL if needed (edit camera)
6. Click "Start Live Stream"
7. Video player should load

#### Option C: Using cURL
```bash
# Health check
curl http://localhost:5001/health

# List active streams
curl http://localhost:5001/streams

# Quality recommendation
curl -X POST http://localhost:5001/quality/recommend \
  -H "Content-Type: application/json" \
  -d '{"client_id":"camera-1","bandwidth":2500}'
```

## Setting Up a Test Camera

### Using Public RTSP Stream

Add this RTSP URL to your camera for testing:
```
rtsp://demo.openvidu.org:1935/mediasoup
```

### Using Local Camera

If you have a USB or IP camera, use its RTSP URL (examples):
- **Hikvision**: `rtsp://192.168.1.100:554/h264/ch1/main/av_stream`
- **Dahua**: `rtsp://192.168.1.100:554/stream/ch00_0`
- **Generic IP Camera**: `rtsp://admin:password@192.168.1.100:554/stream0`

### To Update Camera RTSP URL

1. In Dashboard, click on camera
2. Click "Edit" button
3. Add RTSP URL in "RTSP URL (for Phase 3)" field
4. Click "Update"

## Streaming Service API Endpoints

### Health & Status
```
GET /health
Response: {
  "status": "healthy",
  "service": "CCTV Stream Service",
  "timestamp": "2024-01-XX...",
  "active_streams": 0
}
```

### Stream Management
```
# Start stream
POST /stream/<camera_id>/start
Body: { "rtsp_url": "rtsp://..." }

# Stop stream
POST /stream/<camera_id>/stop

# Get stream info
GET /stream/<camera_id>/info
Response: {
  "status": "running",
  "quality": "720p",
  "bitrate": "2000k",
  "started_at": "2024-01-XX..."
}

# List all streams
GET /streams
```

### HLS Streaming
```
# Get HLS playlist
GET /stream/<camera_id>/hls/playlist.m3u8

# Get segment
GET /stream/<camera_id>/hls/<segment_name>.ts
```

### Recording
```
# Start recording
POST /recording/<camera_id>/start
Body: { "rtsp_url": "rtsp://..." }

# Stop recording
POST /recording/<camera_id>/stop
Response: {
  "success": true,
  "file": "recordings/camera_20240120_153000.mp4",
  "duration": 120.5
}
```

### Quality Adaptation
```
# Get quality recommendation
POST /quality/recommend
Body: {
  "client_id": "client_123",
  "bandwidth": 2500  // in kbps
}

Response: {
  "recommended_quality": "720p",
  "encoding_params": {
    "bitrate": "2500k",
    "width": 1280,
    "height": 720
  }
}
```

## Video Player Controls

The VideoPlayer component provides:

- **Play/Pause** - Control playback
- **Volume Control** - Adjust audio level
- **Fullscreen** - Expand to full window
- **Quality Selector** - Choose bitrate (240p-1080p)
- **Auto Quality** - Automatic quality based on bandwidth
- **Recording** - Start/stop stream recording
- **Settings** - View stream statistics

## Quality Levels

The system supports 5 quality levels:

| Quality | Bitrate | Resolution | Use Case |
|---------|---------|------------|----------|
| 1080p   | 5000k   | 1920x1080  | Excellent bandwidth |
| 720p    | 2500k   | 1280x720   | Good bandwidth (default) |
| 480p    | 1000k   | 854x480    | Medium bandwidth |
| 360p    | 500k    | 640x360    | Low bandwidth |
| 240p    | 250k    | 426x240    | Very low bandwidth |

The system automatically adapts quality based on:
- Available bandwidth
- Network conditions
- Client capabilities
- User preference

## Troubleshooting

### Streaming Service Won't Start
```bash
# Check if port 5001 is in use
netstat -ano | findstr :5001

# If in use, change port in .env.python.example
FLASK_PORT=5002
```

### "Cannot connect to streaming service"
```bash
# Verify service is running
curl http://localhost:5001/health

# Check if FFmpeg is available
ffmpeg -version
```

### Video Player Shows Black Screen
1. Verify RTSP URL is valid
2. Check if stream is reachable from your machine
3. Verify firewall allows RTSP/HLS traffic
4. Check browser console for errors (F12)

### "HLS Error: network error"
1. Verify RTSP stream is accessible
2. Check firewall/proxy settings
3. Try with public RTSP stream first
4. Check video format (H.264 recommended)

### Recording Files Not Saving
1. Verify `recordings` folder exists
2. Check folder permissions
3. Ensure disk space available
4. Verify FFmpeg can write to folder

### Quality Adaptation Not Working
1. Ensure bandwidth measurement is running
2. Check network connectivity
3. Verify quality levels are available
4. Check logs for FFmpeg errors

## File Structure

```
├── services/
│   └── stream_service.py          # Flask streaming service
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── VideoPlayer.jsx    # HLS video player component
│   │   └── pages/
│   │       └── CameraDetail.jsx   # Camera detail with streaming
│   └── index.html                 # HLS.js CDN link
├── hls/                           # HLS segments (generated)
│   └── <camera_id>/
│       ├── playlist.m3u8
│       └── segment*.ts
├── recordings/                    # Recorded videos (generated)
│   └── camera_*.mp4
├── requirements.txt               # Python dependencies
├── .env.python.example            # Python config template
└── PHASE3_SETUP.md               # This file
```

## Configuration Files

### `.env.python.example`
```env
FLASK_PORT=5001
HLS_SEGMENT_DURATION=10
HLS_PLAYLIST_SIZE=5
VIDEO_BITRATE=2000k
FFMPEG_THREADS=4
```

### `requirements.txt`
Key Phase 3 packages:
- `flask==2.3.2` - Web framework
- `flask-cors==4.0.0` - CORS support
- `av==10.0.0` - Video/audio processing
- `ffmpeg-python==0.2.1` - FFmpeg wrapper
- `streamlink==5.4.0` - Stream handling
- `m3u8==3.5.0` - HLS playlist parsing

## Next Steps

### After Phase 3 is Working:

1. **Phase 4: Advanced Analytics**
   - Motion detection
   - Person/vehicle detection (AI/ML)
   - Event notifications
   - Alert system

2. **Production Deployment**
   - Add HTTPS/SSL
   - Docker containerization
   - Load balancing
   - Stream redundancy

3. **Performance Optimization**
   - Stream caching
   - Multi-bitrate encoding
   - Database optimization
   - API rate limiting

## Testing Checklist

- [ ] Backend server starts without errors
- [ ] Streaming service starts on port 5001
- [ ] Frontend loads on http://localhost:3000
- [ ] Can add camera with RTSP URL
- [ ] "Start Live Stream" button appears
- [ ] Stream starts and plays in video player
- [ ] Quality selector works
- [ ] Recording start/stop buttons work
- [ ] Stream statistics display correctly
- [ ] Auto quality adaptation works

## Support & Resources

- **FFmpeg Docs**: https://ffmpeg.org/documentation.html
- **HLS.js Docs**: https://github.com/video-dev/hls.js
- **Flask Docs**: https://flask.palletsprojects.com
- **RTSP Sources**: https://www.live555.com/liveMedia/public-demo-streams.html

## Performance Notes

- Each stream uses ~100-500MB of bandwidth (depending on quality)
- Recording uses ~10-50MB per minute (depending on codec)
- HLS segments are 10 seconds each by default
- Playlist contains 5 segments by default
- Stream latency: ~30-45 seconds typical

---

**Phase 3 Status**: ✅ READY FOR TESTING

For issues or questions, check the main README.md for troubleshooting.
