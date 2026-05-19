import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { logFocusSession } from "../api/missions";
import { toast } from "react-hot-toast";
import { 
  Play, Pause, RotateCcw, AlertTriangle, CheckCircle2, 
  Zap, Clock, Target, Activity, Brain, ShieldCheck, Flame, Sparkles 
} from "lucide-react";

const DURATION_OPTIONS = [25, 45, 90];

export default function FocusPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // Grab active task details passed from DashboardPage
  const missionId = location.state?.missionId || null;
  const initialTitle = location.state?.title || "Deep Work Session";
  const initialDuration = location.state?.duration || 25; // default 25 min pomodoro

  const [selectedDuration, setSelectedDuration] = useState(initialDuration);
  const [secondsLeft, setSecondsLeft] = useState(initialDuration * 60);
  const [isActive, setIsActive] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [interruptions, setInterruptions] = useState(0);
  const [phase, setPhase] = useState("idle"); // idle | running | paused | done
  const intervalRef = useRef(null);

  const totalSeconds = selectedDuration * 60;
  const elapsed = totalSeconds - secondsLeft;
  const progress = totalSeconds > 0 ? elapsed / totalSeconds : 0;
  
  // Scaled circumference for massive r=140 timer
  const circumferenceScale = 2 * Math.PI * 140;
  const strokeDashoffsetScale = circumferenceScale * (1 - progress);

  useEffect(() => {
    // If initial parameters change, reset timer
    setSelectedDuration(initialDuration);
    setSecondsLeft(initialDuration * 60);
    setIsActive(false);
    setIsCompleted(false);
    setInterruptions(0);
    setPhase("idle");
  }, [initialDuration, initialTitle, missionId]);

  useEffect(() => {
    if (isActive && secondsLeft > 0) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (isActive && secondsLeft === 0) {
      handleComplete();
    }
    return () => clearInterval(intervalRef.current);
  }, [isActive, secondsLeft]);

  const handleStart = () => {
    setIsActive(true);
    setPhase("running");
  };
  const handlePause = () => {
    setIsActive(false);
    setPhase("paused");
  };
  const handleReset = () => {
    clearInterval(intervalRef.current);
    setIsActive(false);
    setIsCompleted(false);
    setSecondsLeft(selectedDuration * 60);
    setInterruptions(0);
    setPhase("idle");
  };

  const handleComplete = async () => {
    clearInterval(intervalRef.current);
    setIsActive(false);
    setIsCompleted(true);
    setPhase("done");

    const minutesFocused = Math.round(elapsed / 60) || 1;

    if (missionId) {
      try {
        await logFocusSession(missionId, minutesFocused, interruptions);
        toast.success(`Focus block locked successfully! +${minutesFocused} mins`);
      } catch (e) {
        toast.error("Failed to log focus metrics.");
      }
    } else {
      toast.success(`Completed! Great focus session of ${minutesFocused} mins.`);
    }
  };

  const selectDuration = (d) => {
    if (phase !== "idle") return;
    setSelectedDuration(d);
    setSecondsLeft(d * 60);
  };

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const timeStr = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  const focusedMins = Math.round(elapsed / 60);

  const moodColors = { idle: "#64748b", running: "#6366f1", paused: "#f59e0b", done: "#10b981" };
  const moodColor = moodColors[phase];

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

  return (
    <div className="focus-page-container" style={{
      minHeight: "100vh", background: "var(--bg-base)",
      fontFamily: "'Inter', sans-serif", color: "var(--text-main)",
      display: "flex", flexDirection: "column", position: "relative",
      transition: "background 0.5s ease"
    }}>
      {/* ── Fonts & Global Styles ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Satoshi:wght@500;700;900&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700;800&display=swap');

        /* Base Theme Variables (Dark Mode Default) */
        .focus-page-container {
          --bg-base: #080c14;
          --bg-panel: rgba(15, 23, 42, 0.65);
          --bg-card: rgba(255, 255, 255, 0.03);
          --bg-card-hover: rgba(255, 255, 255, 0.06);
          --border-color: rgba(255, 255, 255, 0.1);
          --border-card: rgba(255, 255, 255, 0.08);
          --border-card-hover: rgba(255, 255, 255, 0.18);
          --text-main: #ffffff;
          --text-sub: rgba(255, 255, 255, 0.7);
          --text-muted: rgba(255, 255, 255, 0.45);
          --shadow-panel: 0 24px 50px rgba(0, 0, 0, 0.4);
          --shadow-card: 0 8px 24px rgba(0, 0, 0, 0.2);
          --glass-blur: blur(28px);
          --accent: #6366f1;
          --accent-secondary: #8b5cf6;
          --glow: rgba(99, 102, 241, 0.3);
        }

        /* Light Mode Adaptive Variables */
        :root:not(.dark) .focus-page-container {
          --bg-base: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          --bg-panel: rgba(255, 255, 255, 0.75);
          --bg-card: rgba(255, 255, 255, 0.85);
          --bg-card-hover: rgba(255, 255, 255, 1);
          --border-color: rgba(15, 23, 42, 0.12);
          --border-card: rgba(15, 23, 42, 0.08);
          --border-card-hover: rgba(15, 23, 42, 0.22);
          --text-main: #0f172a;
          --text-sub: #475569;
          --text-muted: #64748b;
          --shadow-panel: 0 20px 40px rgba(15, 23, 42, 0.06);
          --shadow-card: 0 10px 25px rgba(15, 23, 42, 0.04);
          --glass-blur: blur(32px);
          --accent: #4f46e5;
          --accent-secondary: #7c3aed;
          --glow: rgba(79, 70, 229, 0.2);
        }

        /* Mint Green Theme Variables */
        :root[data-theme="mint"] .focus-page-container,
        .mint .focus-page-container {
          --bg-base: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
          --accent: #059669;
          --accent-secondary: #10b981;
          --glow: rgba(5, 150, 105, 0.25);
        }

        /* Pink Theme Variables */
        :root[data-theme="pink"] .focus-page-container,
        .pink .focus-page-container {
          --bg-base: linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%);
          --accent: #db2777;
          --accent-secondary: #ec4899;
          --glow: rgba(219, 39, 119, 0.25);
        }

        /* Yellow Theme Variables */
        :root[data-theme="yellow"] .focus-page-container,
        .yellow .focus-page-container {
          --bg-base: linear-gradient(135deg, #fefce8 0%, #fef9c3 100%);
          --accent: #ca8a04;
          --accent-secondary: #eab308;
          --glow: rgba(202, 138, 4, 0.25);
        }

        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: var(--border-color); border-radius: 99px; }

        @keyframes pulseGlow {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50%      { opacity: 0.9; transform: scale(1.05); }
        }
        @keyframes floatParticle {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50%      { transform: translateY(-12px) rotate(180deg); }
        }
        @keyframes rotateRing {
          0%   { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .nav-btn { background: none; border: none; cursor: pointer; font-family: 'Satoshi', sans-serif; font-size: 13px; font-weight: 500; transition: all 0.2s; padding: 6px 0; }
        .nav-btn:hover { color: var(--text-main) !important; }
        .nav-btn.active { color: var(--text-main) !important; font-weight: 700; }

        .btn-primary {
          background: linear-gradient(135deg, var(--btn-color, #6366f1), var(--accent-secondary));
          color: #ffffff !important;
          border: none;
          cursor: pointer;
          font-family: 'Satoshi', sans-serif;
          font-weight: 700;
          font-size: 16px;
          border-radius: 20px;
          height: 56px;
          padding: 0 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          box-shadow: 0 12px 32px var(--btn-glow, rgba(99,102,241,0.4));
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .btn-primary:hover {
          transform: scale(1.05) translateY(-2px);
          box-shadow: 0 16px 40px var(--btn-glow, rgba(99,102,241,0.6));
        }

        .btn-secondary {
          background: var(--bg-card);
          border: 1px solid var(--border-card);
          color: var(--text-sub);
          cursor: pointer;
          border-radius: 20px;
          width: 56px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: var(--shadow-card);
          backdrop-filter: var(--glass-blur);
        }
        .btn-secondary:hover {
          background: var(--bg-card-hover);
          color: var(--text-main);
          border-color: var(--border-card-hover);
          transform: scale(1.05) translateY(-2px);
        }

        .duration-pill {
          padding: 10px 28px;
          border-radius: 14px;
          font-family: 'JetBrains Mono', monospace;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          border: 1px solid transparent;
        }
      `}</style>

      {/* ── Dynamic Ambient Aurora Background ── */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
        <motion.div
          animate={{
            background: `radial-gradient(circle, ${moodColor}35 0%, transparent 70%)`,
            scale: [1, 1.1, 1],
            x: [0, 30, 0], y: [0, -20, 0]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute", top: "10%", left: "15%", width: "50vw", height: "50vw", borderRadius: "50%",
            filter: "blur(80px)"
          }}
        />
        <motion.div
          animate={{
            background: `radial-gradient(circle, ${phase === 'running' ? '#00d4ff' : moodColor}25 0%, transparent 70%)`,
            scale: [1, 1.15, 0.95, 1],
            x: [0, -30, 20, 0], y: [0, 30, -10, 0]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute", bottom: "10%", right: "15%", width: "55vw", height: "55vw", borderRadius: "50%",
            filter: "blur(80px)"
          }}
        />
        {/* Subtle grid mesh */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "radial-gradient(var(--border-card) 1px, transparent 1px)",
          backgroundSize: "32px 32px", opacity: 0.4
        }} />
      </div>

      {/* Nav */}
      <div style={{
        height: 56, borderBottom: "1px solid var(--border-color)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 32px", background: "var(--bg-panel)", backdropFilter: "var(--glass-blur)",
        flexShrink: 0, position: "sticky", top: 0, zIndex: 50
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 14px rgba(99,102,241,0.3)" }}>
            <Zap size={14} color="#ffffff" />
          </div>
          <span style={{ fontSize: 15, fontWeight: 800, letterSpacing: "-0.02em", fontFamily: "'Satoshi', sans-serif", color: "var(--text-main)" }}>LifeOS</span>
        </div>
        <div style={{ display: "flex", gap: 32 }}>
          {["Dashboard","Roadmap","Analytics","Coach","Focus"].map((item, i) => (
            <button key={item} onClick={() => handleNav(item)} className={`nav-btn ${i === 4 ? "active" : ""}`} style={{
              color: i === 4 ? "var(--text-main)" : "var(--text-muted)", position: "relative"
            }}>
              {item}
              {i === 4 && <span style={{ position: "absolute", bottom: -2, left: 0, right: 0, height: 2, borderRadius: 99, background: "linear-gradient(90deg, #6366f1, #8b5cf6)" }} />}
            </button>
          ))}
        </div>
        <div style={{ width: 80 }} />
      </div>

      {/* Main Content */}
      <div style={{
        flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
        padding: "48px 32px", position: "relative", zIndex: 1
      }}>
        <div style={{ 
          display: "flex", gap: 64, alignItems: "center", justifyContent: "center", 
          flexWrap: "wrap", width: "100%", maxWidth: 1200 
        }}>

          {/* ── Left Side: Massive Focus Timer & Controls ── */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{
              background: "var(--bg-panel)", backdropFilter: "var(--glass-blur)",
              border: "1px solid var(--border-color)", borderRadius: 36,
              boxShadow: "var(--shadow-panel)", padding: "48px 48px",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 36,
              flex: 1, minWidth: 340, maxWidth: 560, position: "relative", zIndex: 10
            }}
          >
            {/* Session Status Pill */}
            <div style={{ textAlign: "center" }}>
              <motion.div 
                animate={{ boxShadow: phase === 'running' ? `0 0 20px ${moodColor}40` : "none" }}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 700, letterSpacing: "0.14em",
                  textTransform: "uppercase", color: moodColor, marginBottom: 16,
                  padding: "6px 20px", background: `${moodColor}15`, borderRadius: 99,
                  border: `1px solid ${moodColor}35`, transition: "all 0.4s",
                  fontFamily: "'Satoshi', sans-serif"
                }}
              >
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: moodColor, animation: phase === 'running' ? "pulseGlow 2s infinite" : "none" }} />
                {phase === "idle" ? "System Ready" : phase === "running" ? "Deep Flow Active" : phase === "paused" ? "Session Paused" : "Protocol Complete"}
              </motion.div>
              <h1 style={{ fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 800, color: "var(--text-main)", margin: "0 0 8px", letterSpacing: "-0.02em", fontFamily: "'Satoshi', sans-serif" }}>
                {initialTitle}
              </h1>
              <p style={{ fontSize: 14, color: "var(--text-sub)", margin: 0, fontFamily: "'Inter', sans-serif" }}>
                Mute notifications · Close distracting tabs · Execute
              </p>
            </div>

            {/* Duration Selector (Rounded Segmented Controls) */}
            <div style={{ 
              display: "flex", gap: 8, background: "var(--bg-card)", border: "1px solid var(--border-card)", 
              borderRadius: 20, padding: 8, boxShadow: "var(--shadow-card)" 
            }}>
              {DURATION_OPTIONS.map((d) => {
                const isSelected = selectedDuration === d;
                return (
                  <button 
                    key={d} 
                    onClick={() => selectDuration(d)}
                    disabled={phase !== "idle"}
                    className="duration-pill"
                    style={{
                      background: isSelected ? moodColor : "transparent",
                      color: isSelected ? "#ffffff" : "var(--text-sub)",
                      borderColor: isSelected ? `${moodColor}50` : "transparent",
                      boxShadow: isSelected ? `0 8px 24px ${moodColor}50` : "none",
                      cursor: phase === "idle" ? "pointer" : "default"
                    }}
                  >
                    {d} min
                  </button>
                );
              })}
            </div>

            {/* Massive Circular Focus Timer */}
            <div style={{ position: "relative", width: 340, height: 340, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {/* Outer soft glow ring */}
              <div style={{
                position: "absolute", inset: -15, borderRadius: "50%",
                background: `radial-gradient(circle, ${moodColor}25 0%, transparent 70%)`,
                filter: "blur(20px)", animation: phase === 'running' ? "pulseGlow 3s infinite" : "none"
              }} />

              {/* SVG Ring Timer */}
              <svg width="340" height="340" style={{ transform: "rotate(-90deg)", position: "absolute", inset: 0 }}>
                {/* Track */}
                <circle cx="170" cy="170" r="140" fill="none" stroke="var(--border-card)" strokeWidth="10" />
                {/* Progress */}
                <motion.circle
                  cx="170" cy="170" r="140" fill="none"
                  stroke={moodColor} strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={circumferenceScale}
                  strokeDashoffset={strokeDashoffsetScale}
                  style={{ transition: "stroke-dashoffset 1s linear, stroke 0.5s ease" }}
                />
                {/* Tick marks */}
                {Array.from({ length: 60 }).map((_, i) => {
                  const angle = (i / 60) * 360;
                  const rad = (angle * Math.PI) / 180;
                  const isMajor = i % 5 === 0;
                  const r1 = isMajor ? 126 : 132;
                  const r2 = 140;
                  return (
                    <line key={i}
                      x1={170 + r1 * Math.cos(rad)} y1={170 + r1 * Math.sin(rad)}
                      x2={170 + r2 * Math.cos(rad)} y2={170 + r2 * Math.sin(rad)}
                      stroke={i < (progress * 60) ? moodColor : "var(--border-card-hover)"}
                      strokeWidth={isMajor ? 2.5 : 1}
                    />
                  );
                })}
              </svg>

              {/* Floating particles around active timer */}
              {phase === "running" && (
                <div style={{ position: "absolute", inset: 0, pointerEvents: "none", animation: "rotateRing 20s linear infinite" }}>
                  <span style={{ position: "absolute", top: 15, left: 170, width: 6, height: 6, borderRadius: "50%", background: moodColor, boxShadow: `0 0 12px ${moodColor}` }} />
                  <span style={{ position: "absolute", bottom: 40, right: 40, width: 4, height: 4, borderRadius: "50%", background: "#00d4ff", boxShadow: "0 0 10px #00d4ff" }} />
                </div>
              )}

              {/* Center Display */}
              <div style={{
                position: "absolute", inset: 0, display: "flex",
                flexDirection: "column", alignItems: "center", justifyContent: "center",
                zIndex: 5
              }}>
                <motion.div
                  key={timeStr}
                  animate={{ scale: phase === 'running' ? [1.02, 1] : 1 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    fontSize: 68, fontWeight: 800, letterSpacing: "-0.04em",
                    color: isCompleted ? "#10b981" : "var(--text-main)",
                    fontFamily: "'JetBrains Mono', monospace", lineHeight: 1,
                    textShadow: phase === 'running' ? `0 0 32px ${moodColor}50` : "none"
                  }}>
                  {isCompleted ? "✓" : timeStr}
                </motion.div>
                <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 12, letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: "'Satoshi', sans-serif", fontWeight: 700 }}>
                  {Math.round(progress * 100)}% complete
                </div>
              </div>
            </div>

            {/* Control Buttons */}
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <button 
                onClick={handleReset} 
                className="btn-secondary"
                title="Reset Timer"
              >
                <RotateCcw size={20} />
              </button>

              <button
                onClick={phase === "running" ? handlePause : handleStart}
                disabled={isCompleted}
                className="btn-primary"
                style={{
                  '--btn-color': isCompleted ? "#10b981" : moodColor,
                  '--btn-glow': isCompleted ? "rgba(16,185,129,0.4)" : `rgba(${moodColor === '#64748b' ? '99,102,241' : moodColor}, 0.4)`
                }}
              >
                {isCompleted ? (
                  <>
                    <CheckCircle2 size={20} />
                    <span>Session Logged</span>
                  </>
                ) : phase === "running" ? (
                  <>
                    <Pause size={20} />
                    <span>Pause Flow</span>
                  </>
                ) : phase === "paused" ? (
                  <>
                    <Play size={20} />
                    <span>Resume Flow</span>
                  </>
                ) : (
                  <>
                    <Play size={20} />
                    <span>Enter Deep Flow</span>
                  </>
                )}
              </button>

              <button 
                onClick={() => setInterruptions((p) => p + 1)} 
                className="btn-secondary"
                style={{ borderColor: "rgba(239,68,68,0.2)", color: "#ef4444" }}
                title="Log Interruption / Distraction"
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.1)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "var(--bg-card)"; }}
              >
                <AlertTriangle size={20} />
              </button>
            </div>

          </motion.div>

          {/* ── Right Side: Floating AI Insights Dashboard ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20, width: 340, minWidth: 320, flexShrink: 0, zIndex: 10 }}>

            {/* AI Cognitive Status Card */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ delay: 0.1 }}
              style={{
                background: "var(--bg-panel)", backdropFilter: "var(--glass-blur)",
                border: "1px solid var(--border-color)", borderRadius: 28,
                padding: "24px 26px", boxShadow: "var(--shadow-panel)",
                position: "relative", overflow: "hidden"
              }}
            >
              <div style={{ position: "absolute", left: 0, top: 24, bottom: 24, width: 4, borderRadius: "0 4px 4px 0", background: "linear-gradient(180deg, #00ffb4, #00d4ff)" }} />
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <Brain size={18} color="#00ffb4" />
                <span style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--text-muted)", fontFamily: "'Satoshi', sans-serif" }}>
                  AI Cognitive Status
                </span>
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: "var(--text-main)", marginBottom: 6, fontFamily: "'Satoshi', sans-serif", letterSpacing: "-0.02em" }}>
                Peak Alpha State
              </div>
              <div style={{ fontSize: 13, color: "var(--text-sub)", lineHeight: 1.6, fontFamily: "'Inter', sans-serif" }}>
                Neural entrainment optimal. Distraction resistance is currently high.
              </div>
            </motion.div>

            {/* Stats Cards */}
            {[
              { label: "Time Focused", value: `${focusedMins}m`, color: "#6366f1", icon: Clock, sub: "Session momentum active" },
              { label: "Remaining", value: `${mins}m ${String(secs).padStart(2,"0")}s`, color: "#0ea5e9", icon: Target, sub: `Target: ${selectedDuration} min` },
              { label: "Interruptions", value: interruptions, color: interruptions > 2 ? "#ef4444" : "#10b981", icon: AlertTriangle, sub: interruptions === 0 ? "Perfect zero-distraction flow" : "Friction detected" },
            ].map((s, i) => (
              <motion.div 
                key={s.label} 
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }} 
                transition={{ delay: (i + 2) * 0.07 }}
                style={{
                  background: "var(--bg-panel)", backdropFilter: "var(--glass-blur)",
                  border: "1px solid var(--border-color)", borderRadius: 24,
                  padding: "20px 24px", boxShadow: "var(--shadow-panel)",
                  position: "relative", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "space-between"
                }}
              >
                <div style={{ position: "absolute", left: 0, top: 20, bottom: 20, width: 4, borderRadius: "0 4px 4px 0", background: s.color }} />
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <s.icon size={16} color={s.color} />
                    <span style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 600, fontFamily: "'Inter', sans-serif" }}>{s.label}</span>
                  </div>
                  <span style={{ fontSize: 12, color: "var(--text-sub)", fontFamily: "'Inter', sans-serif" }}>{s.sub}</span>
                </div>
                <span style={{ fontSize: 24, fontWeight: 800, color: s.color, fontFamily: "'JetBrains Mono', monospace" }}>
                  {s.value}
                </span>
              </motion.div>
            ))}

            {/* Focus Quality Bar */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ delay: 0.4 }}
              style={{
                background: "var(--bg-panel)", backdropFilter: "var(--glass-blur)",
                border: "1px solid var(--border-color)", borderRadius: 24,
                padding: "22px 24px", boxShadow: "var(--shadow-panel)",
                position: "relative", overflow: "hidden"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.12em", fontFamily: "'Satoshi', sans-serif" }}>
                  Deep Work Quality
                </span>
                <span style={{ fontSize: 14, fontWeight: 800, color: interruptions < 3 ? "#10b981" : "#ef4444", fontFamily: "'JetBrains Mono', monospace" }}>
                  {Math.max(0, 100 - interruptions * 15)}%
                </span>
              </div>
              <div style={{ height: 8, background: "var(--border-card)", borderRadius: 99, overflow: "hidden" }}>
                <motion.div animate={{ width: `${Math.max(0, 100 - interruptions * 15)}%` }}
                  style={{ height: "100%", borderRadius: 99, background: interruptions < 3 ? "linear-gradient(90deg, #10b981, #34d399)" : "linear-gradient(90deg, #ef4444, #f87171)", transition: "all 0.4s" }} />
              </div>
              <div style={{ fontSize: 12, color: "var(--text-sub)", marginTop: 10, fontFamily: "'Inter', sans-serif", lineHeight: 1.5 }}>
                {interruptions === 0 ? "Flawless execution. Neural coherence at maximum." : interruptions < 3 ? "Solid focus state. Minor friction mitigated." : "High cognitive resistance. Recommend a short reset."}
              </div>
            </motion.div>

            {/* Early Complete Button */}
            {phase !== "idle" && !isCompleted && (
              <motion.button 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={handleComplete} 
                style={{
                  padding: "16px 24px", borderRadius: 20, border: "1px solid var(--border-card)",
                  background: "var(--bg-card)", color: "var(--text-sub)", fontSize: 14,
                  cursor: "pointer", fontWeight: 600, transition: "all 0.2s",
                  fontFamily: "'Satoshi', sans-serif", boxShadow: "var(--shadow-card)",
                  backdropFilter: "var(--glass-blur)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8
                }}
                onMouseEnter={e => { e.currentTarget.style.color = "var(--text-main)"; e.currentTarget.style.borderColor = "var(--border-card-hover)"; e.currentTarget.style.background = "var(--bg-card-hover)"; }}
                onMouseLeave={e => { e.currentTarget.style.color = "var(--text-sub)"; e.currentTarget.style.borderColor = "var(--border-card)"; e.currentTarget.style.background = "var(--bg-card)"; }}
              >
                <ShieldCheck size={18} />
                <span>Lock & Mark Complete Early</span>
              </motion.button>
            )}

            {/* Completion Celebration Card */}
            <AnimatePresence>
              {isCompleted && (
                <motion.div initial={{ opacity: 0, scale: 0.92, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: 10 }}
                  style={{
                    padding: "24px", borderRadius: 24, textAlign: "center",
                    background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.3)",
                    boxShadow: "0 12px 40px rgba(16,185,129,0.2)", backdropFilter: "var(--glass-blur)"
                  }}>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>🎯</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "#34d399", margin: "0 0 6px", fontFamily: "'Satoshi', sans-serif" }}>Protocol Complete</div>
                  <div style={{ fontSize: 13, color: "var(--text-sub)", fontFamily: "'Inter', sans-serif", lineHeight: 1.6 }}>
                    {focusedMins} minutes of elite deep work logged. {interruptions} interruptions recorded.
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>
      </div>
    </div>
  );
}
