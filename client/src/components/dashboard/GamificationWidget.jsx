import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Target, Zap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getMe } from '../../api/auth';

const GamificationWidget = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ points: user?.points || 0, level: user?.level || 1, badges: user?.badges || [] });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getMe();
        setStats({ points: data.points || 0, level: data.level || 1, badges: data.badges || [] });
      } catch (e) {
        console.error(e);
      }
    };
    fetchStats();

    const handleUserUpdate = (e) => {
      if (e.detail) {
        setStats(prev => ({ ...prev, points: e.detail.points, level: e.detail.level }));
      }
    };

    window.addEventListener('user-updated', handleUserUpdate);
    return () => window.removeEventListener('user-updated', handleUserUpdate);
  }, []);

  const currentLevelPoints = stats.points % 100;
  const progressPercent = currentLevelPoints; // 100 XP per level

  const defaultBadges = [
    { id: 'first_step', icon: Star, name: 'First Step', color: 'text-yellow-400', bg: 'bg-yellow-400/20' },
    { id: 'consistent', icon: Zap, name: 'Consistency', color: 'text-blue-400', bg: 'bg-blue-400/20' },
    { id: 'master', icon: Target, name: 'Mastery', color: 'text-purple-400', bg: 'bg-purple-400/20' },
  ];

  return (
    <div className="glass p-6 rounded-2xl border border-white/5 space-y-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 blur-2xl -mt-10 -mr-10 rounded-full pointer-events-none" />
      
      <div className="flex justify-between items-center relative z-10">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <Trophy className="w-5 h-5 mr-2 text-yellow-400" />
          Level {stats.level}
        </h3>
        <span className="text-primary font-bold">{stats.points} XP</span>
      </div>

      <div className="space-y-2 relative z-10">
        <div className="flex justify-between text-xs text-gray-400 font-medium">
          <span>{currentLevelPoints} XP</span>
          <span>100 XP</span>
        </div>
        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-yellow-400 to-orange-500"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
        <p className="text-xs text-gray-500 text-center pt-1">{100 - currentLevelPoints} XP to next level</p>
      </div>

      <div className="pt-4 border-t border-white/5 relative z-10">
        <h4 className="text-sm font-medium text-gray-300 mb-4">Earned Badges</h4>
        <div className="flex space-x-3">
          {defaultBadges.map((badge, i) => {
            // Simulated unlocking mechanics based on level
            const isUnlocked = i === 0 ? true : stats.level >= (i + 1) * 2; 
            const Icon = badge.icon;
            
            return (
              <motion.div 
                key={badge.id}
                whileHover={{ scale: 1.1, y: -2 }}
                className={`relative flex flex-col items-center p-2.5 rounded-xl border cursor-pointer ${isUnlocked ? `border-white/10 ${badge.bg}` : 'border-white/5 bg-white/5 opacity-50 grayscale'}`}
                title={badge.name}
              >
                <Icon className={`w-5 h-5 ${isUnlocked ? badge.color : 'text-gray-500'}`} />
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default GamificationWidget;
