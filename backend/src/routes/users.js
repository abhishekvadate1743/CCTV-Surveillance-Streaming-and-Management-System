import express from 'express';
import User from '../models/User.js';
import { verifyToken, authorizeRole } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';

const router = express.Router();

// Get all users (admin only)
router.get('/', verifyToken, authorizeRole('admin'), async (req, res, next) => {
  try {
    const users = await User.find().select('-password');
    res.json({ success: true, users });
  } catch (error) {
    next(error);
  }
});

// Get user by ID
router.get('/:id', verifyToken, async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
});

// Update user
router.put('/:id', verifyToken, async (req, res, next) => {
  try {
    if (req.params.id !== req.user.userId && req.user.role !== 'admin') {
      throw new AppError('You can only update your own profile', 403);
    }

    const { name, phone, department } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (department) updateData.department = department;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { ...updateData, updatedAt: new Date() },
      { new: true }
    ).select('-password');

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.json({
      success: true,
      message: 'User updated successfully',
      user
    });
  } catch (error) {
    next(error);
  }
});

// Deactivate user (admin only)
router.patch('/:id/deactivate', verifyToken, authorizeRole('admin'), async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false, updatedAt: new Date() },
      { new: true }
    ).select('-password');

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.json({
      success: true,
      message: 'User deactivated successfully',
      user
    });
  } catch (error) {
    next(error);
  }
});

// Activate user (admin only)
router.patch('/:id/activate', verifyToken, authorizeRole('admin'), async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: true, updatedAt: new Date() },
      { new: true }
    ).select('-password');

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.json({
      success: true,
      message: 'User activated successfully',
      user
    });
  } catch (error) {
    next(error);
  }
});

// Change user role (admin only)
router.patch('/:id/role', verifyToken, authorizeRole('admin'), async (req, res, next) => {
  try {
    const { role } = req.body;

    if (!['admin', 'operator', 'viewer'].includes(role)) {
      throw new AppError('Invalid role', 400);
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role, updatedAt: new Date() },
      { new: true }
    ).select('-password');

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.json({
      success: true,
      message: 'User role updated successfully',
      user
    });
  } catch (error) {
    next(error);
  }
});

export default router;
