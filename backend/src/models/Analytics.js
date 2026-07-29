import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema({
  camera: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Camera',
    required: true
  },
  eventType: {
    type: String,
    enum: ['motion', 'person-detected', 'vehicle-detected', 'intrusion', 'unusual-activity'],
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  confidence: {
    type: Number,
    min: 0,
    max: 100
  },
  details: {
    objectsDetected: [String],
    coordinates: {
      x: Number,
      y: Number,
      width: Number,
      height: Number
    }
  },
  snapshotPath: String,
  alertSent: {
    type: Boolean,
    default: false
  },
  acknowledgedAt: Date,
  acknowledgedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

analyticsSchema.index({ camera: 1, timestamp: -1 });
analyticsSchema.index({ eventType: 1, timestamp: -1 });
analyticsSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000 }); // 90 days TTL

export default mongoose.model('Analytics', analyticsSchema);
