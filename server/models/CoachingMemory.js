import mongoose from 'mongoose';

const coachingMemorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
    index: true,
    unique: true
  },
  motivations: [String],
  excusesLog: [{
    excuse: { type: String, required: true },
    classification: {
      type: String,
      enum: ['burnout', 'emotional_resistance', 'fear', 'avoidance', 'laziness', 'confusion', 'perfectionism'],
      required: true
    },
    isValid: { type: Boolean, required: true },
    timestamp: { type: Date, default: Date.now }
  }],
  confidenceLevel: {
    type: Number, // 1 to 100
    default: 50
  },
  consistencyScore: {
    type: Number, // 0 to 100
    default: 100
  }
}, {
  timestamps: true
});

const CoachingMemory = mongoose.model('CoachingMemory', coachingMemorySchema);
export default CoachingMemory;
