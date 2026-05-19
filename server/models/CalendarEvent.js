import mongoose from 'mongoose';

const calendarEventSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  missionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mission',
    default: null
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ""
  },
  start: {
    type: Date,
    required: true
  },
  end: {
    type: Date,
    required: true
  },
  type: {
    type: String,
    enum: ['deep_work', 'learning', 'revision', 'routine', 'recovery', 'break'],
    default: 'learning'
  },
  intensity: {
    type: String,
    enum: ['high', 'medium', 'low'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['scheduled', 'in_progress', 'completed', 'skipped'],
    default: 'scheduled'
  },
  color: {
    type: String,
    default: '#3b82f6' // Default tailwind blue
  },
  googleEventId: {
    type: String,
    default: null
  },
  skipReason: {
    type: String,
    default: ""
  },
  skipReasonValid: {
    type: Boolean,
    default: null
  },
  focusSession: {
    startTime: Date,
    endTime: Date,
    actualDuration: { type: Number, default: 0 }, // in minutes
    pausesCount: { type: Number, default: 0 },
    interruptions: { type: Number, default: 0 },
    completionRate: { type: Number, default: 0 } // 0-100 percentage
  }
}, {
  timestamps: true
});

const CalendarEvent = mongoose.model('CalendarEvent', calendarEventSchema);
export default CalendarEvent;
