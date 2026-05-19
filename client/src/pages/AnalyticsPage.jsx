import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { fetchAnalyticsData } from "../api/analytics";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

// ── Mock data fallbacks ──────────────────────────────────────────────────────────
const weeklyMock = [
  { date: "Mon", completed: 4, skipped: 1, focusHours: 3.2 },
  { date: "Tue", completed: 3, skipped: 2, focusHours: 2.1 },
  { date: "Wed", completed: 5, skipped: 0, focusHours: 4.5 },
  { date: "Thu", completed: 2, skipped: 3, focusHours: 1.8 },
  { date: "Fri", completed: 6, skipped: 0, focusHours: 5.0 },
  { date: "Sat", completed: 4, skipped: 1, focusHours: 3.8 },
  { date: "Sun", completed: 3, skipped: 1, focusHours: 2.5 },
];

const monthlyMock = Array.from({ length: 30 }, (_, i) => ({
  date: `${i + 1}`,
  completionRate: Math.min(100, 40 + Math.round(Math.random() * 55 + Math.sin(i / 4) * 15)),
}));

const procrastinationMock = [
  { name: "Fatigue", value: 32, fill: "#6366f1" },
  { name: "Distraction", value: 28, fill: "#8b5cf6" },
  { name: "Avoidance", value: 21, fill: "#0ea5e9" },
  { name: "Overwhelm", value: 12, fill: "#10b981" },
  { name: "Other", value: 7, fill: "#475569" },
];

const metricsMock = {
  momentumScore: 78,
  totalFocusHours: 23,
  averageEfficiency: 84,
  totalInterruptions: 11,
};

// ── Custom tooltip ────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#0f1320", border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 12, padding: "10px 14px", fontSize: 12,
    }}>
      <div style={{ color: "#94a3b8", marginBottom: 6, fontWeight: 600 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || "#6366f1", display: "flex", justifyContent: "space-between", gap: 16 }}>
          <span>{p.name || ""}</span>
          <span style={{ fontFamily: "'DM Mono', monospace", fontWeight: 700 }}>{p.value ?? ""}</span>
        </div>
      ))}
    </div>
  );
};

const gridStyle = { stroke: "rgba(255,255,255,0.04)", strokeDasharray: "0" };
const axisStyle = { fill: "#475569", fontSize: 11, fontFamily: "'DM Mono', monospace" };

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeMetric, setActiveMetric] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const stats = await fetchAnalyticsData();
        setData(stats);
      } catch (e) {
        toast.error("Failed to load performance analytics");
      } finally {
        setLoading(false);
      }
    };
    loadAnalytics();
  }, []);

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
          Querying Cognitive Matrix...
        </h2>
      </div>
    );
  }

  // Extract from loaded data or fall back to mock constants
  const weekly = data?.weekly || weeklyMock;
  const monthly = data?.monthly || monthlyMock;
  const procrastination = data?.procrastination || procrastinationMock;
  const metrics = data?.metrics || metricsMock;

  const metricCards = [
    { label: "Momentum index", value: `${metrics.momentumScore}%`, delta: "+4%", positive: true, color: "#6366f1", icon: "▲" },
    { label: "Deep work hrs", value: `${metrics.totalFocusHours}h`, delta: "+2.5h", positive: true, color: "#0ea5e9", icon: "◷" },
    { label: "Session efficiency", value: `${metrics.averageEfficiency}%`, delta: "+6%", positive: true, color: "#10b981", icon: "◈" },
    { label: "Interruptions", value: metrics.totalInterruptions, delta: "-3", positive: true, color: "#f59e0b", icon: "⚡" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#080c14", fontFamily: "'DM Sans', sans-serif", color: "#f1f5f9" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />

      {/* Nav */}
      <div style={{
        height: 56, borderBottom: "1px solid rgba(255,255,255,0.05)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 32px", background: "rgba(8,12,20,0.9)",
        backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 50,
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
              fontSize: 13, color: i === 2 ? "#f1f5f9" : "#475569", fontWeight: i === 2 ? 600 : 400,
              borderBottom: i === 2 ? "1.5px solid #6366f1" : "1.5px solid transparent", padding: "4px 0",
            }}>{item}</button>
          ))}
        </div>
        <div style={{ width: 80 }} />
      </div>

      <div style={{ maxWidth: "100%", margin: "0 auto", padding: "40px 64px 80px", width: "100%" }}>

        {/* Header */}
        <div style={{ marginBottom: 36 }}>
          <div style={{
            fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase",
            color: "#6366f1", marginBottom: 10, display: "flex", alignItems: "center", gap: 8,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#6366f1", display: "inline-block" }} />
            Performance Intelligence
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.03em", margin: "0 0 6px", color: "#f8fafc" }}>
            Cognitive Workload Analysis
          </h1>
          <p style={{ fontSize: 14, color: "#475569", margin: 0 }}>
            Deep telemetry on completions, resistance patterns, focus metrics, and energy efficiency.
          </p>
        </div>

        {/* Metric cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 32 }}>
          {metricCards.map((m, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              onClick={() => setActiveMetric(i)}
              style={{
                padding: "20px", borderRadius: 16, cursor: "pointer",
                background: activeMetric === i ? `${m.color}10` : "rgba(255,255,255,0.025)",
                border: `1px solid ${activeMetric === i ? `${m.color}30` : "rgba(255,255,255,0.05)"}`,
                transition: "all 0.2s",
              }}>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#475569", marginBottom: 10 }}>
                {m.label}
              </div>
              <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
                <span style={{ fontSize: 30, fontWeight: 700, letterSpacing: "-0.03em", color: m.color, fontFamily: "'DM Mono', monospace" }}>
                  {m.value}
                </span>
                <span style={{
                  fontSize: 11, fontWeight: 700, color: m.positive ? "#10b981" : "#ef4444",
                  background: m.positive ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
                  padding: "3px 8px", borderRadius: 99, marginBottom: 4,
                }}>
                  {m.delta} this week
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts row 1 */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20, marginBottom: 20 }}>

          {/* Stacked bar */}
          <div style={{
            background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 20, padding: "24px",
          }}>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: "#f1f5f9", letterSpacing: "-0.01em" }}>
                Weekly Task Execution
              </div>
              <div style={{ fontSize: 12, color: "#475569", marginTop: 2 }}>Completions vs skips over the last 7 days</div>
            </div>
            <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
              {[["#10b981","Completed"],["#ef4444","Skipped"]].map(([c,l]) => (
                <div key={l} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#94a3b8" }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: c }} />
                  {l}
                </div>
              ))}
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={weekly} barSize={28}>
                <CartesianGrid {...gridStyle} vertical={false} />
                <XAxis dataKey="date" tick={axisStyle} axisLine={false} tickLine={false} />
                <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="completed" name="Completed" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
                <Bar dataKey="skipped" name="Skipped" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Donut */}
          <div style={{
            background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 20, padding: "24px",
          }}>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: "#f1f5f9", letterSpacing: "-0.01em" }}>
                Resistance Map
              </div>
              <div style={{ fontSize: 12, color: "#475569", marginTop: 2 }}>Skip reason breakdown</div>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={procrastination} cx="50%" cy="50%" innerRadius={52} outerRadius={76}
                  paddingAngle={3} dataKey="value" strokeWidth={0}>
                  {procrastination.map((e, i) => <Cell key={i} fill={e.fill} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
              {procrastination.map((p, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", justifycontent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: p.fill, flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: "#94a3b8" }}>{p.name}</span>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#475569", fontFamily: "'DM Mono', monospace" }}>{p.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Charts row 2 */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

          {/* Focus area chart */}
          <div style={{
            background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 20, padding: "24px",
          }}>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: "#f1f5f9", letterSpacing: "-0.01em" }}>Focus Hours</div>
              <div style={{ fontSize: 12, color: "#475569", marginTop: 2 }}>Deep work hours per day</div>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={weekly}>
                <defs>
                  <linearGradient id="focusGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid {...gridStyle} vertical={false} />
                <XAxis dataKey="date" tick={axisStyle} axisLine={false} tickLine={false} />
                <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="focusHours" name="Focus hrs" stroke="#f59e0b"
                  strokeWidth={2} fill="url(#focusGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* 30-day trajectory */}
          <div style={{
            background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 20, padding: "24px",
          }}>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: "#f1f5f9", letterSpacing: "-0.01em" }}>30-Day Trajectory</div>
              <div style={{ fontSize: 12, color: "#475569", marginTop: 2 }}>Daily mission completion rate (%)</div>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={monthly}>
                <defs>
                  <linearGradient id="monthGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid {...gridStyle} vertical={false} />
                <XAxis dataKey="date" tick={axisStyle} axisLine={false} tickLine={false} interval={6} />
                <YAxis tick={axisStyle} axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="completionRate" name="Completion %" stroke="#6366f1"
                  strokeWidth={2} fill="url(#monthGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
