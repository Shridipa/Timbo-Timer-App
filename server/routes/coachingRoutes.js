import express from 'express';
import { getMorningBrief, getTodayReview, submitDailyReview, chatStrategy } from '../controllers/coachingController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/brief', getMorningBrief);
router.get('/review', getTodayReview);
router.post('/review', submitDailyReview);
router.post('/chat', chatStrategy);

export default router;
