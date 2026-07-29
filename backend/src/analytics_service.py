"""
CCTV Analytics Service - Phase 4: Advanced Analytics
Motion Detection, Person/Vehicle Detection (AI/ML), Intrusion Detection
Event Notifications, Alert Management
"""

from flask import Flask, Response, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit, join_room
import cv2
import numpy as np
from pathlib import Path
from datetime import datetime, timedelta
import threading
import queue
import logging
from dotenv import load_dotenv
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import requests
import json

# Load environment variables
load_dotenv('../.env.python.example')

# Initialize Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = 'cctv-analytics-secret'
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create necessary directories
Path('alerts').mkdir(exist_ok=True)
Path('detections').mkdir(exist_ok=True)
Path('logs').mkdir(exist_ok=True)

# Global alert storage
alerts_store = {}
acknowledgments = {}

class MotionDetector:
    """Detects motion in video frames using frame differencing"""
    
    def __init__(self, sensitivity=30):
        self.sensitivity = sensitivity
        self.background_subtractor = cv2.createBackgroundSubtractorMOG2(
            detectShadows=True
        )
        self.motion_history = {}
    
    def detect_motion(self, frame, camera_id):
        """Detect motion in frame"""
        try:
            if frame is None:
                return False, 0
            
            # Apply background subtraction
            mask = self.background_subtractor.apply(frame)
            
            # Apply morphological operations
            kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
            mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel)
            mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)
            
            # Count motion pixels
            motion_pixels = cv2.countNonZero(mask)
            frame_area = frame.shape[0] * frame.shape[1]
            motion_percentage = (motion_pixels / frame_area) * 100
            
            # Detect motion if percentage exceeds sensitivity
            is_motion = motion_percentage > self.sensitivity
            
            # Track motion history
            if camera_id not in self.motion_history:
                self.motion_history[camera_id] = []
            
            self.motion_history[camera_id].append(is_motion)
            # Keep only last 30 frames
            if len(self.motion_history[camera_id]) > 30:
                self.motion_history[camera_id].pop(0)
            
            return is_motion, motion_percentage
        
        except Exception as e:
            logger.error(f"Motion detection error: {str(e)}")
            return False, 0

class ObjectDetector:
    """Detects persons and vehicles using YOLOv3"""
    
    def __init__(self):
        self.net = None
        self.layer_names = None
        self.output_layers = None
        self.class_names = []
        self.load_yolo_model()
    
    def load_yolo_model(self):
        """Load YOLOv3 model"""
        try:
            # For production, use actual YOLOv3 weights
            # For now, create placeholder
            self.class_names = ['person', 'car', 'truck', 'bus', 'motorcycle', 'bicycle']
            logger.info("YOLOv3 model initialized (placeholder)")
        except Exception as e:
            logger.error(f"Error loading YOLO model: {str(e)}")
    
    def detect_objects(self, frame):
        """Detect objects in frame"""
        try:
            if frame is None:
                return []
            
            detections = []
            
            # Placeholder detection logic
            # In production, use actual YOLO inference
            h, w = frame.shape[:2]
            
            # Simulate detections
            # This would be replaced with actual YOLO predictions
            
            return detections
        
        except Exception as e:
            logger.error(f"Object detection error: {str(e)}")
            return []
    
    def detect_persons(self, frame):
        """Detect persons in frame"""
        try:
            detections = self.detect_objects(frame)
            persons = [d for d in detections if d.get('class') == 'person']
            return persons, len(persons)
        except Exception as e:
            logger.error(f"Person detection error: {str(e)}")
            return [], 0
    
    def detect_vehicles(self, frame):
        """Detect vehicles in frame"""
        try:
            detections = self.detect_objects(frame)
            vehicle_classes = ['car', 'truck', 'bus', 'motorcycle', 'bicycle']
            vehicles = [d for d in detections if d.get('class') in vehicle_classes]
            return vehicles, len(vehicles)
        except Exception as e:
            logger.error(f"Vehicle detection error: {str(e)}")
            return [], 0

class IntrusionDetector:
    """Detects intrusions based on motion and object detection"""
    
    def __init__(self):
        self.motion_detector = MotionDetector()
        self.object_detector = ObjectDetector()
        self.intrusion_zones = {}
        self.intrusion_alerts = {}
    
    def define_zone(self, camera_id, zone_points):
        """Define intrusion detection zone"""
        self.intrusion_zones[camera_id] = zone_points
        logger.info(f"Intrusion zone defined for {camera_id}")
    
    def detect_intrusion(self, frame, camera_id):
        """Detect intrusion in defined zone"""
        try:
            if camera_id not in self.intrusion_zones:
                return False, []
            
            # Detect motion
            has_motion, motion_pct = self.motion_detector.detect_motion(frame, camera_id)
            
            # Detect persons
            persons, person_count = self.object_detector.detect_persons(frame)
            
            # Intrusion occurs if motion detected + persons found
            intrusion = has_motion and person_count > 0
            
            if intrusion:
                if camera_id not in self.intrusion_alerts:
                    self.intrusion_alerts[camera_id] = []
                
                self.intrusion_alerts[camera_id].append({
                    'timestamp': datetime.now(),
                    'persons': person_count,
                    'confidence': 0.85
                })
            
            return intrusion, persons
        
        except Exception as e:
            logger.error(f"Intrusion detection error: {str(e)}")
            return False, []

class NotificationService:
    """Handles sending notifications via Email, SMS, Push"""
    
    def __init__(self):
        self.email_enabled = os.getenv('EMAIL_PROVIDER') == 'smtp'
        self.sms_enabled = os.getenv('SMS_PROVIDER') is not None
        self.push_enabled = True  # Socket.IO push always enabled
    
    def send_email(self, to_email, subject, body):
        """Send email notification"""
        try:
            if not self.email_enabled:
                logger.warning("Email notifications disabled")
                return False
            
            email_host = os.getenv('EMAIL_HOST', 'smtp.gmail.com')
            email_port = int(os.getenv('EMAIL_PORT', 587))
            email_user = os.getenv('EMAIL_USERNAME')
            email_password = os.getenv('EMAIL_PASSWORD')
            
            msg = MIMEMultipart()
            msg['From'] = email_user
            msg['To'] = to_email
            msg['Subject'] = subject
            msg.attach(MIMEText(body, 'html'))
            
            server = smtplib.SMTP(email_host, email_port)
            server.starttls()
            server.login(email_user, email_password)
            server.send_message(msg)
            server.quit()
            
            logger.info(f"Email sent to {to_email}")
            return True
        
        except Exception as e:
            logger.error(f"Email notification error: {str(e)}")
            return False
    
    def send_sms(self, phone_number, message):
        """Send SMS notification"""
        try:
            # Placeholder for SMS integration
            # In production, use Twilio, AWS SNS, or similar
            logger.info(f"SMS sent to {phone_number}: {message}")
            return True
        
        except Exception as e:
            logger.error(f"SMS notification error: {str(e)}")
            return False
    
    def send_push(self, user_id, title, body, data=None):
        """Send push notification via WebSocket"""
        try:
            notification = {
                'user_id': user_id,
                'title': title,
                'body': body,
                'timestamp': datetime.now().isoformat(),
                'data': data or {}
            }
            
            socketio.emit('alert_notification', notification, room=f'user_{user_id}')
            logger.info(f"Push notification sent to user {user_id}")
            return True
        
        except Exception as e:
            logger.error(f"Push notification error: {str(e)}")
            return False

class AlertManager:
    """Manages alerts and acknowledgments"""
    
    def __init__(self):
        self.alerts = {}
        self.acknowledgments = {}
        self.notification_service = NotificationService()
    
    def create_alert(self, camera_id, alert_type, confidence, details=None):
        """Create new alert"""
        try:
            alert_id = f"{camera_id}_{datetime.now().timestamp()}"
            
            alert = {
                'id': alert_id,
                'camera_id': camera_id,
                'type': alert_type,
                'confidence': confidence,
                'timestamp': datetime.now().isoformat(),
                'details': details or {},
                'acknowledged': False,
                'acknowledged_by': None,
                'acknowledged_at': None
            }
            
            self.alerts[alert_id] = alert
            
            logger.info(f"Alert created: {alert_id} - {alert_type} ({confidence:.0%})")
            return alert
        
        except Exception as e:
            logger.error(f"Alert creation error: {str(e)}")
            return None
    
    def acknowledge_alert(self, alert_id, user_id):
        """Acknowledge alert"""
        try:
            if alert_id not in self.alerts:
                return False
            
            alert = self.alerts[alert_id]
            alert['acknowledged'] = True
            alert['acknowledged_by'] = user_id
            alert['acknowledged_at'] = datetime.now().isoformat()
            
            logger.info(f"Alert acknowledged: {alert_id} by user {user_id}")
            return True
        
        except Exception as e:
            logger.error(f"Alert acknowledgment error: {str(e)}")
            return False
    
    def get_unacknowledged_alerts(self):
        """Get all unacknowledged alerts"""
        try:
            unacknowledged = [
                alert for alert in self.alerts.values()
                if not alert['acknowledged']
            ]
            return unacknowledged
        
        except Exception as e:
            logger.error(f"Error getting unacknowledged alerts: {str(e)}")
            return []
    
    def get_camera_alerts(self, camera_id, limit=50, days=7):
        """Get alerts for specific camera"""
        try:
            cutoff_date = datetime.now() - timedelta(days=days)
            
            camera_alerts = [
                alert for alert in self.alerts.values()
                if alert['camera_id'] == camera_id
            ]
            
            # Filter by date and limit
            camera_alerts = camera_alerts[-limit:]
            
            return camera_alerts
        
        except Exception as e:
            logger.error(f"Error getting camera alerts: {str(e)}")
            return []

# Initialize components
motion_detector = MotionDetector()
object_detector = ObjectDetector()
intrusion_detector = IntrusionDetector()
alert_manager = AlertManager()
notification_service = NotificationService()

# API Routes

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'CCTV Analytics Service',
        'timestamp': datetime.now().isoformat(),
        'active_alerts': len(alert_manager.get_unacknowledged_alerts())
    })

@app.route('/motion/detect', methods=['POST'])
def detect_motion_endpoint():
    """Detect motion in frame"""
    try:
        data = request.json
        camera_id = data.get('camera_id')
        # In production, receive frame data and process
        
        motion_detected, confidence = motion_detector.detect_motion(None, camera_id)
        
        if motion_detected:
            alert = alert_manager.create_alert(
                camera_id,
                'motion_detected',
                confidence / 100,
                {'sensitivity': motion_detector.sensitivity}
            )
        
        return jsonify({
            'motion_detected': motion_detected,
            'confidence': confidence
        })
    
    except Exception as e:
        logger.error(f"Motion detection endpoint error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/objects/detect/persons', methods=['POST'])
def detect_persons_endpoint():
    """Detect persons in camera feed"""
    try:
        data = request.json
        camera_id = data.get('camera_id')
        
        # In production, process actual video frame
        persons, count = object_detector.detect_persons(None)
        
        if count > 0:
            alert = alert_manager.create_alert(
                camera_id,
                'person_detected',
                0.85,
                {'persons_count': count}
            )
        
        return jsonify({
            'persons_detected': count,
            'persons': persons
        })
    
    except Exception as e:
        logger.error(f"Person detection endpoint error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/objects/detect/vehicles', methods=['POST'])
def detect_vehicles_endpoint():
    """Detect vehicles in camera feed"""
    try:
        data = request.json
        camera_id = data.get('camera_id')
        
        vehicles, count = object_detector.detect_vehicles(None)
        
        if count > 0:
            alert = alert_manager.create_alert(
                camera_id,
                'vehicle_detected',
                0.90,
                {'vehicles_count': count}
            )
        
        return jsonify({
            'vehicles_detected': count,
            'vehicles': vehicles
        })
    
    except Exception as e:
        logger.error(f"Vehicle detection endpoint error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/intrusion/detect', methods=['POST'])
def detect_intrusion_endpoint():
    """Detect intrusion in zone"""
    try:
        data = request.json
        camera_id = data.get('camera_id')
        
        intrusion, persons = intrusion_detector.detect_intrusion(None, camera_id)
        
        if intrusion:
            alert = alert_manager.create_alert(
                camera_id,
                'intrusion_detected',
                0.95,
                {'persons': len(persons)}
            )
        
        return jsonify({
            'intrusion_detected': intrusion,
            'confidence': 0.95 if intrusion else 0.0
        })
    
    except Exception as e:
        logger.error(f"Intrusion detection endpoint error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/alerts', methods=['GET'])
def get_alerts():
    """Get all alerts"""
    try:
        camera_id = request.args.get('camera_id')
        limit = int(request.args.get('limit', 50))
        days = int(request.args.get('days', 7))
        
        if camera_id:
            alerts = alert_manager.get_camera_alerts(camera_id, limit, days)
        else:
            alerts = list(alert_manager.alerts.values())[-limit:]
        
        return jsonify({
            'alerts': alerts,
            'total': len(alerts)
        })
    
    except Exception as e:
        logger.error(f"Get alerts endpoint error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/alerts/unacknowledged', methods=['GET'])
def get_unacknowledged_alerts():
    """Get unacknowledged alerts"""
    try:
        unacknowledged = alert_manager.get_unacknowledged_alerts()
        return jsonify({
            'alerts': unacknowledged,
            'total': len(unacknowledged)
        })
    
    except Exception as e:
        logger.error(f"Get unacknowledged alerts error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/alerts/<alert_id>/acknowledge', methods=['PATCH'])
def acknowledge_alert(alert_id):
    """Acknowledge alert"""
    try:
        data = request.json
        user_id = data.get('user_id')
        
        success = alert_manager.acknowledge_alert(alert_id, user_id)
        
        return jsonify({
            'success': success,
            'alert_id': alert_id
        })
    
    except Exception as e:
        logger.error(f"Acknowledge alert error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/notifications/send', methods=['POST'])
def send_notification():
    """Send notification"""
    try:
        data = request.json
        notification_type = data.get('type')
        recipient = data.get('recipient')
        title = data.get('title')
        body = data.get('body')
        
        success = False
        
        if notification_type == 'email':
            success = notification_service.send_email(recipient, title, body)
        elif notification_type == 'sms':
            success = notification_service.send_sms(recipient, body)
        elif notification_type == 'push':
            success = notification_service.send_push(recipient, title, body)
        
        return jsonify({
            'success': success,
            'type': notification_type
        })
    
    except Exception as e:
        logger.error(f"Send notification error: {str(e)}")
        return jsonify({'error': str(e)}), 500

# WebSocket Events

@socketio.on('connect')
def handle_connect():
    """Handle client connection"""
    logger.info(f'Analytics client connected: {request.sid}')
    emit('connected', {'data': 'Connected to analytics service'})

@socketio.on('disconnect')
def handle_disconnect():
    """Handle client disconnection"""
    logger.info(f'Analytics client disconnected: {request.sid}')

@socketio.on('subscribe_alerts')
def handle_subscribe_alerts(data):
    """Subscribe to alert notifications"""
    camera_id = data.get('camera_id')
    user_id = data.get('user_id')
    
    if camera_id:
        join_room(f'camera_{camera_id}')
        logger.info(f'User {user_id} subscribed to alerts for camera {camera_id}')
        emit('subscribed', {'camera_id': camera_id})

# Error handlers

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    logger.error(f"Internal server error: {str(error)}")
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    logger.info('Starting CCTV Analytics Service...')
    port = int(os.getenv('ANALYTICS_PORT', 5002))
    socketio.run(app, host='0.0.0.0', port=port, debug=False)
