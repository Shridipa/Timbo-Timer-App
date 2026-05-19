import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createGoal, getActiveGoal, resetGoal } from "../api/goals";
import { toast } from "react-hot-toast";
import AISchedulingModal from "../components/ai/AISchedulingModal";

// ─── Helpers ───────────────────────────────────────────────────────────────
const daysUntil = (dateStr) => {
  if (!dateStr) return 0;
  const diff = new Date(dateStr) - new Date();
  return Math.max(0, Math.ceil(diff / 86400000));
};

const phaseColors = [
  { accent: "#6366f1", light: "rgba(99,102,241,0.08)", badge: "rgba(99,102,241,0.15)" },
  { accent: "#0ea5e9", light: "rgba(14,165,233,0.08)", badge: "rgba(14,165,233,0.15)" },
  { accent: "#8b5cf6", light: "rgba(139,92,246,0.08)", badge: "rgba(139,92,246,0.15)" },
  { accent: "#10b981", light: "rgba(16,185,129,0.08)", badge: "rgba(16,185,129,0.15)" },
];

const priorityConfig = {
  critical: { color: "#ef4444", label: "Critical" },
  high: { color: "#f59e0b", label: "High" },
  medium: { color: "#6366f1", label: "Medium" },
  low: { color: "#64748b", label: "Low" },
};

const statusConfig = {
  completed: { icon: "✓", color: "#10b981" },
  "in-progress": { icon: "◐", color: "#f59e0b" },
  pending: { icon: "○", color: "#6b7280" },
};

// ─── Sub-components ───────────────────────────────────────────────────────────
const PhaseRow = ({ phase, index, isOpen, onToggle, onScheduleTask }) => {
  const tasks = phase.tasks || [];
  const total = tasks.length;
  const done = tasks.filter((t) => t.status === "completed").length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const col = phaseColors[index % 4];

  return (
    <div style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
      <button
        onClick={onToggle}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: "16px 24px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
          transition: "background 0.15s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.025)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      >
        {/* Number bubble */}
        <div style={{
          width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
          background: col.light, border: `1.5px solid ${col.accent}40`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 12, fontWeight: 700, color: col.accent, fontFamily: "'DM Mono', monospace",
        }}>
          {String(index + 1).padStart(2, "0")}
        </div>

        {/* Title block */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#f1f5f9", letterSpacing: "-0.01em", marginBottom: 2 }}>
            {phase.title}
          </div>
          <div style={{ fontSize: 12, color: "#64748b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {phase.objective}
          </div>
        </div>

        {/* Progress */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 80, height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 99 }}>
              <div style={{ width: `${pct}%`, height: "100%", background: col.accent, borderRadius: 99, transition: "width 0.6s ease" }} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#475569", fontFamily: "'DM Mono', monospace", minWidth: 28 }}>
              {pct}%
            </span>
          </div>
          <span style={{
            fontSize: 11, fontWeight: 600, color: col.accent,
            background: col.badge, padding: "3px 10px", borderRadius: 99,
          }}>
            {total} steps
          </span>
          <span style={{
            fontSize: 16, color: "#475569", transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease", display: "flex",
          }}>›</span>
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ padding: "4px 24px 20px 72px", display: "flex", flexDirection: "column", gap: 8 }}>
              {tasks.map((task, i) => {
                const s = statusConfig[task.status] || statusConfig.pending;
                const p = priorityConfig[task.priority] || priorityConfig.medium;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    style={{
                      display: "flex", alignItems: "flex-start", gap: 12,
                      padding: "12px 16px",
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.05)",
                      borderRadius: 12, cursor: "default",
                    }}
                  >
                    <span style={{ fontSize: 14, color: s.color, flexShrink: 0, marginTop: 1, fontFamily: "'DM Mono', monospace" }}>
                      {s.icon}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0", marginBottom: 3 }}>{task.title}</div>
                      <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.5 }}>{task.description}</div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                      <span style={{
                        fontSize: 10, fontWeight: 700, color: p.color, textTransform: "uppercase",
                        letterSpacing: "0.06em", background: `${p.color}15`, padding: "2px 8px", borderRadius: 99,
                      }}>
                        {p.label}
                      </span>
                      <div style={{ display: "flex", items: "center", gap: 8 }}>
                        <span style={{ fontSize: 11, color: "#475569", fontFamily: "'DM Mono', monospace", marginTop: 4 }}>
                          {task.duration}m
                        </span>
                        <button 
                          onClick={() => onScheduleTask(task.title)}
                          style={{
                            padding: "3px 10px", borderRadius: 8, border: "none",
                            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                            color: "#fff", fontSize: 11, fontWeight: 600, cursor: "pointer",
                            display: "flex", alignItems: "center", gap: 4,
                            boxShadow: "0 2px 8px rgba(99,102,241,0.2)"
                          }}
                        >
                          <span>✨</span> Schedule
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function RoadmapPage() {
  const [activeGoal, setActiveGoal] = useState(null);
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("form"); // roadmap | form | onboarding
  const [expandedPhase, setExpandedPhase] = useState(0);
  const [activeRiskTab, setActiveRiskTab] = useState("risks");

  // AI Scheduling Modal State
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [selectedTaskTitle, setSelectedTaskTitle] = useState("");

  // Onboarding Form State
  const [formData, setFormData] = useState({
    title: "",
    deadline: "",
    targetHours: "2",
    currentLevel: "Beginner",
    commitments: "",
    stressLevel: "Medium",
    motivations: "",
    distractions: "",
  });

  const loadActiveGoalAndRoadmap = async () => {
    try {
      const data = await getActiveGoal();
      if (data && data.goal) {
        setActiveGoal(data.goal);
        setRoadmap(data.roadmap);
        setView("roadmap");
      } else {
        setActiveGoal(null);
        setRoadmap(null);
        setView("form");
      }
    } catch (e) {
      toast.error("Failed to retrieve active strategy");
      setView("form");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActiveGoalAndRoadmap();
  }, []);

  const handleOnboardingSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!formData.title || !formData.deadline) {
      return toast.error("Goal title and deadline target are required");
    }
    setView("onboarding");
    try {
      await createGoal(formData);
      toast.success("AI Life Operating Roadmap Generated!");
      await loadActiveGoalAndRoadmap();
    } catch (err) {
      toast.error("AI synthesis failed. Please retry.");
      setView("form");
    }
  };

  const handleResetStrategy = async () => {
    if (!window.confirm("Are you absolutely sure you want to archive this strategy? This will clear your current roadmap and let you start a new AI goal onboarding session.")) {
      return;
    }
    setLoading(true);
    try {
      await resetGoal();
      setActiveGoal(null);
      setRoadmap(null);
      setView("form");
      toast.success("Active strategy archived. You can now define a new objective!");
    } catch (e) {
      toast.error("Failed to reset strategy");
    } finally {
      setLoading(false);
    }
  };

  // ── Initial loading state ──
  if (loading) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        background: "#080c14", fontFamily: "'DM Sans', sans-serif",
        padding: 24,
      }}>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          style={{ width: 48, height: 48, borderRadius: "50%", border: "2px solid #6366f1", borderTopColor: "transparent", marginBottom: 32 }} />
        <h2 style={{ fontSize: 24, fontWeight: 600, color: "#f1f5f9", marginBottom: 12, letterSpacing: "-0.02em" }}>
          Querying Life Strategy Matrix...
        </h2>
      </div>
    );
  }

  // ── Onboarding loading screen ──
  if (view === "onboarding") {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        background: "#080c14", fontFamily: "'DM Sans', sans-serif",
        padding: 24,
      }}>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          style={{ width: 48, height: 48, borderRadius: "50%", border: "2px solid #6366f1", borderTopColor: "transparent", marginBottom: 32 }} />
        <h2 style={{ fontSize: 24, fontWeight: 600, color: "#f1f5f9", marginBottom: 12, letterSpacing: "-0.02em" }}>
          Building your roadmap
        </h2>
        <p style={{ fontSize: 15, color: "#64748b", maxWidth: 360, textalign: "center", lineHeight: 1.6 }}>
          AI is calculating timeline models, identifying skill gaps, and outlining execution phases…
        </p>
        <div style={{ width: 280, height: 2, background: "rgba(255,255,255,0.06)", borderRadius: 99, marginTop: 40, overflow: "hidden" }}>
          <motion.div initial={{ x: "-100%" }} animate={{ x: "100%" }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            style={{ width: "60%", height: "100%", background: "linear-gradient(90deg, transparent, #6366f1, transparent)" }} />
        </div>
        <div style={{ marginTop: 32, display: "flex", flexDirection: "column", gap: 8 }}>
          {["Deconstructing goal complexity", "Drafting tactical phase structure", "Aligning cognitive load allocation"].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 + i * 0.6 }}
              style={{ fontSize: 13, color: "#475569", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: "#10b981" }}>✓</span> {s}
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  // ── Goal creation form ──
  if (view === "form") {
    return (
      <div style={{
        minHeight: "100vh", background: "#080c14",
        fontFamily: "'DM Sans', sans-serif", color: "#f1f5f9",
        padding: "48px 24px 80px",
      }}>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          {activeGoal && (
            <button onClick={() => setView("roadmap")} style={{
              background: "none", border: "none", color: "#64748b", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 6, fontSize: 14, marginBottom: 40, padding: 0,
            }}>
              ← Back to roadmap
            </button>
          )}
          <div style={{ marginBottom: 48 }}>
            <div style={{
              display: "inline-block", fontSize: 11, fontWeight: 600, letterSpacing: "0.1em",
              textTransform: "uppercase", color: "#6366f1", marginBottom: 16,
              padding: "4px 12px", background: "rgba(99,102,241,0.1)", borderRadius: 99,
            }}>
              New Objective
            </div>
            <h1 style={{ fontSize: 36, fontWeight: 700, letterSpacing: "-0.03em", color: "#f8fafc", margin: 0 }}>
              Define your next<br />
              <span style={{ color: "#6366f1" }}>breakthrough</span>
            </h1>
          </div>

          <form onSubmit={handleOnboardingSubmit} style={{ display: "flex", flexDirection: "column", gap: 32 }}>
            {/* Section 1 */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#475569", marginBottom: 16 }}>
                01 — Core objective
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {[
                  { label: "Primary goal", key: "title", type: "text", placeholder: "e.g. Crack FAANG in 6 months", span: 2, required: true },
                  { label: "Deadline", key: "deadline", type: "date", placeholder: "", span: 1, required: true },
                  { label: "Daily commitment", key: "targetHours", type: "select", span: 1,
                    options: [["1","1 hour / day"],["2","2 hours / day"],["4","4 hours / day"],["6","6 hours / day"],["8","8+ hours / day"]] },
                ].map((f) => (
                  <div key={f.key} style={{ gridColumn: f.span === 2 ? "1 / -1" : undefined }}>
                    <label style={{ display: "block", fontSize: 13, color: "#94a3b8", marginBottom: 8 }}>{f.label}</label>
                    {f.type === "select" ? (
                      <select value={formData[f.key]} onChange={e => setFormData({ ...formData, [f.key]: e.target.value })}
                        style={inputStyle}>
                        {f.options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                      </select>
                    ) : (
                      <input type={f.type} placeholder={f.placeholder} value={formData[f.key]}
                        onChange={e => setFormData({ ...formData, [f.key]: e.target.value })}
                        style={inputStyle}
                        required={f.required} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Section 2 */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#475569", marginBottom: 16 }}>
                02 — Context & psychology
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {[
                  { label: "What motivates you?", key: "motivations", type: "textarea", placeholder: "Proving your ability, financial freedom…" },
                  { label: "What distracts you most?", key: "distractions", type: "textarea", placeholder: "Social media, procrastination cycles…" },
                ].map((f) => (
                  <div key={f.key}>
                    <label style={{ display: "block", fontSize: 13, color: "#94a3b8", marginBottom: 8 }}>{f.label}</label>
                    <textarea rows={3} placeholder={f.placeholder} value={formData[f.key]}
                      onChange={e => setFormData({ ...formData, [f.key]: e.target.value })}
                      style={{ ...inputStyle, resize: "none", lineHeight: 1.6 }} />
                  </div>
                ))}
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ display: "block", fontSize: 13, color: "#94a3b8", marginBottom: 8 }}>Active commitments / constraints</label>
                  <input type="text" placeholder="e.g. Full-time student, 9-to-5 job" value={formData.commitments}
                    onChange={e => setFormData({ ...formData, commitments: e.target.value })}
                    style={inputStyle} />
                </div>
              </div>
            </div>

            <button
              type="submit"
              style={{
                padding: "16px 24px", borderRadius: 14, border: "none", cursor: "pointer",
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                color: "#fff", fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                transition: "opacity 0.15s",
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = "0.9"}
              onMouseLeave={e => e.currentTarget.style.opacity = "1"}
            >
              ⚡ Generate strategic roadmap
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── Mapping actual activeGoal data to local properties ──
  const goal = activeGoal;
  const days = daysUntil(goal.deadline);
  const totalTasks = roadmap?.phases?.flatMap(p => p.tasks || []).length || 0;
  const completedTasks = roadmap?.phases?.flatMap(p => p.tasks || []).filter(t => t.status === "completed").length || 0;
  const overallPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const analysis = goal.analysis || { risks: [], skillGaps: [], effortEstimate: "", executionProbability: 75, burnoutRisk: "Low" };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#080c14",
      fontFamily: "'DM Sans', sans-serif",
      color: "#f1f5f9",
      padding: "0",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />

      {/* ── Top nav strip ── */}
      <div style={{
        height: 56, borderBottom: "1px solid rgba(255,255,255,0.05)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 32px", background: "rgba(8,12,20,0.8)",
        backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 50,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 24, height: 24, borderRadius: 6, background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 12 }}>◈</span>
          </div>
          <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: "-0.02em" }}>LifeOS</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {["Roadmap","Journal","Habits","Analytics"].map((item, i) => (
            <button key={item} style={{
              background: "none", border: "none", cursor: "pointer",
              fontSize: 13, color: i === 0 ? "#f1f5f9" : "#64748b",
              fontWeight: i === 0 ? 600 : 400, padding: "4px 0",
              borderBottom: i === 0 ? "1.5px solid #6366f1" : "1.5px solid transparent",
            }}>{item}</button>
          ))}
        </div>
        <button
          onClick={() => setView("form")}
          style={{
            padding: "7px 16px", borderRadius: 99, border: "1px solid rgba(99,102,241,0.4)",
            background: "rgba(99,102,241,0.1)", color: "#818cf8", fontSize: 12,
            fontWeight: 600, cursor: "pointer", letterSpacing: "0.01em",
          }}>
          + New goal
        </button>
      </div>

      <div style={{ maxWidth: "100%", margin: "0 auto", padding: "40px 64px 80px", width: "100%" }}>

        {/* ── Page header ── */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
            <div>
              <div style={{
                fontSize: 11, fontWeight: 700, letterSpacing: "0.12em",
                textTransform: "uppercase", color: "#6366f1", marginBottom: 10,
                display: "flex", alignItems: "center", gap: 8,
              }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#6366f1", display: "inline-block" }} />
                Active Strategy
              </div>
              <h1 style={{
                fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 700,
                letterSpacing: "-0.03em", margin: 0, lineHeight: 1.15,
                color: "#f8fafc", maxWidth: 600,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }} title={goal.title}>
                {goal.title}
              </h1>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button onClick={handleResetStrategy} style={{
                padding: "9px 18px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(255,255,255,0.04)", color: "#94a3b8", fontSize: 13,
                fontWeight: 500, cursor: "pointer",
              }}>
                Reset strategy
              </button>
            </div>
          </div>

          {/* Overall progress bar */}
          <div style={{ marginTop: 28, display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ flex: 1, height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 99 }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${overallPct}%` }}
                transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
                style={{ height: "100%", background: "linear-gradient(90deg, #6366f1, #8b5cf6)", borderRadius: 99 }}
              />
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#6366f1", fontFamily: "'DM Mono', monospace", flexShrink: 0 }}>
              {overallPct}% complete
            </span>
          </div>
        </div>

        {/* ── Metric cards row ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 32 }}>
          {[
            {
              label: "Execution index", value: `${analysis.executionProbability || 85}%`,
              sub: "Strong trajectory", color: "#6366f1",
              icon: "▲",
            },
            {
              label: "Days remaining", value: days,
              sub: `to ${goal.deadline ? new Date(goal.deadline).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "N/A"}`,
              color: "#0ea5e9", icon: "◷",
            },
            {
              label: "Daily intensity", value: `${goal.targetHours}h`,
              sub: "deep work / day", color: "#8b5cf6", icon: "⬡",
            },
            {
              label: "Burnout risk", value: analysis.burnoutRisk || "Low",
              sub: "Stay balanced", color: "#10b981", icon: "◉",
            },
          ].map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, duration: 0.4 }}
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 16, padding: "20px 20px 18px",
                position: "relative", overflow: "hidden",
              }}
            >
              <div style={{
                position: "absolute", top: 16, right: 16,
                fontSize: 20, color: m.color, opacity: 0.2, lineHeight: 1,
              }}>
                {m.icon}
              </div>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#475569", marginBottom: 10 }}>
                {m.label}
              </div>
              <div style={{ fontSize: 28, fontWeight: 700, color: m.color, letterSpacing: "-0.03em", lineHeight: 1, marginBottom: 4 }}>
                {m.value}
              </div>
              <div style={{ fontSize: 12, color: "#475569" }}>{m.sub}</div>
            </motion.div>
          ))}
        </div>

        {/* ── Main 2-column layout ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 24, alignItems: "start" }}>

          {/* Left: Roadmap accordion */}
          <div>
            {roadmap && (
              <div style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 20, overflow: "hidden",
              }}>
                {/* Header */}
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "18px 24px", borderBottom: "1px solid rgba(255,255,255,0.05)",
                }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: "#f1f5f9", letterSpacing: "-0.01em" }}>
                      Strategic Execution Plan
                    </div>
                    <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                      {roadmap.phases.length} phases · {totalTasks} milestone tasks
                    </div>
                  </div>
                  <button
                    onClick={() => setExpandedPhase(expandedPhase === -1 ? 0 : -1)}
                    style={{
                      padding: "6px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)",
                      background: "rgba(255,255,255,0.04)", color: "#64748b", fontSize: 12,
                      fontWeight: 500, cursor: "pointer",
                    }}>
                    {expandedPhase === -1 ? "Collapse" : "Expand all"}
                  </button>
                </div>

                {roadmap.phases.map((phase, idx) => (
                  <PhaseRow
                    key={idx}
                    phase={phase}
                    index={idx}
                    isOpen={expandedPhase === idx || expandedPhase === -1}
                    onToggle={() => setExpandedPhase(expandedPhase === idx ? -2 : idx)}
                    onScheduleTask={(title) => {
                      setSelectedTaskTitle(title);
                      setIsAiModalOpen(true);
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right column: Intelligence panels */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Next actions card */}
            {roadmap?.phases && (
              <div style={{
                background: "rgba(99,102,241,0.06)",
                border: "1px solid rgba(99,102,241,0.15)",
                borderRadius: 20, padding: "20px",
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#6366f1", marginBottom: 14 }}>
                  ⚡ Next actions
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {roadmap.phases.flatMap(p => p.tasks || []).filter(t => t.status !== "completed").slice(0, 3).map((task, i) => (
                    <div key={i} style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "10px 12px", borderRadius: 10,
                      background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)",
                    }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#6366f1", flexShrink: 0 }} />
                      <span style={{ fontSize: 13, color: "#cbd5e1", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{task.title}</span>
                      <span style={{ marginLeft: "auto", fontSize: 11, color: "#475569", fontFamily: "'DM Mono', monospace", flexShrink: 0 }}>
                        {task.duration}m
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Risk / Gaps panel */}
            <div style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 20, overflow: "hidden",
            }}>
              {/* Tab header */}
              <div style={{
                display: "flex", borderBottom: "1px solid rgba(255,255,255,0.05)",
              }}>
                {[["risks", "Risks"], ["gaps", "Skill gaps"]].map(([id, label]) => (
                  <button key={id} onClick={() => setActiveRiskTab(id)} style={{
                    flex: 1, padding: "14px 16px", border: "none", cursor: "pointer",
                    background: "transparent", fontSize: 13, fontWeight: 600,
                    color: activeRiskTab === id ? "#f1f5f9" : "#475569",
                    borderBottom: activeRiskTab === id ? "2px solid #6366f1" : "2px solid transparent",
                    transition: "all 0.15s",
                  }}>
                    {label}
                  </button>
                ))}
              </div>

              <div style={{ padding: "16px" }}>
                <AnimatePresence mode="wait">
                  {activeRiskTab === "risks" ? (
                    <motion.div key="risks" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {analysis.risks && analysis.risks.length > 0 ? (
                        analysis.risks.map((risk, i) => {
                          const [title, detail] = risk.includes(":") ? risk.split(":") : [risk, ""];
                          const cols = ["#ef4444", "#f59e0b", "#f59e0b", "#3b82f6"];
                          return (
                            <div key={i} style={{
                              padding: "12px 14px", borderRadius: 12,
                              background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)",
                              borderLeft: `3px solid ${cols[i % cols.length]}`,
                            }}>
                              <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0", marginBottom: detail ? 4 : 0 }}>
                                {title.trim()}
                              </div>
                              {detail && <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.5 }}>{detail.trim()}</div>}
                            </div>
                          );
                        })
                      ) : (
                        <div style={{ fontSize: 13, color: "#64748b", textAlign: "center", padding: "20px 0" }}>No risks detected. Keep tracking!</div>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div key="gaps" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {analysis.skillGaps && analysis.skillGaps.length > 0 ? (
                        analysis.skillGaps.map((gap, i) => (
                          <motion.span key={i} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: i * 0.05 }}
                            style={{
                              padding: "7px 14px", borderRadius: 99, fontSize: 13, fontWeight: 500,
                              background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)", color: "#a78bfa",
                            }}>
                            {gap}
                          </motion.span>
                        ))
                      ) : (
                        <div style={{ fontSize: 13, color: "#64748b", textAlign: "center", padding: "20px 0", width: "100%" }}>No skill gaps identified.</div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Timeline mini-strip */}
            {roadmap?.phases && (
              <div style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 20, padding: "20px",
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#475569", marginBottom: 16 }}>
                  Execution timeline
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                  {roadmap.phases.map((phase, i) => {
                    const col = phaseColors[i % 4];
                    const isLast = i === roadmap.phases.length - 1;
                    const phaseTasks = phase.tasks || [];
                    return (
                      <div key={i} style={{ display: "flex", gap: 14 }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                          <div style={{
                            width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
                            background: i === 0 ? col.accent : col.light,
                            border: `1.5px solid ${col.accent}`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 10, fontWeight: 700, color: i === 0 ? "#fff" : col.accent,
                            fontFamily: "'DM Mono', monospace",
                          }}>
                            {i + 1}
                          </div>
                          {!isLast && (
                            <div style={{ width: 1, flex: 1, minHeight: 24, background: `${col.accent}30`, margin: "4px 0" }} />
                          )}
                        </div>
                        <div style={{ paddingBottom: isLast ? 0 : 20, paddingTop: 4 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0", marginBottom: 2 }}>{phase.title}</div>
                          <div style={{ fontSize: 11, color: "#475569" }}>
                            {phaseTasks.length} tasks · {phaseTasks.filter(t=>t.status==="completed").length} done
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* ── Footer metadata ── */}
        <div style={{
          marginTop: 40, paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.05)",
          display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap",
        }}>
          {[
            { icon: "◷", label: `Deadline: ${goal.deadline ? new Date(goal.deadline).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "N/A"}` },
            { icon: "⬡", label: `Intensity: ${goal.targetHours}h / day` },
            { icon: "◉", label: `Stress level: ${goal.stressLevel}` },
            { icon: "▲", label: `${totalTasks} total tasks` },
          ].map((m, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#475569", fontWeight: 500 }}>
              <span style={{ color: "#334155" }}>{m.icon}</span>
              {m.label}
            </div>
          ))}
        </div>

      </div>

      <AISchedulingModal 
        isOpen={isAiModalOpen} 
        onClose={() => setIsAiModalOpen(false)} 
        initialTitle={selectedTaskTitle}
        onScheduleComplete={() => {
          loadActiveGoalAndRoadmap();
        }} 
      />
    </div>
  );
}

const inputStyle = {
  width: "100%",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 12,
  padding: "12px 14px",
  color: "#f1f5f9",
  fontSize: 14,
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "'DM Sans', sans-serif",
  transition: "border-color 0.15s",
};
