import express from 'express';
import { getDailyMissions, toggleMission, skipMission, logFocusSession, analyzeTaskSchedule, scheduleIntelligentTask } from '../controllers/missionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getDailyMissions);
router.post('/ai-schedule-analysis', analyzeTaskSchedule);
router.post('/schedule', scheduleIntelligentTask);
router.put('/:id/toggle', toggleMission);
router.put('/:id/skip', skipMission);
router.put('/:id/focus', logFocusSession);

export default router;
