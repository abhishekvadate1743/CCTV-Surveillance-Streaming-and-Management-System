import express from 'express';
import Recording from '../models/Recording.js';
import Camera from '../models/Camera.js';
import { verifyToken, authorizeRole } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';

const router = express.Router();

// Get recordings for a camera
router.get('/camera/:cameraId', verifyToken, async (req, res, next) => {
  try {
    const { startDate, endDate, limit = 50, skip = 0 } = req.query;
    let query = { camera: req.params.cameraId };

    if (startDate || endDate) {
      query.startTime = {};
      if (startDate) query.startTime.$gte = new Date(startDate);
      if (endDate) query.startTime.$lte = new Date(endDate);
    }

    const recordings = await Recording.find(query)
      .sort({ startTime: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .populate('camera', 'name location');

    const total = await Recording.countDocuments(query);

    res.json({
      success: true,
      recordings,
      pagination: { total, limit: parseInt(limit), skip: parseInt(skip) }
    });
  } catch (error) {
    next(error);
  }
});

// Get all recordings
router.get('/', verifyToken, async (req, res, next) => {
  try {
    const { limit = 50, skip = 0 } = req.query;

    const recordings = await Recording.find()
      .sort({ startTime: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .populate('camera', 'name location');

    const total = await Recording.countDocuments();

    res.json({
      success: true,
      recordings,
      pagination: { total, limit: parseInt(limit), skip: parseInt(skip) }
    });
  } catch (error) {
    next(error);
  }
});

// Create recording
router.post('/', verifyToken, authorizeRole('admin', 'operator'), async (req, res, next) => {
  try {
    const { camera, fileName, filePath, duration, startTime, endTime } = req.body;

    if (!camera || !fileName || !filePath) {
      throw new AppError('Please provide camera, fileName, and filePath', 400);
    }

    const cameraExists = await Camera.findById(camera);
    if (!cameraExists) {
      throw new AppError('Camera not found', 404);
    }

    const recording = new Recording({
      camera,
      fileName,
      filePath,
      duration,
      startTime,
      endTime,
      recordingType: 'scheduled'
    });

    await recording.save();
    res.status(201).json({
      success: true,
      message: 'Recording created successfully',
      recording
    });
  } catch (error) {
    next(error);
  }
});

// Archive recording
router.patch('/:id/archive', verifyToken, authorizeRole('admin', 'operator'), async (req, res, next) => {
  try {
    const recording = await Recording.findByIdAndUpdate(
      req.params.id,
      { isArchived: true },
      { new: true }
    );

    if (!recording) {
      throw new AppError('Recording not found', 404);
    }

    res.json({
      success: true,
      message: 'Recording archived successfully',
      recording
    });
  } catch (error) {
    next(error);
  }
});

// Delete recording
router.delete('/:id', verifyToken, authorizeRole('admin'), async (req, res, next) => {
  try {
    const recording = await Recording.findByIdAndDelete(req.params.id);
    if (!recording) {
      throw new AppError('Recording not found', 404);
    }

    res.json({
      success: true,
      message: 'Recording deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
