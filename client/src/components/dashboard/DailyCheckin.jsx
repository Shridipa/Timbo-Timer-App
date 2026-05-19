import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Plus, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { fetchHabits } from '../../api/habits';
import { getDailyLogs, toggleLog } from '../../api/logs';
import { Link } from 'react-router-dom';

const DailyCheckin = () => {
  const [habits, setHabits] = useState([]);
  const [logs, setLogs] = useState({}); // Mapping habitId -> log info
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(null); // habitId currently being toggled
  
  const todayStr = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [habitsData, logsData] = await Promise.all([
          fetchHabits(), // Fetch all active habits
          getDailyLogs(todayStr)
        ]);

        setHabits(habitsData);

        const logsMap = {};
        logsData.forEach(log => {
          if (log.completed) logsMap[log.habitId] = log;
        });
        setLogs(logsMap);
      } catch (error) {
        console.error('Failed to load daily check-in data', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [todayStr]);

  const handleToggle = async (habitId) => {
    if (toggling === habitId) return; // Prevent double click
    setToggling(habitId);
    
    // Optimistic UI update
    const isCompleted = !!logs[habitId];
    setLogs(prev => {
      const newLogs = { ...prev };
      if (isCompleted) {
        delete newLogs[habitId];
      } else {
        newLogs[habitId] = { habitId, date: todayStr, completed: true };
      }
      return newLogs;
    });

    try {
      const res = await toggleLog(habitId, todayStr);
      window.dispatchEvent(new CustomEvent('user-updated', { detail: { points: res.points, level: res.level } }));
    } catch (error) {
      // Revert on error
      setLogs(prev => {
        const newLogs = { ...prev };
        if (isCompleted) {
            newLogs[habitId] = { habitId, date: todayStr, completed: true };
        } else {
            delete newLogs[habitId];
        }
        return newLogs;
      });
    } finally {
      setToggling(null);
    }
  };

  const completedCount = Object.keys(logs).length;
  const totalCount = habits.length;
  const progress = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  if (loading) {
    return <div className="p-6 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-gray-500" /></div>;
  }

  return (
    <div className="glass p-6 rounded-2xl border border-white/5">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white">Today's Habits</h3>
        <span className="text-sm text-gray-400">{completedCount}/{totalCount} Completed</span>
      </div>

      {/* Progress Bar */}
      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden mb-6">
        <motion.div 
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>

      <div className="space-y-3">
        {habits.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            <p className="text-sm mb-2">No habits tracked today.</p>
            <Link to="/habits" className="text-primary hover:text-blue-400 inline-flex items-center space-x-1 text-sm font-medium transition-colors">
              <Plus className="w-4 h-4" />
              <span>Create your first habit</span>
            </Link>
          </div>
        ) : (
          habits.map((habit) => {
            const isCompleted = !!logs[habit._id];
            
            return (
              <motion.div 
                key={habit._id} 
                className={`flex items-center p-3 rounded-xl transition-all cursor-pointer select-none border ${
                  isCompleted ? 'bg-primary/10 border-primary/20' : 'hover:bg-white/5 border-transparent'
                }`}
                onClick={() => handleToggle(habit._id)}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
              >
                <div 
                  className={`w-6 h-6 rounded-md flex items-center justify-center mr-4 transition-colors ${
                    isCompleted ? 'bg-primary text-white' : 'border border-gray-500 text-transparent'
                  }`}
                  style={isCompleted && habit.color ? { backgroundColor: habit.color, borderColor: habit.color } : {}}
                >
                  <Check className="w-4 h-4" strokeWidth={3} />
                </div>
                
                <span className={`flex-1 transition-colors font-medium ${
                  isCompleted ? 'text-white' : 'text-gray-300'
                }`}>
                  {habit.title}
                </span>

                {isCompleted && (
                  <motion.span 
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-xs px-2 py-1 bg-white/10 rounded-md text-gray-300 ml-2"
                  >
                    Done
                  </motion.span>
                )}
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default DailyCheckin;
