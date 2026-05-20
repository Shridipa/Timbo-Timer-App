import AvailabilityProfile from '../models/AvailabilityProfile.js';
import CalendarEvent from '../models/CalendarEvent.js';
import RoutineTemplate from '../models/RoutineTemplate.js';
import Mission from '../models/Mission.js';
import Goal from '../models/Goal.js';
import { syncEventToGoogle } from '../utils/googleCalendarSync.js';

/**
 * Parses a time string like "09:00 - 12:00" into start and end hours
 */
const parseTimeWindow = (timeStr) => {
  if (!timeStr || !timeStr.includes('-')) return { startHour: 9, endHour: 17 };
  const parts = timeStr.split('-');
  const startHour = parseInt(parts[0].trim().split(':')[0]);
  const endHour = parseInt(parts[1].trim().split(':')[0]);
  return { startHour, endHour };
};

/**
 * Rule-based adaptive scheduler.
 * Automatically populates the calendar with deep work, revision, breaks, and reflection without requiring LLM calls.
 */
export const autoScheduleDailyMissions = async (userId, targetDate = new Date()) => {
  try {
    // 1. Fetch user strategic goal and availability profile
    const goal = await Goal.findOne({ userId, active: true });
    if (!goal) return { success: false, message: 'No active strategic goal found' };

    let profile = await AvailabilityProfile.findOne({ userId });
    if (!profile) {
      // Create a default profile if none exists
      profile = await AvailabilityProfile.create({ userId });
    }

    // 2. Fetch pending daily missions for this user
    const pendingMissions = await Mission.find({ 
      userId, 
      status: 'pending',
      date: {
        $gte: new Date(targetDate.setHours(0, 0, 0, 0)),
        $lte: new Date(targetDate.setHours(23, 59, 59, 999))
      }
    });

    // Clear any existing auto-generated calendar events for this day to avoid duplicates
    await CalendarEvent.deleteMany({
      userId,
      start: {
        $gte: new Date(targetDate.setHours(0, 0, 0, 0)),
        $lte: new Date(targetDate.setHours(23, 59, 59, 999))
      },
      status: 'scheduled' // only clear unexecuted/future events
    });

    // 3. Map availability hours based on day (weekday vs weekend)
    const isWeekend = targetDate.getDay() === 0 || targetDate.getDay() === 6;
    const windowStr = isWeekend ? profile.weekendSchedule : profile.eveningAvailable; // default fallback
    const { startHour: eveningStart, endHour: eveningEnd } = parseTimeWindow(profile.eveningAvailable);
    const { startHour: morningStart, endHour: morningEnd } = parseTimeWindow(profile.morningAvailable);
    const { startHour: afternoonStart, endHour: afternoonEnd } = parseTimeWindow(profile.afternoonAvailable);

    // Create a time allocation roadmap
    const availableSlots = [];
    const peakHour = parseInt(profile.peakHour.split(':')[0]) || 10;

    // Morning Block
    for (let h = morningStart; h < morningEnd; h++) availableSlots.push({ hour: h, period: 'morning' });
    // Afternoon Block
    for (let h = afternoonStart; h < afternoonEnd; h++) availableSlots.push({ hour: h, period: 'afternoon' });
    // Evening Block
    for (let h = eveningStart; h < eveningEnd; h++) availableSlots.push({ hour: h, period: 'evening' });

    let currentSlotIndex = 0;
    const generatedEvents = [];

    // 4. Distribute and schedule missions
    for (const mission of pendingMissions) {
      if (currentSlotIndex >= availableSlots.length) break; // Out of capacity

      const slot = availableSlots[currentSlotIndex];
      const start = new Date(targetDate);
      start.setHours(slot.hour, 0, 0, 0);

      // Duration: default to mission focus time or preferred session duration
      const duration = mission.duration || profile.preferredDuration;
      const end = new Date(start);
      end.setMinutes(start.getMinutes() + duration);

      // Determine task types and styling based on intensity/priority
      const isPeak = Math.abs(slot.hour - peakHour) <= 2;
      const type = mission.priority === 'high' && isPeak ? 'deep_work' : 'learning';
      const color = type === 'deep_work' ? '#8b5cf6' : '#3b82f6'; // purple vs blue

      const event = await CalendarEvent.create({
        userId,
        missionId: mission._id,
        title: mission.title,
        description: mission.description || `Timbo scheduled objective for ${goal.title}`,
        start,
        end,
        type,
        intensity: mission.priority,
        color,
        status: 'scheduled'
      });

      generatedEvents.push(event);
      await syncEventToGoogle(event);

      // Automatically Insert Break / Buffer Immediately Following Deep Work
      const breakStart = new Date(end);
      const breakEnd = new Date(breakStart);
      breakEnd.setMinutes(breakStart.getMinutes() + profile.preferredBreak);

      const breakEvent = await CalendarEvent.create({
        userId,
        title: 'Cognitive Recovery Buffer',
        description: 'Rest eyes, stretch, and allow focus neural networks to recharge.',
        start: breakStart,
        end: breakEnd,
        type: 'break',
        intensity: 'low',
        color: '#10b981', // green break
        status: 'scheduled'
      });

      generatedEvents.push(breakEvent);
      await syncEventToGoogle(breakEvent);

      // Advance scheduler slots
      const hoursConsumed = Math.ceil((duration + profile.preferredBreak) / 60);
      currentSlotIndex += hoursConsumed;
    }

    // 5. Inject Recurring Bedtime Reflection Routine
    const sleepHour = parseInt(profile.sleepStart.split(':')[0]) || 23;
    const reflectionStart = new Date(targetDate);
    reflectionStart.setHours(sleepHour - 1, 40, 0, 0); // 20 mins before bedtime
    const reflectionEnd = new Date(targetDate);
    reflectionEnd.setHours(sleepHour - 1, 59, 0, 0);

    const reflectionEvent = await CalendarEvent.create({
      userId,
      title: 'Daily Reflection & Bedtime Review',
      description: 'Review victories, struggles, and strategic energy levels for optimal sleep hygiene.',
      start: reflectionStart,
      end: reflectionEnd,
      type: 'routine',
      intensity: 'low',
      color: '#ec4899', // pink routine
      status: 'scheduled'
    });

    generatedEvents.push(reflectionEvent);
    await syncEventToGoogle(reflectionEvent);

    return {
      success: true,
      eventsCount: generatedEvents.length,
      events: generatedEvents
    };
  } catch (error) {
    console.error('AI Auto-Scheduler Error:', error);
    throw error;
  }
};
