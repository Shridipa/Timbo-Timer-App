import mongoose from 'mongoose';

const missionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
    index: true
  },
  goalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Goal',
    index: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  whyItMatters: {
    type: String
  },
  duration: {
    type: Number, // in minutes
    required: true
  },
  priority: {
    type: String,
    enum: ['high', 'medium', 'low'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'completed', 'skipped'],
    default: 'pending'
  },
  skipReason: {
    type: String,
    enum: ['burnout', 'emotional_resistance', 'fear', 'avoidance', 'laziness', 'confusion', 'perfectionism', 'none'],
    default: 'none'
  },
  excuseValidation: {
    type: String,
    default: ''
  },
  focusTime: {
    type: Number, // minutes spent focused
    default: 0
  },
  interruptions: {
    type: Number,
    default: 0
  },
  efficiency: {
    type: Number, // percentage score (focus time / duration)
    default: 0
  },
  date: {
    type: String, // YYYY-MM-DD
    required: true,
    index: true
  },
  timeBlock: {
    type: String,
    enum: ['deep_work', 'light_work', 'recovery', 'learning'],
    default: 'deep_work'
  }
}, {
  timestamps: true
});

const Mission = mongoose.model('Mission', missionSchema);
export default Mission;
