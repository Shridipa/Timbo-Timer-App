import mongoose from 'mongoose';

const dailyReviewSchema = new mongoose.Schema({
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
  win: {
    type: String,
    required: true
  },
  struggle: {
    type: String,
    required: true
  },
  energyLevel: {
    type: Number, // 1 to 10
    required: true
  },
  distractionLevel: {
    type: Number, // 1 to 10
    required: true
  },
  reflection: {
    type: String
  },
  insights: {
    type: String, // AI-generated bedtime summary & adjustments
    default: ''
  }
}, {
  timestamps: true
});

dailyReviewSchema.index({ userId: 1, date: 1 }, { unique: true });

const DailyReview = mongoose.model('DailyReview', dailyReviewSchema);
export default DailyReview;
