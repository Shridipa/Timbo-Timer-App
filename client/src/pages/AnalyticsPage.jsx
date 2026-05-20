import React from "react";
import { motion } from "framer-motion";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Activity, Flame, Gauge, TrendingUp } from "lucide-react";

const focusData = [
  { day: "Mon", hours: 4.5, score: 74 },
  { day: "Tue", hours: 3.2, score: 81 },
  { day: "Wed", hours: 5.1, score: 87 },
  { day: "Thu", hours: 4.1, score: 79 },
  { day: "Fri", hours: 3.4, score: 84 },
  { day: "Sat", hours: 5.8, score: 91 },
  { day: "Sun", hours: 4.9, score: 88 },
];

export default function AnalyticsPage() {
  return (
    <div className="premium-page">
      <section className="product-hero compact">
        <div>
          <span className="soft-label"><Gauge size={14} /> Analytics</span>
          <h1>Progress you can feel, not just measure.</h1>
          <p>Weekly consistency, focus quality, and burnout signals are translated into gentle decisions.</p>
        </div>
        <div className="hero-stat-card">
          <strong>87%</strong>
          <span>Focus quality</span>
          <small>+12% from last week</small>
        </div>
      </section>

      <section className="analytics-grid">
        <motion.article className="product-card chart-card" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
          <div className="card-title-row"><div><span>Focus Time</span><h2>12h 45m</h2></div><TrendingUp size={22} /></div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={focusData}>
              <CartesianGrid stroke="rgba(255,255,255,.06)" vertical={false} />
              <XAxis dataKey="day" stroke="#8daaa1" />
              <YAxis stroke="#8daaa1" />
              <Tooltip contentStyle={{ background: "#0b1512", border: "1px solid rgba(103,247,193,.18)", borderRadius: 16 }} />
              <Bar dataKey="hours" radius={[10, 10, 0, 0]} fill="#67F7C1" />
            </BarChart>
          </ResponsiveContainer>
        </motion.article>

        <motion.article className="product-card chart-card" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
          <div className="card-title-row"><div><span>Consistency</span><h2>6 day streak</h2></div><Flame size={22} /></div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={focusData}>
              <defs><linearGradient id="scoreGlow" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#67F7C1" stopOpacity={0.5}/><stop offset="95%" stopColor="#67F7C1" stopOpacity={0}/></linearGradient></defs>
              <CartesianGrid stroke="rgba(255,255,255,.06)" vertical={false} />
              <XAxis dataKey="day" stroke="#8daaa1" />
              <YAxis stroke="#8daaa1" />
              <Tooltip contentStyle={{ background: "#0b1512", border: "1px solid rgba(103,247,193,.18)", borderRadius: 16 }} />
              <Area type="monotone" dataKey="score" stroke="#67F7C1" fill="url(#scoreGlow)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.article>
      </section>

      <section className="product-grid three">
        {[
          ["Burnout risk", "Low", "Recovery blocks are protecting your pace.", Activity],
          ["Best window", "9-12 AM", "Deep work completes fastest before noon.", TrendingUp],
          ["Recovery score", "91", "You rebound quickly after lighter days.", Gauge],
        ].map(([label, value, text, Icon], index) => (
          <motion.article className="product-card" key={label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
            <Icon size={22} />
            <span>{label}</span>
            <h2>{value}</h2>
            <p>{text}</p>
          </motion.article>
        ))}
      </section>
    </div>
  );
}
