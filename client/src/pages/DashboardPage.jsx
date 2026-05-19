import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { getActiveGoal } from "../api/goals";
import { fetchDailyMissions, toggleMissionStatus, skipMission } from "../api/missions";
import { fetchMorningBrief, submitBedtimeReview, fetchTodayReview } from "../api/coaching";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import AISchedulingModal from "../components/ai/AISchedulingModal";
import ReactMarkdown from "react-markdown";

// ── Priority configurations ──────────────────────────────────────────────────
const priorityColor = { critical: "#ef4444", high: "#f59e0b", medium: "#6366f1" };
const blockIcon = { morning: "🌅", afternoon: "☀️", evening: "🌙" };

// ─── Mission card ──────────────────────────────────────────────────────────────
const MissionCard = ({ mission, onToggle, onSkip, navigate }) => {
  const p = priorityColor[(mission.priority || "medium").toLowerCase()] || "#6366f1";
  const statusColors = {
    completed: { bg: "rgba(16,185,129,0.06)", border: "rgba(16,185,129,0.2)" },
    skipped: { bg: "rgba(239,68,68,0.04)", border: "rgba(239,68,68,0.12)" },
    pending: { bg: "rgba(255,255,255,0.025)", border: "rgba(255,255,255,0.06)" }
  };
  const s = statusColors[mission.status || "pending"] || statusColors.pending;

  const getTimeBlockDisplay = (block) => {
    const norm = (block || "morning").toLowerCase();
    if (norm.includes("morning")) return "morning";
    if (norm.includes("afternoon")) return "afternoon";
    if (norm.includes("evening") || norm.includes("night")) return "evening";
    return "morning";
  };

  const blockKey = getTimeBlockDisplay(mission.timeBlock);
  const icon = blockIcon[blockKey] || "🌅";

  return (
    <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
      style={{
        padding: "18px 20px", borderRadius: 16,
        background: s.bg, border: `1px solid ${s.border}`,
        display: "flex", alignItems: "flex-start", gap: 16,
      }}>
      {/* Status toggle */}
      <button onClick={() => onToggle(mission._id)} style={{
        width: 22, height: 22, borderRadius: "50%", flexShrink: 0, marginTop: 2, cursor: "pointer",
        background: mission.status === "completed" ? "#10b981" : "transparent",
        border: `2px solid ${mission.status === "completed" ? "#10b981" : mission.status === "skipped" ? "#ef444460" : "rgba(255,255,255,0.15)"}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 12, color: "#fff", transition: "all 0.15s",
      }}>
        {mission.status === "completed" && "✓"}
      </button>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
          <span style={{
            fontSize: 15, fontWeight: 600, color: mission.status === "completed" ? "#475569" : "#e2e8f0",
            textDecoration: mission.status === "completed" ? "line-through" : "none", letterSpacing: "-0.01em",
          }}>
            {mission.title}
          </span>
          <span style={{
            fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
            color: p, background: `${p}15`, padding: "2px 8px", borderRadius: 99, flexShrink: 0, marginTop: 2,
          }}>
            {mission.priority || "medium"}
          </span>
        </div>
        <div style={{ fontSize: 13, color: "#64748b", marginBottom: 6, lineHeight: 1.5 }}>{mission.description}</div>
        {mission.whyItMatters && (
          <div style={{ fontSize: 12, color: "#f59e0b" }}>⚡ {mission.whyItMatters}</div>
        )}
        {mission.status === "skipped" && mission.excuseValidation && (
          <div style={{
            marginTop: 8, padding: "8px 12px", borderRadius: 10,
            background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)",
            fontSize: 12, color: "#fca5a5", fontStyle: "italic",
          }}>
            <strong>Coach:</strong> {mission.excuseValidation}
          </div>
        )}
      </div>

      {/* Right side */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, flexShrink: 0 }}>
        <span style={{ fontSize: 12, color: "#475569", fontFamily: "'DM Mono', monospace" }}>
          {icon} {mission.duration || 30}m
        </span>
        {mission.status === "pending" && (
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={() => onSkip(mission._id)} style={{
              padding: "5px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)",
              background: "transparent", color: "#64748b", fontSize: 12, cursor: "pointer",
              transition: "all 0.15s",
            }}
              onMouseEnter={e => { e.currentTarget.style.color = "#ef4444"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.3)"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "#64748b"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}>
              Skip
            </button>
            <button 
              onClick={() => navigate("/focus", { state: { missionId: mission._id, title: mission.title, duration: mission.duration } })}
              style={{
                padding: "5px 14px", borderRadius: 8,
                background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.25)",
                color: "#818cf8", fontSize: 12, cursor: "pointer", fontWeight: 600,
                display: "flex", alignItems: "center", gap: 5,
              }}>
              ▶ Focus
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user, reloadUser } = useAuth();
  const navigate = useNavigate();

  const [activeGoal, setActiveGoal] = useState(null);
  const [missions, setMissions] = useState([]);
  const [brief, setBrief] = useState(null);
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);

  // Excuse modal state
  const [skippingId, setSkippingId] = useState(null);
  const [excuseText, setExcuseText] = useState("");
  const [submittingExcuse, setSubmittingExcuse] = useState(false);

  // Review modal state
  const [showReview, setShowReview] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewForm, setReviewForm] = useState({ win: "", struggle: "", energyLevel: 7, distractionLevel: 4, reflection: "" });

  // AI Scheduling Modal state
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  const today = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });

  const loadDashboardData = async () => {
    try {
      const goalData = await getActiveGoal();
      setActiveGoal(goalData.goal);
      
      if (goalData.goal) {
        const todayStr = format(new Date(), "yyyy-MM-dd");
        const [missionsData, briefData, reviewData] = await Promise.all([
          fetchDailyMissions(todayStr),
          fetchMorningBrief(),
          fetchTodayReview()
        ]);
        setMissions(missionsData || []);
        setBrief(briefData);
        setReview(reviewData);
      }
    } catch (e) {
      console.error("Failed to load Execution Center datasets", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleToggle = async (id) => {
    try {
      const res = await toggleMissionStatus(id);
      setMissions(missions.map(m => m._id === id ? res.mission : m));
      toast.success(res.mission.status === "completed" ? "Mission Executed! +10 XP" : "Task reverted");
      await reloadUser();
      loadDashboardData();
    } catch (e) {
      toast.error("Failed to complete action");
    }
  };

  const handleSkipSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!excuseText.trim()) return toast.error("An excuse statement is required");
    setSubmittingExcuse(true);
    try {
      const res = await skipMission(skippingId, excuseText);
      setMissions(missions.map(m => m._id === skippingId ? res.mission : m));
      setExcuseText("");
      setSkippingId(null);
      toast.success("Excuse validated and logged.");
      await reloadUser();
    } catch (err) {
      toast.error("AI calibration error");
    } finally {
      setSubmittingExcuse(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    if (e) e.preventDefault();
    setSubmittingReview(true);
    try {
      const savedReview = await submitBedtimeReview(reviewForm);
      setReview(savedReview);
      setShowReview(false);
      toast.success("Bedtime calibration saved! +20 XP");
      await reloadUser();
    } catch (err) {
      toast.error("Failed to register review insights");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleNav = (item) => {
    const routeMap = {
      Dashboard: "/",
      Roadmap: "/roadmap",
      Analytics: "/analytics",
      Coach: "/coach",
      Focus: "/focus",
    };
    if (routeMap[item]) {
      navigate(routeMap[item]);
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        background: "#080c14", fontFamily: "'DM Sans', sans-serif",
        padding: 24,
      }}>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          style={{ width: 48, height: 48, borderRadius: "50%", border: "2px solid #6366f1", borderTopColor: "transparent", marginBottom: 32 }} />
        <h2 style={{ fontSize: 24, fontWeight: 600, color: "#f1f5f9", marginBottom: 12, letterSpacing: "-0.02em" }}>
          Booting Life OS Workspace...
        </h2>
      </div>
    );
  }

  // Onboarding banner for new users
  if (!activeGoal) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        background: "#080c14", fontFamily: "'DM Sans', sans-serif",
        padding: 24, textAlign: "center"
      }}>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
        <div style={{
          width: 64, height: 64, borderRadius: 20, marginBottom: 24,
          background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 28, color: "#fff", border: "1px solid rgba(255,255,255,0.08)",
        }}>◈</div>
        <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.03em", margin: "0 0 12px", color: "#f8fafc" }}>
          Initialize Life Operating System
        </h1>
        <p style={{ fontSize: 14, color: "#64748b", maxWidth: 420, lineHeight: 1.6, marginBottom: 32 }}>
          Welcome to the next generation of AI-driven execution. Connect major goals, construct timeline models, and track cognitive momentum.
        </p>
        <button onClick={() => navigate("/roadmap")} style={{
          padding: "14px 28px", borderRadius: 14, border: "none",
          background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
          color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer",
          boxShadow: "0 8px 24px rgba(99, 102, 241, 0.25)",
        }}>
          Begin Goal Onboarding
        </button>
      </div>
    );
  }

  const completed = missions.filter((m) => m.status === "completed").length;
  const total = missions.length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  const userLevel = user?.level || 1;
  const userPoints = user?.points || 0;
  const xpInLevel = userPoints % 100;
  const momentumScore = user?.momentumScore || 100;

  return (
    <div style={{ minHeight: "100vh", background: "#080c14", fontFamily: "'DM Sans', sans-serif", color: "#f1f5f9" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />

      {/* Nav */}
      <div style={{
        height: 56, borderBottom: "1px solid rgba(255,255,255,0.05)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 32px", background: "rgba(8,12,20,0.9)", backdropFilter: "blur(12px)",
        position: "sticky", top: 0, zIndex: 50,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 24, height: 24, borderRadius: 6, background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 11 }}>◈</span>
          </div>
          <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: "-0.02em" }}>LifeOS</span>
        </div>
        <div style={{ display: "flex", gap: 24 }}>
          {["Dashboard","Roadmap","Analytics","Coach","Focus"].map((item, i) => (
            <button key={item} onClick={() => handleNav(item)} style={{
              background: "none", border: "none", cursor: "pointer",
              fontSize: 13, color: i === 0 ? "#f1f5f9" : "#475569", fontWeight: i === 0 ? 600 : 400,
              borderBottom: i === 0 ? "1.5px solid #6366f1" : "1.5px solid transparent", padding: "4px 0",
            }}>{item}</button>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700,
          }}>
            {userLevel}
          </div>
          <div style={{ fontSize: 12, color: "#64748b" }}>
            <span style={{ color: "#f1f5f9", fontWeight: 600 }}>{userPoints} XP</span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "100%", margin: "0 auto", padding: "36px 64px 80px", width: "100%" }}>
        <style>{`
          .brief-prose { color: var(--muted); font-family: 'Inter', sans-serif; font-size: 14px; line-height: 1.7; }
          .brief-prose p { margin-bottom: 1em; }
          .brief-prose strong { color: var(--foreground); font-weight: 700; }
          .brief-prose ul, .brief-prose ol { margin-bottom: 1em; padding-left: 1.5em; }
          .brief-prose li { margin-bottom: 0.5em; }
          .brief-prose h1, .brief-prose h2, .brief-prose h3, .brief-prose h4 { color: var(--foreground); font-weight: 700; margin-top: 1.5em; margin-bottom: 0.75em; display: flex; alignItems: center; gap: 8px; }
          .brief-prose a { color: var(--primary); text-decoration: underline; }
          .brief-prose hr { border: none; border-top: 1px solid var(--card-border); margin: 24px 0; }
        `}</style>
        {/* Morning brief banner */}
        {brief && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            style={{
              padding: "24px 28px", borderRadius: 20, marginBottom: 28,
              background: "var(--card-bg)", border: "1px solid var(--card-border)",
              boxShadow: "var(--shadow)", backdropFilter: "blur(12px)",
              display: "flex", alignItems: "flex-start", gap: 20,
            }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12, flexShrink: 0,
              background: "linear-gradient(135deg, var(--primary), #8b5cf6)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
              boxShadow: "0 8px 16px var(--primary-glow)"
            }}>◈</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--primary)", marginBottom: 6 }}>
                Morning brief · {today}
              </div>
              <div style={{ fontSize: 16, fontStyle: "italic", color: "var(--foreground)", marginBottom: 12, fontWeight: 600, letterSpacing: "-0.01em" }}>
                "{brief.motivation || "The gap between who you are and who you want to be is called action."}"
              </div>
              <div className="brief-prose" style={{ whiteSpace: "normal" }}>
                <ReactMarkdown>
                  {brief.brief || "Your strategic schedule is pre-loaded and ready for optimal focus blocks today."}
                </ReactMarkdown>
              </div>
            </div>
          </motion.div>
        )}

        {/* Main layout */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 24, alignItems: "start" }}>

          {/* Left — missions */}
          <div>
            <div style={{
              background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 20, overflow: "hidden",
            }}>
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "18px 20px", borderBottom: "1px solid rgba(255,255,255,0.05)",
              }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "#f1f5f9", letterSpacing: "-0.01em", display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 16 }}>⚡</span> Today's Missions
                  </div>
                  <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                    Adaptive workload for {new Date().toLocaleDateString("en-GB", { weekday: "long" })}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <button 
                    onClick={() => setIsAiModalOpen(true)}
                    style={{
                      padding: "6px 14px", borderRadius: 12, border: "none",
                      background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                      color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer",
                      display: "flex", alignItems: "center", gap: 6,
                      boxShadow: "0 4px 12px rgba(99,102,241,0.25)"
                    }}
                  >
                    <span>✨</span> AI Smart Schedule
                  </button>

                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 80, height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 99 }}>
                      <div style={{ width: `${pct}%`, height: "100%", background: "#10b981", borderRadius: 99 }} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#10b981", fontFamily: "'DM Mono', monospace" }}>
                      {completed}/{total}
                    </span>
                  </div>
                </div>
              </div>
              <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: 12 }}>
                {missions.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "32px", color: "#64748b", fontSize: 13 }}>
                    No adaptive missions scheduled for today. Add sessions inside Roadmap Page.
                  </div>
                ) : (
                  missions.map((m, i) => (
                    <motion.div key={m._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                      <MissionCard mission={m} onToggle={handleToggle} onSkip={setSkippingId} navigate={navigate} />
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Accountability metrics */}
            <div style={{
              background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 20, padding: "20px",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifycontent: "space-between", marginBottom: 16 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#f1f5f9" }}>Accountability</div>
                <span style={{
                  fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em",
                  color: "#8b5cf6", background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)",
                  padding: "3px 10px", borderRadius: 99,
                }}>
                  Level {userLevel}
                </span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                {[
                  { label: "Momentum", val: `${momentumScore}%`, color: "#6366f1" },
                  { label: "Total XP", val: `${userPoints}`, color: "#8b5cf6" },
                ].map((m) => (
                  <div key={m.label} style={{
                    padding: "14px", borderRadius: 12, textAlign: "center",
                    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)",
                  }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: "#475569", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>{m.label}</div>
                    <div style={{ fontSize: 26, fontWeight: 700, color: m.color, fontFamily: "'DM Mono', monospace", letterSpacing: "-0.02em" }}>{m.val}</div>
                  </div>
                ))}
              </div>
              <div>
                <div style={{ display: "flex", justifycontent: "space-between", fontSize: 11, color: "#475569", marginBottom: 6 }}>
                  <span>XP to next level</span>
                  <span style={{ fontFamily: "'DM Mono', monospace" }}>{xpInLevel}/100</span>
                </div>
                <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 99 }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${xpInLevel}%` }} transition={{ duration: 1, delay: 0.5 }}
                    style={{ height: "100%", background: "linear-gradient(90deg, #6366f1, #8b5cf6)", borderRadius: 99 }} />
                </div>
              </div>
            </div>

            {/* Focus shortcut */}
            <div style={{
              background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.15)",
              borderRadius: 20, padding: "20px", textAlign: "center",
            }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>⏱</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#f1f5f9", marginBottom: 6 }}>Deep Work Block</div>
              <div style={{ fontSize: 12, color: "#64748b", marginBottom: 16, lineHeight: 1.5 }}>
                Enter a distraction-free Pomodoro session to maximize focus scores.
              </div>
              <button 
                onClick={() => navigate("/focus")}
                style={{
                  width: "100%", padding: "12px", borderRadius: 12,
                  background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.25)",
                  color: "#fbbf24", fontSize: 13, fontWeight: 700, cursor: "pointer",
                  letterSpacing: "-0.01em",
                }}>
                ▶ Start Focus Session
              </button>
            </div>

            {/* Bedtime review */}
            <div style={{
              background: "rgba(14,165,233,0.04)", border: "1px solid rgba(14,165,233,0.12)",
              borderRadius: 20, padding: "20px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 16 }}>🌙</span>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#f1f5f9" }}>Night Reflection</div>
              </div>
              {review ? (
                <div style={{ fontSize: 12, color: "#10b981", lineHeight: 1.6 }}>
                  ✓ Reflection logged successfully. 
                  <div style={{ marginTop: 6, fontStyle: "italic", color: "#64748b" }}>
                    "{review.insights}"
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.6, marginBottom: 14 }}>
                    Log energy, wins, and struggles to adapt tomorrow's cognitive load.
                  </div>
                  <button onClick={() => setShowReview(true)} style={{
                    width: "100%", padding: "11px", borderRadius: 12,
                    background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                    color: "#94a3b8", fontSize: 13, fontWeight: 600, cursor: "pointer",
                  }}>
                    Begin daily reflection
                  </button>
                </>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* ── Skip modal ── */}
      <AnimatePresence>
        {skippingId && (
          <div style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(8px)", zIndex: 100, display: "flex",
            alignItems: "center", justifyContent: "center", padding: 24,
          }}>
            <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
              style={{
                width: "100%", maxWidth: 440, background: "#0d1117",
                border: "1px solid rgba(255,255,255,0.08)", borderRadius: 24, padding: 28,
              }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#f1f5f9", marginBottom: 6 }}>Confront the obstacle</div>
              <div style={{ fontSize: 13, color: "#64748b", marginBottom: 20, lineHeight: 1.6 }}>
                Why are you skipping this task? Your answer gets logged and used for CBT calibration.
              </div>
              <form onSubmit={handleSkipSubmit}>
                <textarea rows={3} value={excuseText} onChange={(e) => setExcuseText(e.target.value)}
                  placeholder="e.g. I'm exhausted after a 9-5 shift and need to rest…"
                  style={{
                    width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 12, padding: "12px 14px", color: "#f1f5f9", fontSize: 14,
                    resize: "none", outline: "none", fontFamily: "'DM Sans', sans-serif",
                    boxSizing: "border-box", lineHeight: 1.6,
                  }} required />
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 16 }}>
                  <button type="button" onClick={() => { setSkippingId(null); setExcuseText(""); }} style={{
                    padding: "9px 18px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)",
                    background: "transparent", color: "#64748b", fontSize: 13, cursor: "pointer",
                  }}>
                    Cancel
                  </button>
                  <button type="submit" disabled={submittingExcuse} style={{
                    padding: "9px 18px", borderRadius: 10, border: "none",
                    background: "#ef4444", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer",
                    opacity: submittingExcuse ? 0.6 : 1
                  }}>
                    {submittingExcuse ? "Logging..." : "Log skip"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Bedtime Calibration / Review modal ── */}
      <AnimatePresence>
        {showReview && (
          <div style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(8px)", zIndex: 100, display: "flex",
            alignItems: "center", justifyContent: "center", padding: 24,
          }}>
            <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
              style={{
                width: "100%", maxWidth: 520, background: "#0d1117",
                border: "1px solid rgba(255,255,255,0.08)", borderRadius: 24, padding: 28,
                maxHeight: "90vh", overflowY: "auto",
              }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#f1f5f9", marginBottom: 4 }}>🌙 Bedtime Calibration</div>
              <div style={{ fontSize: 13, color: "#64748b", marginBottom: 24 }}>Your answers adapt tomorrow's mission schedule.</div>

              <form onSubmit={handleReviewSubmit}>
                {[
                  { label: "Biggest win today", key: "win", placeholder: "e.g. Solved 4 LeetCode problems with full focus" },
                  { label: "What held you back?", key: "struggle", placeholder: "e.g. Got pulled into social media after lunch" },
                ].map((f) => (
                  <div key={f.key} style={{ marginBottom: 16 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8", display: "block", marginBottom: 8, letterSpacing: "0.04em" }}>
                      {f.label}
                    </label>
                    <input value={reviewForm[f.key]} onChange={e => setReviewForm({ ...reviewForm, [f.key]: e.target.value })}
                      placeholder={f.placeholder}
                      style={{
                        width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: 12, padding: "12px 14px", color: "#f1f5f9", fontSize: 14,
                        outline: "none", fontFamily: "'DM Sans', sans-serif", boxSizing: "border-box",
                      }} required />
                  </div>
                ))}

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                  {[["energyLevel","Energy level (1–10)"],["distractionLevel","Distraction index (1–10)"]].map(([k, l]) => (
                    <div key={k}>
                      <label style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8", display: "block", marginBottom: 8 }}>{l}</label>
                      <input type="number" min={1} max={10} value={reviewForm[k]}
                        onChange={e => setReviewForm({ ...reviewForm, [k]: Number(e.target.value) })}
                        style={{
                          width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                          borderRadius: 12, padding: "12px 14px", color: "#f1f5f9", fontSize: 14,
                          outline: "none", fontFamily: "'DM Mono', monospace", boxSizing: "border-box",
                        }} required />
                    </div>
                  ))}
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8", display: "block", marginBottom: 8 }}>Bedtime reflection notes (optional)</label>
                  <textarea rows={3} value={reviewForm.reflection} onChange={e => setReviewForm({ ...reviewForm, reflection: e.target.value })}
                    placeholder="Reflect on today's cognitive patterns..."
                    style={{
                      width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 12, padding: "12px 14px", color: "#f1f5f9", fontSize: 14,
                      resize: "none", outline: "none", fontFamily: "'DM Sans', sans-serif", boxSizing: "border-box",
                    }} />
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                  <button type="button" onClick={() => setShowReview(false)} style={{
                    padding: "10px 20px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)",
                    background: "transparent", color: "#64748b", fontSize: 13, cursor: "pointer",
                  }}>
                    Cancel
                  </button>
                  <button type="submit" disabled={submittingReview} style={{
                    padding: "10px 20px", borderRadius: 10, border: "none",
                    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                    color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer",
                    opacity: submittingReview ? 0.6 : 1
                  }}>
                    {submittingReview ? "Submitting..." : "Submit reflection"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AISchedulingModal 
        isOpen={isAiModalOpen} 
        onClose={() => setIsAiModalOpen(false)} 
        onScheduleComplete={() => {
          loadDashboardData();
          reloadUser();
        }} 
      />
    </div>
  );
}
