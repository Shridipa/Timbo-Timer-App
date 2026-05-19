import React from 'react';
import { motion } from 'framer-motion';

const Confetti = () => {
  const pieces = Array.from({ length: 40 });
  const colors = ['#3b82f6', '#10b981', '#8b5cf6', '#ef4444', '#f59e0b', '#ec4899'];

  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-50">
      {pieces.map((_, i) => {
        const color = colors[Math.floor(Math.random() * colors.length)];
        const xOffset = (Math.random() - 0.5) * 200; // -100 to 100
        const yOffset = -Math.random() * 200 - 50; // -50 to -250
        const rotation = Math.random() * 360;

        return (
          <motion.div
            key={i}
            initial={{ opacity: 1, x: 0, y: 0, scale: 0 }}
            animate={{ 
              opacity: 0, 
              x: xOffset, 
              y: yOffset,
              rotate: rotation,
              scale: Math.random() + 0.5
            }}
            transition={{ duration: 1.5 + Math.random(), ease: 'easeOut' }}
            className="absolute w-2 h-2 rounded-sm"
            style={{ backgroundColor: color }}
          />
        );
      })}
    </div>
  );
};

export default Confetti;
