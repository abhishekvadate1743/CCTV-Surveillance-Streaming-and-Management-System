import express from 'express';
import Camera from '../models/Camera.js';
import { verifyToken, authorizeRole } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';

const router = express.Router();

// Get all cameras (with filter)
router.get('/', verifyToken, async (req, res, next) => {
  try {
    const { status, location } = req.query;
    let query = {};

    if (req.user.role === 'viewer') {
      query.owner = req.user.userId;
    }

    if (status) query.status = status;
    if (location) query.location = new RegExp(location, 'i');

    const cameras = await Camera.find(query).populate('owner', 'name email');
    res.json({ success: true, cameras });
  } catch (error) {
    next(error);
  }
});

// Get single camera
router.get('/:id', verifyToken, async (req, res, next) => {
  try {
    const camera = await Camera.findById(req.params.id).populate('owner', 'name email');
    if (!camera) {
      throw new AppError('Camera not found', 404);
    }

    res.json({ success: true, camera });
  } catch (error) {
    next(error);
  }
});

// Create camera
router.post('/', verifyToken, authorizeRole('admin', 'operator'), async (req, res, next) => {
  try {
    const { name, location, streamUrl, rtspUrl, cameraType } = req.body;

    if (!name || !location || !streamUrl) {
      throw new AppError('Please provide name, location, and streamUrl', 400);
    }

    const camera = new Camera({
      name,
      location,
      streamUrl,
      rtspUrl,
      cameraType,
      owner: req.user.userId
    });

    await camera.save();
    res.status(201).json({
      success: true,
      message: 'Camera created successfully',
      camera
    });
  } catch (error) {
    next(error);
  }
});

// Update camera
router.put('/:id', verifyToken, authorizeRole('admin', 'operator'), async (req, res, next) => {
  try {
    let camera = await Camera.findById(req.params.id);
    if (!camera) {
      throw new AppError('Camera not found', 404);
    }

    camera = Object.assign(camera, req.body);
    camera.updatedAt = new Date();
    await camera.save();

    res.json({
      success: true,
      message: 'Camera updated successfully',
      camera
    });
  } catch (error) {
    next(error);
  }
});

// Delete camera
router.delete('/:id', verifyToken, authorizeRole('admin'), async (req, res, next) => {
  try {
    const camera = await Camera.findByIdAndDelete(req.params.id);
    if (!camera) {
      throw new AppError('Camera not found', 404);
    }

    res.json({
      success: true,
      message: 'Camera deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Update camera status
router.patch('/:id/status', verifyToken, async (req, res, next) => {
  try {
    const { status } = req.body;
    const camera = await Camera.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: new Date() },
      { new: true }
    );

    if (!camera) {
      throw new AppError('Camera not found', 404);
    }

    res.json({
      success: true,
      message: 'Camera status updated',
      camera
    });
  } catch (error) {
    next(error);
  }
});

export default router;
