import mongoose from 'mongoose';

const roadmapSchema = new mongoose.Schema({
  goalId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Goal',
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  phases: [{
    title: { type: String, required: true },
    objective: { type: String, required: true },
    duration: { type: String, required: true }, // e.g., '2 weeks', '1 month'
    practiceGoals: [String],
    expectedOutcomes: [String],
    order: { type: Number, required: true },
    tasks: [{
      title: { type: String, required: true },
      description: { type: String },
      duration: { type: Number }, // in minutes
      priority: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
      status: { type: String, enum: ['pending', 'active', 'completed'], default: 'pending' },
      resources: { type: String },
      whyItMatters: { type: String }
    }]
  }],
  version: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
});

const Roadmap = mongoose.model('Roadmap', roadmapSchema);
export default Roadmap;
