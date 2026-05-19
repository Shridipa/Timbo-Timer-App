import MorningBrief from '../models/MorningBrief.js';
import DailyReview from '../models/DailyReview.js';
import Goal from '../models/Goal.js';
import Roadmap from '../models/Roadmap.js';
import Mission from '../models/Mission.js';
import CoachingMemory from '../models/CoachingMemory.js';
import { generateMorningBriefing, generateDailyReviewInsight, chatWithCoach } from '../services/aiService.js';
import { format } from 'date-fns';

// @desc    Get/Generate daily morning briefing
// @route   GET /api/coaching/brief
// @access  Private
export const getMorningBrief = async (req, res, next) => {
  try {
    const todayStr = format(new Date(), 'yyyy-MM-dd');

    // 1. Check if morning brief already exists
    let brief = await MorningBrief.findOne({ userId: req.user._id, date: todayStr });
    if (brief) {
      return res.status(200).json({ success: true, brief });
    }

    // 2. Fetch active Goal, Roadmap, and today's Missions
    const activeGoal = await Goal.findOne({ userId: req.user._id, active: true });
    if (!activeGoal) {
      return res.status(200).json({ success: true, brief: null });
    }

    const roadmap = await Roadmap.findOne({ goalId: activeGoal._id });
    const todayMissions = await Mission.find({ userId: req.user._id, date: todayStr });

    const currentPhase = roadmap && roadmap.phases.length > 0 
      ? roadmap.phases[0].title 
      : 'Core Foundation';

    // 3. Generate new Briefing
    const aiBrief = await generateMorningBriefing(
      activeGoal.title,
      currentPhase,
      todayMissions.map(m => m.title),
      activeGoal.motivations
    );

    brief = await MorningBrief.create({
      userId: req.user._id,
      date: todayStr,
      motivation: aiBrief.motivation,
      brief: aiBrief.brief
    });

    res.status(201).json({
      success: true,
      brief
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit daily bedtime review
// @route   POST /api/coaching/review
// @access  Private
export const submitDailyReview = async (req, res, next) => {
  try {
    const { win, struggle, energyLevel, distractionLevel, reflection } = req.body;
    const todayStr = format(new Date(), 'yyyy-MM-dd');

    if (!win || !struggle || !energyLevel || !distractionLevel) {
      res.status(400);
      throw new Error('Please fill in all bedtime reflection parameters');
    }

    // Fetch today's completed missions
    const todayMissions = await Mission.find({ userId: req.user._id, date: todayStr });
    const completed = todayMissions.filter(m => m.status === 'completed').map(m => m.title);

    // Call AI to generate CBT reflections and schedule calibrations
    const aiInsights = await generateDailyReviewInsight(
      win,
      struggle,
      Number(energyLevel),
      Number(distractionLevel),
      completed
    );

    // Save Daily Bedtime Review
    const dailyReview = await DailyReview.findOneAndUpdate(
      { userId: req.user._id, date: todayStr },
      {
        win,
        struggle,
        energyLevel: Number(energyLevel),
        distractionLevel: Number(distractionLevel),
        reflection,
        insights: aiInsights
      },
      { upsert: true, new: true }
    );

    // Update user points with a bonus (20 XP for doing daily review!)
    await req.user.updateOne({ $inc: { points: 20 } });

    res.status(201).json({
      success: true,
      dailyReview
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get today's daily review
// @route   GET /api/coaching/review
// @access  Private
export const getTodayReview = async (req, res, next) => {
  try {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const review = await DailyReview.findOne({ userId: req.user._id, date: todayStr });
    res.status(200).json({ success: true, review });
  } catch (error) {
    next(error);
  }
};

// @desc    Contextual Chat with AI Strategist
// @route   POST /api/coaching/chat
// @access  Private
export const chatStrategy = async (req, res, next) => {
  try {
    const { message, chatHistory } = req.body;

    if (!message) {
      res.status(400);
      throw new Error('Please write a message');
    }

    // Fetch user details, active goal, roadmap, and excuses log history
    const activeGoal = await Goal.findOne({ userId: req.user._id, active: true });
    const roadmap = await Roadmap.findOne({ goalId: activeGoal?._id });
    const memory = await CoachingMemory.findOne({ userId: req.user._id });

    const currentPhase = roadmap && roadmap.phases.length > 0 
      ? roadmap.phases[0].title 
      : 'Core Foundation';

    const userContext = {
      goalTitle: activeGoal ? activeGoal.title : 'Self-improvement',
      goalDeadline: activeGoal ? activeGoal.deadline : 'Continuous',
      currentPhase,
      peakProductivityHour: req.user.psychologyProfile?.peakProductivityHour || 'Morning',
      distractions: req.user.psychologyProfile?.distractions || 'General',
      motivations: activeGoal ? activeGoal.motivations : 'Growth',
      history: memory ? {
        excusesCount: memory.excusesLog.length,
        excusesSummary: memory.excusesLog.slice(-5).map(e => e.excuse),
        confidenceLevel: memory.confidenceLevel,
        consistencyScore: memory.consistencyScore
      } : {}
    };

    const reply = await chatWithCoach(chatHistory || [], message, userContext);

    res.status(200).json({
      success: true,
      reply
    });
  } catch (error) {
    next(error);
  }
};
