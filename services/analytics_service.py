"""
Analytics Service - Python Service for AI/ML-based Detection
This service handles:
- Motion detection
- Person detection (YOLO)
- Vehicle detection (YOLO)
- Intrusion detection
- Event classification
"""

import cv2
import numpy as np
from collections import deque
import logging
from datetime import datetime
from pathlib import Path
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('../.env.python.example')

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class MotionDetector:
    """Detects motion in video frames"""
    
    def __init__(self, threshold=25, min_area=500):
        self.threshold = threshold
        self.min_area = min_area
        self.prev_frame = None
    
    def detect(self, frame):
        """
        Detect motion in frame
        Returns: motion_detected (bool), contours
        """
        try:
            # Convert to grayscale
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            
            # Apply Gaussian blur
            gray = cv2.GaussianBlur(gray, (21, 21), 0)
            
            if self.prev_frame is None:
                self.prev_frame = gray
                return False, []
            
            # Compute frame difference
            frame_diff = cv2.absdiff(self.prev_frame, gray)
            thresh = cv2.threshold(frame_diff, self.threshold, 255, cv2.THRESH_BINARY)[1]
            
            # Dilate threshold image
            thresh = cv2.dilate(thresh, None, iterations=2)
            
            # Find contours
            contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            # Check if motion detected
            motion_detected = False
            for contour in contours:
                if cv2.contourArea(contour) > self.min_area:
                    motion_detected = True
                    break
            
            self.prev_frame = gray
            return motion_detected, contours
        
        except Exception as e:
            logger.error(f"Error detecting motion: {str(e)}")
            return False, []

class PersonDetector:
    """Detects persons in video frames using YOLO"""
    
    def __init__(self, confidence_threshold=0.5):
        self.confidence_threshold = confidence_threshold
        self.model = None
        self.class_names = ['person']
        
        try:
            # Try to load YOLO model
            # This is a placeholder - actual implementation requires YOLOv8
            logger.info("Person detector initialized (YOLO model not loaded)")
        except Exception as e:
            logger.error(f"Error initializing person detector: {str(e)}")
    
    def detect(self, frame):
        """
        Detect persons in frame
        Returns: detections list with confidence scores and bounding boxes
        """
        try:
            # Placeholder implementation
            detections = []
            
            # Actual YOLO inference would go here
            # detections = self.model.predict(frame, conf=self.confidence_threshold)
            
            return detections
        except Exception as e:
            logger.error(f"Error detecting persons: {str(e)}")
            return []

class VehicleDetector:
    """Detects vehicles in video frames using YOLO"""
    
    def __init__(self, confidence_threshold=0.5):
        self.confidence_threshold = confidence_threshold
        self.model = None
        self.class_names = ['car', 'truck', 'bus', 'motorcycle', 'bicycle']
        
        try:
            # Try to load YOLO model
            logger.info("Vehicle detector initialized (YOLO model not loaded)")
        except Exception as e:
            logger.error(f"Error initializing vehicle detector: {str(e)}")
    
    def detect(self, frame):
        """
        Detect vehicles in frame
        Returns: detections list with confidence scores and bounding boxes
        """
        try:
            # Placeholder implementation
            detections = []
            
            # Actual YOLO inference would go here
            # detections = self.model.predict(frame, conf=self.confidence_threshold)
            
            return detections
        except Exception as e:
            logger.error(f"Error detecting vehicles: {str(e)}")
            return []

class IntrusionDetector:
    """Detects intrusion based on motion and object detection"""
    
    def __init__(self, zone_coordinates=None):
        self.zone_coordinates = zone_coordinates or []
        self.motion_detector = MotionDetector()
        self.person_detector = PersonDetector()
        self.vehicle_detector = VehicleDetector()
    
    def detect(self, frame):
        """
        Detect intrusion in frame
        Returns: intrusion_detected (bool), event_details
        """
        try:
            event_details = {
                'timestamp': datetime.now().isoformat(),
                'motion': False,
                'persons': [],
                'vehicles': [],
                'intrusion': False
            }
            
            # Detect motion
            motion, _ = self.motion_detector.detect(frame)
            event_details['motion'] = motion
            
            # Detect persons
            persons = self.person_detector.detect(frame)
            event_details['persons'] = persons
            
            # Detect vehicles
            vehicles = self.vehicle_detector.detect(frame)
            event_details['vehicles'] = vehicles
            
            # Determine intrusion
            # Intrusion = motion + (person or vehicle detected)
            event_details['intrusion'] = motion and (len(persons) > 0 or len(vehicles) > 0)
            
            return event_details['intrusion'], event_details
        
        except Exception as e:
            logger.error(f"Error detecting intrusion: {str(e)}")
            return False, {}

class FrameProcessor:
    """Processes video frames and extracts analytics"""
    
    def __init__(self):
        self.motion_detector = MotionDetector()
        self.intrusion_detector = IntrusionDetector()
        self.frame_buffer = deque(maxlen=30)  # Buffer last 30 frames
    
    def process(self, frame):
        """
        Process frame and extract analytics
        Returns: frame, events
        """
        try:
            events = {
                'timestamp': datetime.now().isoformat(),
                'motion_detected': False,
                'objects': [],
                'intrusion': False
            }
            
            # Detect motion
            motion, contours = self.motion_detector.detect(frame)
            events['motion_detected'] = motion
            
            # Detect intrusion
            intrusion, intrusion_details = self.intrusion_detector.detect(frame)
            events.update(intrusion_details)
            
            # Store frame
            self.frame_buffer.append(frame)
            
            return frame, events
        
        except Exception as e:
            logger.error(f"Error processing frame: {str(e)}")
            return frame, {}
    
    def get_frame_snapshot(self):
        """Get latest frame snapshot"""
        if len(self.frame_buffer) > 0:
            return self.frame_buffer[-1]
        return None

# Global processor instance
frame_processor = FrameProcessor()

def process_video_stream(rtsp_url, camera_id, callback=None):
    """
    Process video stream from RTSP URL
    Args:
        rtsp_url: RTSP stream URL
        camera_id: Camera ID for tracking
        callback: Callback function for events
    """
    try:
        cap = cv2.VideoCapture(rtsp_url)
        logger.info(f"Started processing stream for camera {camera_id}")
        
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                logger.warning(f"Failed to read frame from {camera_id}")
                break
            
            # Process frame
            processed_frame, events = frame_processor.process(frame)
            
            # Call callback with events
            if callback and events.get('motion_detected'):
                callback(camera_id, events)
        
        cap.release()
        logger.info(f"Stopped processing stream for camera {camera_id}")
    
    except Exception as e:
        logger.error(f"Error processing video stream: {str(e)}")

if __name__ == '__main__':
    logger.info("Analytics Service ready")
