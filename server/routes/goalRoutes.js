import express from 'express';
import { createGoal, getActiveGoal, completeGoal, resetGoal } from '../controllers/goalController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/', createGoal);
router.get('/active', getActiveGoal);
router.put('/active/complete', completeGoal);
router.delete('/active', resetGoal);

export default router;
