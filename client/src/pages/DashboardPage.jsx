import React from "react";
import { motion } from "framer-motion";
import {
  CalendarClock,
  CheckCircle2,
  HeartPulse,
  Plus,
  Sparkles,
  Target,
  TimerReset,
  UsersRound,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getAdaptiveState } from "../lib/adaptiveEngine";

const Ring = ({ label, value }) => (
  <div className="metric-ring reference-ring">
    <svg viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="42" />
      <motion.circle cx="50" cy="50" r="42" initial={{ pathLength: 0 }} animate={{ pathLength: value / 100 }} transition={{ duration: 0.9, ease: "easeOut" }} />
    </svg>
    <strong>{value}</strong>
    <span>{label}</span>
  </div>
);

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const state = getAdaptiveState(user);

  return (
    <div className="dashboard-reference">
      <section className="dashboard-main">
        <div className="dashboard-greeting">
          <h1>Good morning, {user?.name?.split(" ")?.[0] || "Aryan"}!</h1>
          <p>Let&apos;s build momentum and make today count.</p>
        </div>

        <div className="dashboard-hero-grid">
          <motion.article className="reference-mission-card" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
            <div className="mission-copy">
              <span className="soft-label">Today&apos;s Mission</span>
              <h2>{state.mission.title}</h2>
              <p>{state.mission.why}</p>
              <div className="reference-progress"><span style={{ width: `${state.mission.progress}%` }} /></div>
              <div className="mission-meta">
                <span><CalendarClock size={16} /> {state.mission.eta}</span>
                <span><Target size={16} /> {state.mission.priority}</span>
              </div>
            </div>
            <div className="mission-art" aria-hidden="true">
              <span className="mountain one" />
              <span className="mountain two" />
              <i />
            </div>
          </motion.article>

          <motion.article className="reference-panel up-next" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <div className="reference-panel-head"><span>Up Next</span><button>View all</button></div>
            {state.timeline.map((item) => (
              <div className="next-row" key={item.title}>
                <div><strong>{item.time}</strong><span>{item.length}m</span></div>
                <p>{item.title}</p>
                <i />
              </div>
            ))}
          </motion.article>
        </div>

        <motion.article className="reference-schedule" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
          <div className="reference-panel-head"><span>Today&apos;s Schedule</span><button onClick={() => navigate("/calendar")}>View calendar</button></div>
          <div className="schedule-strip">
            {state.timeline.map((item, index) => (
              <button key={item.title} className={index === 2 ? "purple" : index === 1 ? "gold" : ""}>
                <small>{item.time}</small>
                <strong>{item.title}</strong>
                <span>{item.priority}</span>
              </button>
            ))}
            <button className="ghost"><Plus size={16} /> Add block</button>
          </div>
        </motion.article>

        <section className="reference-lower-grid">
          <article className="reference-panel insight">
            <div className="reference-panel-head"><span>AI Insight for you</span><HeartPulse size={18} /></div>
            <div className="insight-row">
              <Sparkles size={22} />
              <p>{state.insights[0]} Try scheduling deep work sessions during this window.</p>
            </div>
          </article>
          <article className="reference-panel energy">
            <div className="reference-panel-head"><span>Energy Level</span><strong>High</strong></div>
            <div className="energy-line"><i /><i /><i /><i /><i /></div>
          </article>
        </section>
      </section>

      <aside className="dashboard-right">
        <article className="reference-panel momentum-card">
          <span>Your Momentum</span>
          <Ring label="Momentum Score" value={state.momentum.score} />
          <p>Amazing consistency. Keep going strong.</p>
        </article>

        <article className="reference-panel quick-actions">
          <div className="reference-panel-head"><span>Quick Actions</span></div>
          <button onClick={() => navigate("/focus")}><TimerReset size={16} /> Start focus</button>
          <button><Sparkles size={16} /> Ask coach</button>
          <button><Plus size={16} /> Add task</button>
          <button><CheckCircle2 size={16} /> Log mood</button>
        </article>

        <article className="reference-panel team-progress">
          <div className="reference-panel-head"><span>Team Progress</span><button onClick={() => navigate("/team")}>View team</button></div>
          {[
            ["Rohit Sharma", "85%"],
            ["Ananya Iyer", "72%"],
            ["Karan Patel", "45%"],
            ["Meera Singh", "90%"],
          ].map(([name, value]) => (
            <div className="team-mini-row" key={name}>
              <UsersRound size={15} />
              <span>{name}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </article>
      </aside>
    </div>
  );
}
