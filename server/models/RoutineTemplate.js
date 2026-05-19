import mongoose from 'mongoose';

const routineTemplateSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['morning', 'study', 'gym', 'sleep', 'recovery', 'review'],
    default: 'study'
  },
  startTime: {
    type: String, // e.g. "07:00"
    required: true
  },
  endTime: {
    type: String, // e.g. "08:00"
    required: true
  },
  daysOfWeek: {
    type: [Number], // 0 for Sunday, 1 for Monday... 6 for Saturday
    default: [1, 2, 3, 4, 5] // Default weekdays
  },
  description: {
    type: String,
    default: ""
  },
  color: {
    type: String,
    default: "#8b5cf6" // Purple
  }
}, {
  timestamps: true
});

const RoutineTemplate = mongoose.model('RoutineTemplate', routineTemplateSchema);
export default RoutineTemplate;
