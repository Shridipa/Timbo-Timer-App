import Mission from '../models/Mission.js';
import User from '../models/User.js';
import CoachingMemory from '../models/CoachingMemory.js';
import { format, subDays, eachDayOfInterval, parseISO } from 'date-fns';
import mongoose from 'mongoose';

// @desc    Get all high-performance Life OS analytics
// @route   GET /api/analytics
// @access  Private
export const getAnalytics = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);
    const today = new Date();
    
    // 1. Weekly Execution Stats (Last 7 Days)
    const sevenDaysAgo = format(subDays(today, 6), 'yyyy-MM-dd');
    const weeklyMissions = await Mission.find({
      userId,
      date: { $gte: sevenDaysAgo, $lte: format(today, 'yyyy-MM-dd') }
    });

    const last7Days = eachDayOfInterval({ start: subDays(today, 6), end: today }).map(d => format(d, 'yyyy-MM-dd'));
    
    const weeklyData = last7Days.map(date => {
      const dayMissions = weeklyMissions.filter(m => m.date === date);
      const completed = dayMissions.filter(m => m.status === 'completed').length;
      const skipped = dayMissions.filter(m => m.status === 'skipped').length;
      const total = dayMissions.length;

      // Deep work focus hours (convert minutes to hours)
      const focusTimeMinutes = dayMissions.reduce((acc, curr) => acc + (curr.focusTime || 0), 0);
      const focusHours = Number((focusTimeMinutes / 60).toFixed(1));

      return {
        date: format(parseISO(date), 'EEE'), // Mon, Tue, etc.
        fullDate: date,
        completed,
        skipped,
        total,
        focusHours
      };
    });

    // 2. Procrastination Trigger Analysis
    const skipStats = await Mission.aggregate([
      { $match: { userId, status: 'skipped', skipReason: { $ne: 'none' } } },
      { $group: { _id: '$skipReason', count: { $sum: 1 } } }
    ]);

    const presetTriggers = [
      { name: 'burnout', color: '#ef4444' },
      { name: 'emotional_resistance', color: '#f59e0b' },
      { name: 'fear', color: '#8b5cf6' },
      { name: 'avoidance', color: '#3b82f6' },
      { name: 'laziness', color: '#ec4899' },
      { name: 'confusion', color: '#10b981' },
      { name: 'perfectionism', color: '#6366f1' }
    ];

    const procrastinationData = presetTriggers.map(trigger => {
      const found = skipStats.find(s => s._id === trigger.name);
      return {
        name: trigger.name.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()),
        value: found ? found.count : 0,
        fill: trigger.color
      };
    }).filter(t => t.value > 0); // Only return triggers that have occurred

    // Default placeholder if no skipped items yet
    if (procrastinationData.length === 0) {
      procrastinationData.push({ name: 'None Detected Yet', value: 1, fill: '#10b981' });
    }

    // 3. Monthly Trends (Last 30 Days)
    const thirtyDaysAgo = format(subDays(today, 29), 'yyyy-MM-dd');
    const monthlyMissions = await Mission.find({
      userId,
      date: { $gte: thirtyDaysAgo, $lte: format(today, 'yyyy-MM-dd') }
    });

    const last30Days = eachDayOfInterval({ start: subDays(today, 29), end: today }).map(d => format(d, 'yyyy-MM-dd'));
    const monthlyData = last30Days.map(date => {
      const dayMissions = monthlyMissions.filter(m => m.date === date);
      const completed = dayMissions.filter(m => m.status === 'completed').length;
      const total = dayMissions.length;
      const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

      return {
        date: format(parseISO(date), 'MMM dd'),
        completionRate: rate
      };
    });

    // 4. Summarize focus session metrics
    const totalFocusMinutes = weeklyMissions.reduce((acc, curr) => acc + (curr.focusTime || 0), 0);
    const totalInterruptions = weeklyMissions.reduce((acc, curr) => acc + (curr.interruptions || 0), 0);
    
    // Average efficiency
    const activeFocusSessions = weeklyMissions.filter(m => m.focusTime > 0);
    const avgEfficiency = activeFocusSessions.length > 0 
      ? Math.round(activeFocusSessions.reduce((acc, curr) => acc + (curr.efficiency || 0), 0) / activeFocusSessions.length) 
      : 100;

    // Fetch user details for level and momentum
    const user = await User.findById(req.user._id);

    res.status(200).json({
      success: true,
      weekly: weeklyData,
      procrastination: procrastinationData,
      monthly: monthlyData,
      metrics: {
        totalFocusHours: Number((totalFocusMinutes / 60).toFixed(1)),
        totalInterruptions,
        averageEfficiency: avgEfficiency,
        momentumScore: user.momentumScore || 100,
        level: user.level || 1,
        points: user.points || 0
      }
    });
  } catch (error) {
    next(error);
  }
};
