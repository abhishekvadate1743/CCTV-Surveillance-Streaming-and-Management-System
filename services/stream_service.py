"""
CCTV Stream Service - Python Flask Service for Video Streaming and Processing
This service handles:
- RTSP to HLS streaming conversion
- Video recording
- Motion detection
- Object detection (Person, Vehicle)
- Real-time processing
"""

from flask import Flask, render_template, Response, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit, join_room, leave_room
import cv2
import os
from dotenv import load_dotenv
import logging
from datetime import datetime
import subprocess
import threading
from pathlib import Path

# Load environment variables
load_dotenv('../.env.python.example')

# Initialize Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key'
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create logs directory
Path('logs').mkdir(exist_ok=True)

class StreamManager:
    """Manages video streams and processing"""
    
    def __init__(self):
        self.streams = {}
        self.processing = {}
    
    def start_stream(self, camera_id, rtsp_url):
        """Start streaming from RTSP source"""
        try:
            logger.info(f"Starting stream for camera {camera_id}: {rtsp_url}")
            # Stream processing logic here
            self.streams[camera_id] = {
                'url': rtsp_url,
                'status': 'streaming',
                'started_at': datetime.now()
            }
            return {'success': True, 'message': f'Stream started for {camera_id}'}
        except Exception as e:
            logger.error(f"Error starting stream: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def stop_stream(self, camera_id):
        """Stop streaming"""
        try:
            if camera_id in self.streams:
                del self.streams[camera_id]
            return {'success': True, 'message': f'Stream stopped for {camera_id}'}
        except Exception as e:
            logger.error(f"Error stopping stream: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def get_stream_status(self, camera_id):
        """Get stream status"""
        if camera_id in self.streams:
            return self.streams[camera_id]
        return {'status': 'offline'}

# Initialize stream manager
stream_manager = StreamManager()

# Routes

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'CCTV Stream Service',
        'timestamp': datetime.now().isoformat()
    })

@app.route('/streams', methods=['GET'])
def list_streams():
    """List all active streams"""
    return jsonify({
        'streams': stream_manager.streams,
        'total': len(stream_manager.streams)
    })

@app.route('/stream/<camera_id>/start', methods=['POST'])
def start_stream(camera_id):
    """Start streaming for a camera"""
    data = request.json
    rtsp_url = data.get('rtsp_url')
    
    if not rtsp_url:
        return jsonify({'error': 'RTSP URL required'}), 400
    
    result = stream_manager.start_stream(camera_id, rtsp_url)
    return jsonify(result), 200 if result['success'] else 400

@app.route('/stream/<camera_id>/stop', methods=['POST'])
def stop_stream(camera_id):
    """Stop streaming for a camera"""
    result = stream_manager.stop_stream(camera_id)
    return jsonify(result)

@app.route('/stream/<camera_id>/status', methods=['GET'])
def stream_status(camera_id):
    """Get status of a specific stream"""
    status = stream_manager.get_stream_status(camera_id)
    return jsonify(status)

@app.route('/stream/<camera_id>/hls/playlist.m3u8', methods=['GET'])
def get_hls_playlist(camera_id):
    """Get HLS playlist for a camera"""
    try:
        playlist_path = f'hls/{camera_id}/playlist.m3u8'
        if os.path.exists(playlist_path):
            with open(playlist_path, 'r') as f:
                content = f.read()
            return Response(content, mimetype='application/vnd.apple.mpegurl')
        return jsonify({'error': 'Playlist not found'}), 404
    except Exception as e:
        logger.error(f"Error getting HLS playlist: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/stream/<camera_id>/hls/<segment>', methods=['GET'])
def get_hls_segment(camera_id, segment):
    """Get HLS video segment"""
    try:
        segment_path = f'hls/{camera_id}/{segment}'
        if os.path.exists(segment_path):
            with open(segment_path, 'rb') as f:
                content = f.read()
            return Response(content, mimetype='video/MP2T')
        return jsonify({'error': 'Segment not found'}), 404
    except Exception as e:
        logger.error(f"Error getting HLS segment: {str(e)}")
        return jsonify({'error': str(e)}), 500

# WebSocket events

@socketio.on('connect')
def handle_connect():
    """Handle client connection"""
    logger.info(f'Client connected: {request.sid}')
    emit('connect', {'data': 'Connected to stream service'})

@socketio.on('disconnect')
def handle_disconnect():
    """Handle client disconnection"""
    logger.info(f'Client disconnected: {request.sid}')

@socketio.on('subscribe_stream')
def handle_subscribe_stream(data):
    """Subscribe to stream updates"""
    camera_id = data.get('camera_id')
    if camera_id:
        join_room(f'stream_{camera_id}')
        logger.info(f'Client subscribed to stream {camera_id}')
        emit('subscribed', {'camera_id': camera_id})

@socketio.on('unsubscribe_stream')
def handle_unsubscribe_stream(data):
    """Unsubscribe from stream updates"""
    camera_id = data.get('camera_id')
    if camera_id:
        leave_room(f'stream_{camera_id}')
        logger.info(f'Client unsubscribed from stream {camera_id}')

# Error handlers

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    logger.info('Starting CCTV Stream Service...')
    port = int(os.getenv('FLASK_PORT', 5001))
    socketio.run(app, host='0.0.0.0', port=port, debug=True)
