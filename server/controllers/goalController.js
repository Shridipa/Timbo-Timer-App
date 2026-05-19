import Goal from '../models/Goal.js';
import Roadmap from '../models/Roadmap.js';
import User from '../models/User.js';
import CoachingMemory from '../models/CoachingMemory.js';
import { analyzeGoal, generateRoadmap } from '../services/aiService.js';

// @desc    Onboard user & create Goal + AI Roadmap
// @route   POST /api/goals
// @access  Private
export const createGoal = async (req, res, next) => {
  try {
    const { title, deadline, targetHours, commitments, stressLevel, currentLevel, motivations, distractions } = req.body;

    if (!title || !deadline || !targetHours) {
      res.status(400);
      throw new Error('Please fill in all required fields (Goal, Deadline, and Available Hours)');
    }

    // Set any previous goals of this user to active: false
    await Goal.updateMany({ userId: req.user._id }, { active: false });

    // 1. Create Goal with temporary "analyzing" status
    const goal = await Goal.create({
      userId: req.user._id,
      title,
      deadline: new Date(deadline),
      targetHours: Number(targetHours),
      commitments,
      stressLevel,
      currentLevel,
      motivations,
      distractions,
      status: 'analyzing'
    });

    // Update User psychological profile info
    await User.findByIdAndUpdate(req.user._id, {
      psychologyProfile: {
        motivations,
        distractions,
        stressLevel,
        currentCommitments: commitments,
        peakProductivityHour: 'Morning' // default, can be customized
      }
    });

    // Initialize or update Coaching Memory with motivations
    await CoachingMemory.findOneAndUpdate(
      { userId: req.user._id },
      { $addToSet: { motivations: motivations } },
      { upsert: true, new: true }
    );

    // 2. Perform AI Analysis on the Goal using Gemini
    const analysisResult = await analyzeGoal(goal);
    goal.analysis = analysisResult;
    goal.status = 'active';
    await goal.save();

    // 3. Generate Roadmap from AI analysis
    const roadmapResult = await generateRoadmap(goal, analysisResult);
    const roadmap = await Roadmap.create({
      goalId: goal._id,
      userId: req.user._id,
      phases: roadmapResult.phases
    });

    res.status(201).json({
      success: true,
      goal,
      roadmap
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get active Goal + Strategic Roadmap
// @route   GET /api/goals/active
// @access  Private
export const getActiveGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findOne({ userId: req.user._id, active: true });
    
    if (!goal) {
      return res.status(200).json({ success: true, goal: null, roadmap: null });
    }

    const roadmap = await Roadmap.findOne({ goalId: goal._id });

    res.status(200).json({
      success: true,
      goal,
      roadmap
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Complete current active goal
// @route   PUT /api/goals/active/complete
// @access  Private
export const completeGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findOneAndUpdate(
      { userId: req.user._id, active: true },
      { status: 'completed', active: false },
      { new: true }
    );

    if (!goal) {
      res.status(404);
      throw new Error('No active goal found to complete');
    }

    res.status(200).json({
      success: true,
      message: 'Goal completed successfully!',
      goal
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset current active goal (archive it)
// @route   DELETE /api/goals/active
// @access  Private
export const resetGoal = async (req, res, next) => {
  try {
    await Goal.updateMany({ userId: req.user._id }, { active: false });
    res.status(200).json({
      success: true,
      message: 'Active strategy reset successfully'
    });
  } catch (error) {
    next(error);
  }
};
