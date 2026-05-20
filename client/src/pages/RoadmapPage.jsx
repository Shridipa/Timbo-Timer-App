import React from "react";
import { motion } from "framer-motion";
import { Check, Lock, Route, Sparkles } from "lucide-react";
import { getAdaptiveState, getRoadmap } from "../lib/adaptiveEngine";

export default function RoadmapPage() {
  const phases = getRoadmap();
  const state = getAdaptiveState();

  return (
    <div className="page-flow roadmap-page">
      <section className="screen-heading">
        <span className="soft-label"><Route size={14} /> Roadmap</span>
        <h1>A calm path to {state.profile.goal}</h1>
        <p>Timbo adapts the journey when life happens. Missed tasks move forward gently instead of becoming guilt.</p>
      </section>

      <section className="roadmap-path">
        {phases.map((phase, index) => {
          const active = phase.state === "active";
          const locked = phase.state === "locked";
          return (
            <motion.article key={phase.title} className={`roadmap-node ${active ? "active" : ""} ${locked ? "locked" : ""}`} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
              <div className="checkpoint">{phase.progress >= 80 ? <Check size={22} /> : locked ? <Lock size={20} /> : <Sparkles size={20} />}</div>
              <div className="roadmap-card">
                <span>{phase.phase} - {phase.dates}</span>
                <h2>{phase.title}</h2>
                <div className="roadmap-progress"><div style={{ width: `${phase.progress}%` }} /></div>
                <div className="checkpoint-list">{phase.checkpoints.map((item) => <span key={item}>{item}</span>)}</div>
              </div>
            </motion.article>
          );
        })}
      </section>

      <section className="calm-panel">
        <span className="soft-label">Restructure Logic</span>
        <h2>How Timbo adapts</h2>
        <div className="rule-grid">
          <div><strong>Skipped twice?</strong><span>Task is shortened and moved earlier.</span></div>
          <div><strong>Momentum low?</strong><span>Recovery mode inserts easier sessions.</span></div>
          <div><strong>Deadline close?</strong><span>Urgent milestones get priority windows.</span></div>
        </div>
      </section>
    </div>
  );
}
