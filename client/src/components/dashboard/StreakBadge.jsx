import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Flame, Star, Trophy, Award } from 'lucide-react';
import Confetti from './Confetti';

const StreakBadge = ({ streak }) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [prevStreak, setPrevStreak] = useState(streak);

  useEffect(() => {
    if (streak > prevStreak && [7, 30, 100].includes(streak)) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
    }
    setPrevStreak(streak);
  }, [streak]);

  let Icon = Flame;
  let color = 'text-gray-400';
  let bg = 'bg-gray-500/10';

  if (streak >= 100) { Icon = Trophy; color = 'text-yellow-400'; bg = 'bg-yellow-500/20'; }
  else if (streak >= 30) { Icon = Award; color = 'text-purple-400'; bg = 'bg-purple-500/20'; }
  else if (streak >= 7) { Icon = Star; color = 'text-blue-400'; bg = 'bg-blue-500/20'; }
  else if (streak > 0) { Icon = Flame; color = 'text-orange-500'; bg = 'bg-orange-500/20'; }

  return (
    <div className="relative inline-flex items-center">
      {showConfetti && <Confetti />}
      <motion.div 
        whileHover={{ scale: 1.05 }}
        className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full ${bg} border border-white/5 transition-colors`}
      >
        <Icon className={`w-3.5 h-3.5 ${color}`} />
        <motion.span 
          key={streak}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`text-xs font-bold ${color}`}
        >
          {streak} {streak === 1 ? 'Day' : 'Days'}
        </motion.span>
      </motion.div>
    </div>
  );
};

export default StreakBadge;
