import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, CalendarClock, Flame, HeartPulse, Sparkles, Target, TimerReset } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getAdaptiveState } from "../lib/adaptiveEngine";

const Ring = ({ label, value, tone = "var(--primary)" }) => (
  <div className="metric-ring">
    <svg viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="42" />
      <motion.circle cx="50" cy="50" r="42" initial={{ pathLength: 0 }} animate={{ pathLength: value / 100 }} transition={{ duration: 0.9, ease: "easeOut" }} style={{ stroke: tone }} />
    </svg>
    <strong>{value}%</strong>
    <span>{label}</span>
  </div>
);

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const state = getAdaptiveState(user);

  return (
    <div className="page-flow">
      <section className="hero-mission">
        <div>
          <div className="soft-label"><Sparkles size={14} /> Today</div>
          <h1>{state.mission.title}</h1>
          <p>{state.mission.why}</p>
          <div className="mission-meta">
            <span><Target size={16} /> {state.mission.priority}</span>
            <span><CalendarClock size={16} /> {state.mission.eta}</span>
          </div>
        </div>
        <div className="mission-progress">
          <strong>{state.mission.progress}%</strong>
          <span>Roadmap warmth</span>
          <button onClick={() => navigate("/focus")}>Start focus <ArrowRight size={16} /></button>
        </div>
      </section>

      <section className="section-grid two">
        <div className="calm-panel">
          <div className="panel-heading">
            <div><span className="soft-label">Smart Timeline</span><h2>Scheduled around your energy</h2></div>
            <TimerReset size={22} />
          </div>
          <div className="timeline-list">
            {state.timeline.map((item, index) => (
              <motion.div key={`${item.time}-${item.title}`} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.08 }} className="timeline-item">
                <time>{item.time}</time>
                <div><strong>{item.title}</strong><span>{item.length} min - {item.priority}</span></div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="calm-panel">
          <div className="panel-heading">
            <div><span className="soft-label">Momentum</span><h2>{state.momentum.rank}</h2></div>
            <Flame size={22} />
          </div>
          <div className="ring-grid">
            <Ring label="Momentum" value={state.momentum.score} />
            <Ring label="Consistency" value={state.momentum.consistency} tone="#10b981" />
            <Ring label="Focus" value={state.momentum.focusQuality} tone="#f59e0b" />
          </div>
          <div className="micro-stats"><span>{state.momentum.streak} day streak</span><span>{state.momentum.points} XP</span></div>
        </div>
      </section>

      <section className="calm-panel insight-panel">
        <div className="panel-heading">
          <div><span className="soft-label">Adaptive Insight</span><h2>Timbo noticed a pattern</h2></div>
          <HeartPulse size={22} />
        </div>
        <div className="insight-strip">{state.insights.map((insight) => <span key={insight}>{insight}</span>)}</div>
        <div className="recovery-note">{state.recovery}</div>
      </section>
    </div>
  );
}
