import mongoose from 'mongoose';

const cameraSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  description: String,
  streamUrl: {
    type: String,
    required: true
  },
  rtspUrl: String,
  cameraType: {
    type: String,
    enum: ['ip', 'usb', 'analog'],
    default: 'ip'
  },
  resolution: {
    width: Number,
    height: Number
  },
  frameRate: {
    type: Number,
    default: 30
  },
  status: {
    type: String,
    enum: ['online', 'offline', 'error'],
    default: 'offline'
  },
  isRecording: {
    type: Boolean,
    default: false
  },
  recordingSchedule: {
    startTime: String,
    endTime: String,
    daysOfWeek: [Number] // 0-6 for Sunday-Saturday
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  department: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

cameraSchema.index({ owner: 1, status: 1 });
cameraSchema.index({ location: 1 });

export default mongoose.model('Camera', cameraSchema);
