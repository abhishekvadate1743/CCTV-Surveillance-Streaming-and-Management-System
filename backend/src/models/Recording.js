import mongoose from 'mongoose';

const recordingSchema = new mongoose.Schema({
  camera: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Camera',
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  fileSize: Number,
  duration: Number, // in seconds
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  recordingType: {
    type: String,
    enum: ['scheduled', 'manual', 'event-triggered'],
    default: 'scheduled'
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  retention: {
    type: Number,
    default: 30 // days
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

recordingSchema.index({ camera: 1, startTime: -1 });
recordingSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 }); // 30 days TTL

export default mongoose.model('Recording', recordingSchema);
