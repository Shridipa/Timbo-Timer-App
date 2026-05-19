import mongoose from 'mongoose';

const availabilityProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  morningAvailable: {
    type: String, // e.g. "08:00 - 12:00"
    default: "08:00 - 12:00"
  },
  afternoonAvailable: {
    type: String,
    default: "13:00 - 17:00"
  },
  eveningAvailable: {
    type: String,
    default: "18:00 - 22:00"
  },
  weekendSchedule: {
    type: String,
    default: "09:00 - 18:00"
  },
  sleepStart: {
    type: String,
    default: "23:00"
  },
  sleepEnd: {
    type: String,
    default: "07:00"
  },
  peakHour: {
    type: String, // e.g. "10:00" or "20:00"
    default: "10:00"
  },
  maxDeepWorkHours: {
    type: Number,
    default: 4
  },
  preferredDuration: {
    type: Number, // focus duration in minutes (e.g. 50 or 90)
    default: 50
  },
  preferredBreak: {
    type: Number, // break duration in minutes (e.g. 10 or 15)
    default: 10
  },
  fixedCommitments: {
    type: String, // comma separated or free text description
    default: ""
  }
}, {
  timestamps: true
});

const AvailabilityProfile = mongoose.model('AvailabilityProfile', availabilityProfileSchema);
export default AvailabilityProfile;
