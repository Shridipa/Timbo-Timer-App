import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass px-3 py-2 rounded-xl border border-white/10 text-sm shadow-xl">
        <p className="text-gray-400 mb-1">{label}</p>
        <p className="text-white font-semibold flex items-center">
          <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: payload[0].color || payload[0].payload?.fill || '#3b82f6' }} />
          {payload[0].value} {payload[0].value === 1 ? 'Habit' : 'Habits'} Done
        </p>
      </div>
    );
  }
  return null;
};

const WeeklyPerformanceChart = ({ data, color = "#3b82f6", dataKey = "date" }) => {
  if (!data || data.length === 0) return <div className="text-gray-500 h-full flex items-center justify-center">No data available</div>;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id={`colorGradient-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.4} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
        <XAxis 
          dataKey={dataKey} 
          axisLine={false} 
          tickLine={false} 
          tick={{ fill: '#9ca3af', fontSize: 12 }}
          dy={10}
        />
        <YAxis 
          axisLine={false} 
          tickLine={false} 
          tick={{ fill: '#9ca3af', fontSize: 12 }} 
          allowDecimals={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '4 4' }} />
        <Area 
          type="monotone" 
          dataKey="completions" 
          stroke={color} 
          strokeWidth={3}
          fillOpacity={1} 
          fill={`url(#colorGradient-${color})`} 
          activeDot={{ r: 6, fill: color, stroke: '#1e293b', strokeWidth: 2 }}
          animationDuration={1500}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default WeeklyPerformanceChart;
