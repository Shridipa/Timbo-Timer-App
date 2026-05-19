import mongoose from 'mongoose';

const goalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
    index: true
  },
  title: {
    type: String,
    required: [true, 'Please add a goal title'],
    trim: true
  },
  deadline: {
    type: Date,
    required: [true, 'Please add a target deadline']
  },
  targetHours: {
    type: Number,
    required: [true, 'Please specify daily available hours']
  },
  commitments: {
    type: String,
    default: ''
  },
  stressLevel: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  currentLevel: {
    type: String,
    default: 'Beginner'
  },
  motivations: {
    type: String,
    default: ''
  },
  distractions: {
    type: String,
    default: ''
  },
  active: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['analyzing', 'active', 'completed', 'failed'],
    default: 'analyzing'
  },
  analysis: {
    skillGaps: [String],
    effortEstimate: String,
    dependencies: [String],
    risks: [String],
    executionProbability: Number,
    focusAllocation: String,
    burnoutRisk: String
  }
}, {
  timestamps: true
});

const Goal = mongoose.model('Goal', goalSchema);
export default Goal;
