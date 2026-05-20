import React from "react";
import { motion } from "framer-motion";
import { Check, HeartPulse, Moon, Smile, Sunrise } from "lucide-react";

const habits = [
  { name: "Morning focus", streak: 12, done: true, icon: Sunrise },
  { name: "Review notes", streak: 8, done: true, icon: Check },
  { name: "Sleep reset", streak: 5, done: false, icon: Moon },
  { name: "Mood check", streak: 16, done: true, icon: Smile },
];

export default function HabitsPage() {
  return (
    <div className="premium-page">
      <section className="product-hero compact">
        <div>
          <span className="soft-label"><HeartPulse size={14} /> Habits</span>
          <h1>Tiny promises that rebuild trust with yourself.</h1>
          <p>Timbo keeps habits satisfying and lightweight, so consistency feels rewarding instead of heavy.</p>
        </div>
        <div className="hero-stat-card"><strong>91</strong><span>Recovery score</span><small>Sleep and mood are aligned</small></div>
      </section>

      <section className="habit-grid">
        {habits.map(({ name, streak, done, icon: Icon }, index) => (
          <motion.article className={`habit-card ${done ? "done" : ""}`} key={name} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06 }}>
            <div className="habit-check"><Icon size={22} /></div>
            <h2>{name}</h2>
            <p>{streak} day chain</p>
            <div className="habit-chain">{Array.from({ length: 14 }).map((_, i) => <span key={i} className={i < Math.min(streak, 14) ? "lit" : ""} />)}</div>
          </motion.article>
        ))}
      </section>
    </div>
  );
}
