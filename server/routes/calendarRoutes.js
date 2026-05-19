import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import AvailabilityProfile from '../models/AvailabilityProfile.js';
import CalendarEvent from '../models/CalendarEvent.js';
import Mission from '../models/Mission.js';
import { autoScheduleDailyMissions } from '../services/schedulingEngine.js';
import { validateExcuse } from '../services/aiService.js';
import { syncEventToGoogle, deleteEventFromGoogle } from '../utils/googleCalendarSync.js';

const router = express.Router();
router.use(protect);

// 1. Get Availability Profile
router.get('/availability', async (req, res, next) => {
  try {
    let profile = await AvailabilityProfile.findOne({ userId: req.user._id });
    if (!profile) {
      profile = await AvailabilityProfile.create({ userId: req.user._id });
    }
    res.status(200).json({ success: true, profile });
  } catch (error) {
    next(error);
  }
});

// 2. Create/Update Availability Profile & Trigger Auto-Reschedule
router.post('/availability', async (req, res, next) => {
  try {
    const { 
      morningAvailable, afternoonAvailable, eveningAvailable, weekendSchedule,
      sleepStart, sleepEnd, peakHour, maxDeepWorkHours, preferredDuration, preferredBreak, fixedCommitments
    } = req.body;

    const profile = await AvailabilityProfile.findOneAndUpdate(
      { userId: req.user._id },
      { 
        morningAvailable, afternoonAvailable, eveningAvailable, weekendSchedule,
        sleepStart, sleepEnd, peakHour, maxDeepWorkHours: Number(maxDeepWorkHours), 
        preferredDuration: Number(preferredDuration), preferredBreak: Number(preferredBreak), fixedCommitments
      },
      { upsert: true, new: true }
    );

    // Dynamic rescheduling triggered upon changing availability profile parameters
    await autoScheduleDailyMissions(req.user._id, new Date());

    res.status(200).json({ success: true, profile, message: 'Availability captured and active routines recalculated successfully!' });
  } catch (error) {
    next(error);
  }
});

// 3. Trigger Auto-Schedule
router.post('/autoschedule', async (req, res, next) => {
  try {
    const result = await autoScheduleDailyMissions(req.user._id, new Date());
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
});

// 4. Get Calendar Events (Range-based for FullCalendar views)
router.get('/events', async (req, res, next) => {
  try {
    const { start, end } = req.query;
    if (!start || !end) {
      res.status(400);
      throw new Error('Please specify start and end dates query parameters');
    }

    const events = await CalendarEvent.find({
      userId: req.user._id,
      start: { $gte: new Date(start) },
      end: { $lte: new Date(end) }
    }).sort({ start: 1 });

    res.status(200).json({ success: true, events });
  } catch (error) {
    next(error);
  }
});

// 5. Update Calendar Event (Enables Drag and Drop Rescheduling)
router.put('/events/:id', async (req, res, next) => {
  try {
    const { start, end, status } = req.body;
    const event = await CalendarEvent.findOne({ _id: req.params.id, userId: req.user._id });
    
    if (!event) {
      res.status(404);
      throw new Error('Calendar event not found');
    }

    if (start) event.start = new Date(start);
    if (end) event.end = new Date(end);
    if (status) event.status = status;

    await event.save();
    await syncEventToGoogle(event); // sync edits instantly to Google Calendar

    res.status(200).json({ success: true, event, message: 'Event successfully rescheduled and synced!' });
  } catch (error) {
    next(error);
  }
});

// 6. Delete Event
router.delete('/events/:id', async (req, res, next) => {
  try {
    const event = await CalendarEvent.findOne({ _id: req.params.id, userId: req.user._id });
    if (!event) {
      res.status(404);
      throw new Error('Calendar event not found');
    }

    await deleteEventFromGoogle(event.googleEventId);
    await CalendarEvent.deleteOne({ _id: event._id });

    res.status(200).json({ success: true, message: 'Event removed and desynced from Google Calendar' });
  } catch (error) {
    next(error);
  }
});

// 7. Track Focus Session Metrics
router.post('/events/:id/track', async (req, res, next) => {
  try {
    const { startTime, endTime, actualDuration, pausesCount, interruptions, completionRate } = req.body;
    const event = await CalendarEvent.findOne({ _id: req.params.id, userId: req.user._id });

    if (!event) {
      res.status(404);
      throw new Error('Active focus event not found');
    }

    event.status = 'completed';
    event.focusSession = {
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      actualDuration,
      pausesCount,
      interruptions,
      completionRate
    };

    await event.save();

    // Link and auto-complete corresponding Roadmap Mission if mapped
    if (event.missionId) {
      await Mission.findByIdAndUpdate(event.missionId, { status: 'completed' });
    }

    res.status(200).json({ success: true, event, message: 'Focus metrics captured! Performance Index recalculated.' });
  } catch (error) {
    next(error);
  }
});

// 8. Missed Session Excuses Analysis & Adaptive CBT Rescheduling
router.post('/events/:id/skip', async (req, res, next) => {
  try {
    const { excuse } = req.body;
    const event = await CalendarEvent.findOne({ _id: req.params.id, userId: req.user._id });

    if (!event) {
      res.status(404);
      throw new Error('Focus event not found');
    }

    event.status = 'skipped';
    event.skipReason = excuse;

    // Trigger CBT analysis using user motivations
    const userMotivations = req.user.psychologyProfile?.motivations || "achieving my objectives";
    const appraisal = await validateExcuse(event.title, excuse, userMotivations);
    
    event.skipReasonValid = appraisal.isValid;
    await event.save();

    // Archive original Roadmap Mission block if skipped
    if (event.missionId) {
      await Mission.findByIdAndUpdate(event.missionId, { status: 'skipped' });
    }

    // Adaptive Rescheduling Engine: Reschedule immediately tomorrow if excuse is valid
    if (appraisal.isValid) {
      const tomorrow = new Date(event.start);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Create rescheduled block
      await CalendarEvent.create({
        userId: req.user._id,
        missionId: event.missionId,
        title: `[Rescheduled] ${event.title}`,
        description: `Adaptive Rescheduling: ${appraisal.feedback}`,
        start: tomorrow,
        end: new Date(tomorrow.getTime() + (event.end.getTime() - event.start.getTime())),
        type: event.type,
        intensity: event.intensity,
        color: '#f59e0b', // warning amber
        status: 'scheduled'
      });
    }

    res.status(200).json({
      success: true,
      appraisal,
      message: appraisal.isValid 
        ? 'Strategy successfully calibrated. Task rescheduled for tomorrow.' 
        : 'CBT Confrontation triggered.'
    });
  } catch (error) {
    next(error);
  }
});

// 9. Simulated Google OAuth Redirect Portal
router.post('/oauth/mock', (req, res) => {
  res.status(200).json({
    success: true,
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth?client_id=simulated&redirect_uri=http://localhost:3000/settings&scope=https://www.googleapis.com/auth/calendar',
    message: 'Simulated OAuth Redirect URL Generated'
  });
});

export default router;
