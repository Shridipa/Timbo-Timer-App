import React from "react";
import { motion } from "framer-motion";
import { CalendarDays, Clock3, Leaf, Sparkles, Wand2 } from "lucide-react";

const days = [
  { day: "Mon", mood: "Deep", active: true },
  { day: "Tue", mood: "Light" },
  { day: "Wed", mood: "Build" },
  { day: "Thu", mood: "Review" },
  { day: "Fri", mood: "Soft" },
];

const blocks = [
  { time: "09:00", title: "DSA pattern practice", detail: "Highest-energy block", length: "50m", tone: "deep" },
  { time: "11:10", title: "Recovery walk", detail: "Protect attention", length: "15m", tone: "recovery" },
  { time: "14:00", title: "Concept revision", detail: "Low-friction review", length: "35m", tone: "review" },
  { time: "18:30", title: "Mock prompt warmup", detail: "Optional, gentle finish", length: "25m", tone: "soft" },
];

export default function CalendarPage() {
  return (
    <div className="page-flow calendar-page">
      <section className="screen-heading calendar-heading">
        <span className="soft-label"><CalendarDays size={14} /> Calendar</span>
        <h1>A softer way to see your day.</h1>
        <p>Timbo places hard work where your attention is strongest, then adds recovery so the plan feels possible.</p>
      </section>

      <section className="calendar-studio">
        <div className="calendar-days">
          {days.map((item, index) => (
            <motion.button
              key={item.day}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06 }}
              className={item.active ? "active" : ""}
            >
              <strong>{item.day}</strong>
              <span>{item.mood}</span>
            </motion.button>
          ))}
        </div>

        <div className="calendar-board">
          <div className="calendar-board-head">
            <div>
              <span className="soft-label"><Sparkles size={14} /> Auto-planned</span>
              <h2>Monday flow</h2>
            </div>
            <button className="calendar-magic"><Wand2 size={17} /> Rebalance</button>
          </div>

          <div className="calendar-flow">
            {blocks.map((block, index) => (
              <motion.article
                key={`${block.time}-${block.title}`}
                className={`calendar-block ${block.tone}`}
                initial={{ opacity: 0, x: -18, scale: 0.98 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ delay: 0.12 + index * 0.08, type: "spring", stiffness: 140, damping: 18 }}
              >
                <time>{block.time}</time>
                <div>
                  <h3>{block.title}</h3>
                  <p>{block.detail}</p>
                </div>
                <span>{block.length}</span>
              </motion.article>
            ))}
          </div>
        </div>

        <aside className="calendar-insight calm-panel">
          <span className="soft-label"><Leaf size={14} /> Gentle Logic</span>
          <h2>Timbo moved heavy work earlier.</h2>
          <p>Your evening sessions complete more reliably when they are shorter and framed as review.</p>
          <div className="calendar-mini-stats">
            <div><strong>82%</strong><span>fit score</span></div>
            <div><strong>2.1h</strong><span>planned</span></div>
          </div>
          <div className="recovery-note">No guilt loops. Missed blocks become lighter future sessions.</div>
        </aside>
      </section>
    </div>
  );
}
