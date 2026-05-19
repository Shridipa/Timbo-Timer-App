import Mission from '../models/Mission.js';
import Goal from '../models/Goal.js';
import Roadmap from '../models/Roadmap.js';
import User from '../models/User.js';
import CoachingMemory from '../models/CoachingMemory.js';
import { validateExcuse, analyzeTaskScheduling } from '../services/aiService.js';
import { format, subDays } from 'date-fns';
import CalendarEvent from '../models/CalendarEvent.js';
import AvailabilityProfile from '../models/AvailabilityProfile.js';
import { autoScheduleDailyMissions } from '../services/schedulingEngine.js';
import { syncEventToGoogle } from '../utils/googleCalendarSync.js';

// Helper to calculate momentum score
const updateMomentum = async (userId) => {
  const sevenDaysAgo = format(subDays(new Date(), 7), 'yyyy-MM-dd');
  const todayStr = format(new Date(), 'yyyy-MM-dd');

  const recentMissions = await Mission.find({
    userId,
    date: { $gte: sevenDaysAgo, $lte: todayStr }
  });

  if (recentMissions.length === 0) return 100;

  const completed = recentMissions.filter(m => m.status === 'completed').length;
  const skipped = recentMissions.filter(m => m.status === 'skipped').length;
  const total = recentMissions.length;

  // Formula: (completed / total) * 100
  const momentum = Math.round((completed / total) * 100);
  
  await User.findByIdAndUpdate(userId, { momentumScore: momentum });
  return momentum;
};

// @desc    Get/Generate daily missions
// @route   GET /api/missions?date=YYYY-MM-DD
// @access  Private
export const getDailyMissions = async (req, res, next) => {
  try {
    const dateStr = req.query.date || format(new Date(), 'yyyy-MM-dd');

    // 1. Check if daily missions already exist
    let missions = await Mission.find({ userId: req.user._id, date: dateStr });

    if (missions.length > 0) {
      // Make sure they are integrated in the calendar if no events exist for today
      const startOfDay = new Date(dateStr);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(dateStr);
      endOfDay.setHours(23, 59, 59, 999);

      const existingEvents = await CalendarEvent.findOne({
        userId: req.user._id,
        start: { $gte: startOfDay, $lte: endOfDay }
      });

      if (!existingEvents) {
        await autoScheduleDailyMissions(req.user._id, new Date(dateStr));
      }

      return res.status(200).json({ success: true, date: dateStr, missions });
    }

    // 2. If no missions exist, check if user has an active Goal
    const activeGoal = await Goal.findOne({ userId: req.user._id, active: true });
    if (!activeGoal) {
      return res.status(200).json({ success: true, date: dateStr, missions: [] });
    }

    // 3. Find active Roadmap
    const roadmap = await Roadmap.findOne({ goalId: activeGoal._id });
    if (!roadmap || roadmap.phases.length === 0) {
      return res.status(200).json({ success: true, date: dateStr, missions: [] });
    }

    // 4. Auto-generate daily missions from current pending roadmap phase tasks
    // We pick the first phase that has pending tasks
    const activePhase = roadmap.phases.find(phase => 
      phase.tasks.some(task => task.status !== 'completed')
    ) || roadmap.phases[0];

    const pendingTasks = activePhase.tasks.filter(task => task.status !== 'completed').slice(0, 3);

    // If all tasks are completed, pick any 2 from the last phase for recovery/practice
    const tasksToClone = pendingTasks.length > 0 ? pendingTasks : activePhase.tasks.slice(0, 2);

    const blocks = ['deep_work', 'learning', 'light_work'];
    
    const createdMissions = [];
    for (let i = 0; i < tasksToClone.length; i++) {
      const task = tasksToClone[i];
      const mission = await Mission.create({
        userId: req.user._id,
        goalId: activeGoal._id,
        title: task.title,
        description: task.description || 'Continuous practice from strategic roadmap.',
        whyItMatters: task.whyItMatters || 'Essential stepping stone for roadmap execution.',
        duration: task.duration || 60,
        priority: task.priority || 'medium',
        date: dateStr,
        timeBlock: blocks[i % blocks.length]
      });
      createdMissions.push(mission);
    }

    // Automatically integrate into the calendar as soon as they are assigned!
    await autoScheduleDailyMissions(req.user._id, new Date(dateStr));

    res.status(200).json({
      success: true,
      date: dateStr,
      missions: createdMissions
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle mission status (completed / pending)
// @route   PUT /api/missions/:id/toggle
// @access  Private
export const toggleMission = async (req, res, next) => {
  try {
    const mission = await Mission.findOne({ _id: req.params.id, userId: req.user._id });

    if (!mission) {
      res.status(404);
      throw new Error('Mission not found');
    }

    const wasCompleted = mission.status === 'completed';
    mission.status = wasCompleted ? 'pending' : 'completed';
    mission.skipReason = 'none';
    mission.excuseValidation = '';
    
    await mission.save();

    // Award / deduct XP points (10 XP on check-in)
    const pointsChange = wasCompleted ? -10 : 10;
    const user = await User.findById(req.user._id);
    user.points = Math.max(0, user.points + pointsChange);
    
    // Level Up: 100 XP per level
    const newLevel = Math.floor(user.points / 100) + 1;
    if (newLevel > user.level) {
      user.level = newLevel;
      user.badges.push(`Level ${newLevel} Achiever`);
    }
    
    await user.save();

    // Update active Roadmap task state if it matches a roadmap task name
    const activeGoal = await Goal.findOne({ userId: req.user._id, active: true });
    if (activeGoal) {
      const roadmap = await Roadmap.findOne({ goalId: activeGoal._id });
      if (roadmap) {
        let changed = false;
        roadmap.phases.forEach(phase => {
          phase.tasks.forEach(task => {
            if (task.title.toLowerCase().trim() === mission.title.toLowerCase().trim()) {
              task.status = mission.status === 'completed' ? 'completed' : 'pending';
              changed = true;
            }
          });
        });
        if (changed) await roadmap.save();
      }
    }

    const momentum = await updateMomentum(req.user._id);

    res.status(200).json({
      success: true,
      mission,
      points: user.points,
      level: user.level,
      momentum
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Skip mission with excuse (AI validation)
// @route   PUT /api/missions/:id/skip
// @access  Private
export const skipMission = async (req, res, next) => {
  try {
    const { excuse } = req.body;
    if (!excuse) {
      res.status(400);
      throw new Error('Please provide an excuse to validate execution resistance');
    }

    const mission = await Mission.findOne({ _id: req.params.id, userId: req.user._id });
    if (!mission) {
      res.status(404);
      throw new Error('Mission not found');
    }

    // Call Excuse Validation Engine from AI service
    const activeGoal = await Goal.findOne({ userId: req.user._id, active: true });
    const motivations = activeGoal ? activeGoal.motivations : 'Self-improvement';

    const aiValidation = await validateExcuse(mission.title, excuse, motivations);

    mission.status = 'skipped';
    mission.skipReason = aiValidation.classification;
    mission.excuseValidation = aiValidation.feedback;
    await mission.save();

    // Log the excuse into Coaching Memory
    await CoachingMemory.findOneAndUpdate(
      { userId: req.user._id },
      {
        $push: {
          excusesLog: {
            excuse,
            classification: aiValidation.classification,
            isValid: aiValidation.isValid
          }
        }
      },
      { upsert: true, new: true }
    );

    const momentum = await updateMomentum(req.user._id);

    res.status(200).json({
      success: true,
      mission,
      momentum,
      aiFeedback: aiValidation.feedback
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Log Pomodoro deep work metrics
// @route   PUT /api/missions/:id/focus
// @access  Private
export const logFocusSession = async (req, res, next) => {
  try {
    const { focusTime, interruptions } = req.body;

    if (focusTime === undefined || interruptions === undefined) {
      res.status(400);
      throw new Error('Please include focusTime (minutes) and interruptions');
    }

    const mission = await Mission.findOne({ _id: req.params.id, userId: req.user._id });
    if (!mission) {
      res.status(404);
      throw new Error('Mission not found');
    }

    mission.focusTime += Number(focusTime);
    mission.interruptions += Number(interruptions);
    
    // Calculate efficiency: (focusTime / duration) * 100
    mission.efficiency = Math.min(100, Math.round((mission.focusTime / mission.duration) * 100));
    await mission.save();

    res.status(200).json({
      success: true,
      mission
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Analyze task scheduling with AI cognitive coach
// @route   POST /api/missions/ai-schedule-analysis
// @access  Private
export const analyzeTaskSchedule = async (req, res, next) => {
  try {
    const profile = await AvailabilityProfile.findOne({ userId: req.user._id });
    const existingEvents = await CalendarEvent.find({ 
      userId: req.user._id, 
      start: { $gte: new Date() } 
    }).sort({ start: 1 });
    const skippedMissions = await Mission.find({ 
      userId: req.user._id, 
      status: 'skipped' 
    }).sort({ createdAt: -1 }).limit(5);

    const aiAnalysis = await analyzeTaskScheduling(req.body, profile || {}, existingEvents, skippedMissions);

    res.status(200).json({
      success: true,
      aiAnalysis
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Intelligently schedule task into Calendar and Mission
// @route   POST /api/missions/schedule
// @access  Private
export const scheduleIntelligentTask = async (req, res, next) => {
  try {
    const { 
      title, description, duration, priority, timeBlock, 
      mentalWeight, executionMode, stressLevel, startTime, 
      endTime, label, color, splitIntoTwo, wantsBreaks 
    } = req.body;

    if (!title || !startTime || !endTime) {
      res.status(400);
      throw new Error('Please provide title, start time, and end time');
    }

    const activeGoal = await Goal.findOne({ userId: req.user._id, active: true });
    const dateStr = format(new Date(startTime), 'yyyy-MM-dd');
    const createdMissions = [];
    const createdEvents = [];

    // Map label to CalendarEvent type enum: ['deep_work', 'learning', 'revision', 'routine', 'recovery', 'break']
    let eventType = 'learning';
    const lowerLabel = (label || '').toLowerCase();
    if (lowerLabel.includes('deep work')) eventType = 'deep_work';
    else if (lowerLabel.includes('revision')) eventType = 'revision';
    else if (lowerLabel.includes('recovery')) eventType = 'recovery';
    else if (lowerLabel.includes('sprint')) eventType = 'deep_work';

    if (splitIntoTwo) {
      const halfDuration = Math.round((duration || 60) / 2);
      const start1 = new Date(startTime);
      const end1 = new Date(start1.getTime() + halfDuration * 60000);

      // Create Mission 1
      const m1 = await Mission.create({
        userId: req.user._id,
        goalId: activeGoal ? activeGoal._id : null,
        title: `${title} (Part 1)`,
        description: description || `Cognitively split session. Label: ${label}`,
        whyItMatters: `Optimized for ${stressLevel} stress level in ${executionMode} mode.`,
        duration: halfDuration,
        priority: priority || 'medium',
        date: dateStr,
        timeBlock: timeBlock || 'deep_work'
      });
      createdMissions.push(m1);

      // Create Event 1
      const ev1 = await CalendarEvent.create({
        userId: req.user._id,
        missionId: m1._id,
        title: m1.title,
        description: `[${label}] ${description || ''} (Mental Weight: ${mentalWeight})`,
        start: start1,
        end: end1,
        type: eventType,
        intensity: priority || 'medium',
        color: color || '#8b5cf6',
        status: 'scheduled'
      });
      createdEvents.push(ev1);
      await syncEventToGoogle(ev1);

      // Create Mission 2 & Event 2 scheduled 2 hours later or next day
      const start2 = new Date(end1.getTime() + 2 * 3600000); // 2 hours later
      const end2 = new Date(start2.getTime() + halfDuration * 60000);
      const dateStr2 = format(start2, 'yyyy-MM-dd');

      const m2 = await Mission.create({
        userId: req.user._id,
        goalId: activeGoal ? activeGoal._id : null,
        title: `${title} (Part 2)`,
        description: description || `Cognitively split session. Label: ${label}`,
        whyItMatters: `Optimized for ${stressLevel} stress level in ${executionMode} mode.`,
        duration: halfDuration,
        priority: priority || 'medium',
        date: dateStr2,
        timeBlock: timeBlock || 'deep_work'
      });
      createdMissions.push(m2);

      const ev2 = await CalendarEvent.create({
        userId: req.user._id,
        missionId: m2._id,
        title: m2.title,
        description: `[${label}] ${description || ''} (Mental Weight: ${mentalWeight})`,
        start: start2,
        end: end2,
        type: eventType,
        intensity: priority || 'medium',
        color: color || '#8b5cf6',
        status: 'scheduled'
      });
      createdEvents.push(ev2);
      await syncEventToGoogle(ev2);

    } else {
      // Single Mission & Event
      const m = await Mission.create({
        userId: req.user._id,
        goalId: activeGoal ? activeGoal._id : null,
        title,
        description: description || `Cognitive session. Label: ${label}`,
        whyItMatters: `Optimized for ${stressLevel} stress level in ${executionMode} mode.`,
        duration: duration || 60,
        priority: priority || 'medium',
        date: dateStr,
        timeBlock: timeBlock || 'deep_work'
      });
      createdMissions.push(m);

      const ev = await CalendarEvent.create({
        userId: req.user._id,
        missionId: m._id,
        title,
        description: `[${label}] ${description || ''} (Mental Weight: ${mentalWeight})`,
        start: new Date(startTime),
        end: new Date(endTime),
        type: eventType,
        intensity: priority || 'medium',
        color: color || '#8b5cf6',
        status: 'scheduled'
      });
      createdEvents.push(ev);
      await syncEventToGoogle(ev);

      // If wantsBreaks, add recovery buffer
      if (wantsBreaks) {
        const breakStart = new Date(endTime);
        const breakEnd = new Date(breakStart.getTime() + 15 * 60000); // 15 min buffer
        const breakEv = await CalendarEvent.create({
          userId: req.user._id,
          title: `Cognitive Buffer (${title})`,
          description: 'Rest eyes, stretch, and allow focus neural networks to recharge.',
          start: breakStart,
          end: breakEnd,
          type: 'break',
          intensity: 'low',
          color: '#10b981',
          status: 'scheduled'
        });
        createdEvents.push(breakEv);
        await syncEventToGoogle(breakEv);
      }
    }

    res.status(201).json({
      success: true,
      message: 'Task intelligently placed into optimal calendar slot!',
      missions: createdMissions,
      events: createdEvents
    });
  } catch (error) {
    next(error);
  }
};
