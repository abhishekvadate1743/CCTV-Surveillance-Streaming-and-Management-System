import express from 'express';
import Analytics from '../models/Analytics.js';
import { verifyToken, authorizeRole } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';

const router = express.Router();

// Get analytics for camera
router.get('/camera/:cameraId', verifyToken, async (req, res, next) => {
  try {
    const { eventType, startDate, endDate, limit = 50 } = req.query;
    let query = { camera: req.params.cameraId };

    if (eventType) query.eventType = eventType;

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const events = await Analytics.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .populate('camera', 'name location')
      .populate('acknowledgedBy', 'name email');

    res.json({ success: true, events });
  } catch (error) {
    next(error);
  }
});

// Get all unacknowledged alerts
router.get('/alerts/unacknowledged', verifyToken, async (req, res, next) => {
  try {
    const alerts = await Analytics.find({ alertSent: true, acknowledgedAt: null })
      .sort({ timestamp: -1 })
      .populate('camera', 'name location');

    res.json({ success: true, alerts });
  } catch (error) {
    next(error);
  }
});

// Create event
router.post('/', verifyToken, authorizeRole('admin', 'operator'), async (req, res, next) => {
  try {
    const { camera, eventType, confidence, details, snapshotPath } = req.body;

    if (!camera || !eventType) {
      throw new AppError('Please provide camera and eventType', 400);
    }

    const event = new Analytics({
      camera,
      eventType,
      confidence,
      details,
      snapshotPath,
      alertSent: true
    });

    await event.save();
    res.status(201).json({
      success: true,
      message: 'Analytics event created',
      event
    });
  } catch (error) {
    next(error);
  }
});

// Acknowledge alert
router.patch('/:id/acknowledge', verifyToken, async (req, res, next) => {
  try {
    const event = await Analytics.findByIdAndUpdate(
      req.params.id,
      { acknowledgedAt: new Date(), acknowledgedBy: req.user.userId },
      { new: true }
    ).populate('camera', 'name location');

    if (!event) {
      throw new AppError('Event not found', 404);
    }

    res.json({
      success: true,
      message: 'Alert acknowledged',
      event
    });
  } catch (error) {
    next(error);
  }
});

// Get analytics summary
router.get('/summary/dashboard', verifyToken, async (req, res, next) => {
  try {
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const motionEvents = await Analytics.countDocuments({
      eventType: 'motion',
      timestamp: { $gte: last24Hours }
    });

    const personDetected = await Analytics.countDocuments({
      eventType: 'person-detected',
      timestamp: { $gte: last24Hours }
    });

    const vehicleDetected = await Analytics.countDocuments({
      eventType: 'vehicle-detected',
      timestamp: { $gte: last24Hours }
    });

    const intrusions = await Analytics.countDocuments({
      eventType: 'intrusion',
      timestamp: { $gte: last24Hours }
    });

    const unacknowledgedAlerts = await Analytics.countDocuments({
      alertSent: true,
      acknowledgedAt: null
    });

    res.json({
      success: true,
      summary: {
        motionEvents,
        personDetected,
        vehicleDetected,
        intrusions,
        unacknowledgedAlerts
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
