import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { subDays, format, getDay } from 'date-fns';
import { getHeatmap } from '../../api/logs';
import { Loader2 } from 'lucide-react';

const Heatmap = () => {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHeatmap = async () => {
      try {
        const res = await getHeatmap();
        const countMap = {};
        res.forEach(item => { countMap[item.date] = item.count; });
        setData(countMap);
      } catch (error) {
        console.error('Failed to load heatmap data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHeatmap();
  }, []);

  if (loading) {
    return <div className="h-full w-full flex items-center justify-center min-h-[200px]"><Loader2 className="w-6 h-6 animate-spin text-gray-500" /></div>;
  }

  // Generate last 90 days
  const today = new Date();
  const days = [];
  for (let i = 89; i >= 0; i--) {
    days.push(subDays(today, i));
  }

  const startDate = days[0];
  const startDayOfWeek = getDay(startDate); // 0 = Sunday

  const placeholders = Array.from({ length: startDayOfWeek }).map((_, i) => (
    <div key={`empty-${i}`} className="w-4 h-4" />
  ));

  const getColor = (count) => {
    if (!count || count === 0) return 'bg-white/5 border border-white/10';
    if (count === 1) return 'bg-primary/40 border border-primary/20';
    if (count === 2) return 'bg-primary/60 border border-primary/40';
    if (count === 3) return 'bg-primary/80 border border-primary/60';
    return 'bg-primary border border-blue-400 text-white'; // 4+
  };

  return (
    <div className="w-full flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white">90-Day Activity</h3>
        <div className="flex items-center space-x-2 text-xs text-gray-400">
          <span>Less</span>
          <div className="flex space-x-1">
            <div className="w-3 h-3 rounded-sm bg-white/5 border border-white/10" />
            <div className="w-3 h-3 rounded-sm bg-primary/40 border border-primary/20" />
            <div className="w-3 h-3 rounded-sm bg-primary/60 border border-primary/40" />
            <div className="w-3 h-3 rounded-sm bg-primary/80 border border-primary/60" />
            <div className="w-3 h-3 rounded-sm bg-primary border border-blue-400" />
          </div>
          <span>More</span>
        </div>
      </div>

      <div className="flex-1 flex items-end justify-start overflow-x-auto hide-scrollbar pb-2">
        <div className="grid grid-flow-col gap-1.5" style={{ gridTemplateRows: 'repeat(7, minmax(0, 1fr))' }}>
          {placeholders}
          {days.map((date, i) => {
            const dateStr = format(date, 'yyyy-MM-dd');
            const count = data[dateStr] || 0;
            
            return (
              <motion.div
                key={dateStr}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.005 }}
                className={`w-4 h-4 rounded-sm transition-all duration-200 relative group cursor-pointer hover:ring-2 hover:ring-white/50 ${getColor(count)}`}
              >
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-xs text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-xl border border-white/10">
                  {count} {count === 1 ? 'habit' : 'habits'} on {format(date, 'MMM d, yyyy')}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Heatmap;
