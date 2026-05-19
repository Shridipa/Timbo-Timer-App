import mongoose from 'mongoose';

const morningBriefSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
    index: true
  },
  date: {
    type: String, // YYYY-MM-DD
    required: true
  },
  motivation: {
    type: String,
    required: true
  },
  brief: {
    type: String, // AI-generated morning strategic mission guidelines
    required: true
  }
}, {
  timestamps: true
});

morningBriefSchema.index({ userId: 1, date: 1 }, { unique: true });

const MorningBrief = mongoose.model('MorningBrief', morningBriefSchema);
export default MorningBrief;
