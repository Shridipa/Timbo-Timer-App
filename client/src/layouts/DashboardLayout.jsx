import React, { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Home, Calendar, Bot, Play, BarChart2, Settings, User, 
  Sparkles, Palette, Sliders, Volume2, Check, LogOut, X, 
  HelpCircle, ChevronLeft, ChevronRight, Award, Flame, Star, Compass
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme, themeStyles } from "../context/ThemeContext";
import { startReminderService, stopReminderService } from "../services/notificationService";
import { toast } from "react-hot-toast";

// ── Floating Navigation Config ──────────────────────────────────────────────
const DOCK_ITEMS = [
  { name: "Home", path: "/", icon: Home },
  { name: "Roadmap", path: "/roadmap", icon: Compass },
  { name: "Calendar", path: "/calendar", icon: Calendar },
  { name: "Focus Arena", path: "/focus", icon: Play },
  { name: "Analytics", path: "/analytics", icon: BarChart2 },
  { name: "AI Coach", path: "/coach", icon: Bot },
];

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    theme, setTheme, themeDetails, isDarkMode, 
    isSettingsOpen, setIsSettingsOpen,
    isCommandDockOpen, setIsCommandDockOpen 
  } = useTheme();

  const [hoveredNav, setHoveredNav] = useState(null);
  const [showLeftPanel, setShowLeftPanel] = useState(false);
  const [showRightPanel, setShowRightPanel] = useState(false);
  const [isThemePanelOpen, setIsThemePanelOpen] = useState(false);
  
  // Floating AI command text
  const [commandInput, setCommandInput] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [loadingAi, setLoadingAi] = useState(false);

  // Sync notification reminders
  useEffect(() => {
    if (user) {
      startReminderService(user._id);
    }
    return () => {
      stopReminderService();
    };
  }, [user]);

  const handleSignOut = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (e) {
      toast.error("Logout failed");
    }
  };

  const handleQuickCommandSubmit = async (e) => {
    e.preventDefault();
    if (!commandInput.trim()) return;
    setLoadingAi(true);
    setAiResponse("");

    // Strategic mock AI coaching responses triggered from global command dock
    try {
      await new Promise((r) => setTimeout(r, 1500));
      const queries = [
        "Focus on high-leverage Dynamic Programming algorithms today. Keep distractions low.",
        "Your momentum index is solid at 78%. Lock in a 45-minute focus session to sustain it.",
        "Procrastination indicators highlight skipped sessions after lunch. Try shifting deep work blocks to early morning.",
        "Acknowledge the stress levels. Schedule a 20-minute restorative break between DSA sets."
      ];
      const randomReply = queries[Math.floor(Math.random() * queries.length)];
      setAiResponse(randomReply);
    } catch (err) {
      setAiResponse("System calibration active. Log focus logs to align strategy models.");
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--background)",
      color: "var(--foreground)",
      fontFamily: "'DM Sans', sans-serif",
      position: "relative",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
    }}>
      
      {/* ── Immersive Ambient Background Engine ── */}
      <div className="ambient-lighting">
        {/* Animated fluid gradient background blobs */}
        <motion.div 
          animate={{
            x: [0, 40, -20, 0],
            y: [0, -30, 20, 0],
            scale: [1, 1.1, 0.95, 1],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="ambient-orb"
          style={{ top: "10%", left: "15%", width: 600, height: 600 }}
        />
        <motion.div 
          animate={{
            x: [0, -30, 40, 0],
            y: [0, 20, -30, 0],
            scale: [1, 0.9, 1.15, 1],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="ambient-orb"
          style={{ bottom: "15%", right: "10%", width: 500, height: 500 }}
        />
        {/* Cinematic Grid Texture */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "radial-gradient(var(--card-border) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          opacity: isDarkMode ? 0.35 : 0.15,
          pointerEvents: "none",
        }} />
      </div>

      {/* ── Left Side Hover-Panel: Quick Analytics ── */}
      <div 
        onMouseEnter={() => setShowLeftPanel(true)}
        onMouseLeave={() => setShowLeftPanel(false)}
        style={{
          position: "fixed", left: 0, top: "10%", bottom: "15%", width: 280,
          zIndex: 40, transform: showLeftPanel ? "translateX(0)" : "translateX(-240px)",
          transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
          display: "flex", alignItems: "center"
        }}
      >
        <div className="glass" style={{
          width: "100%", height: "100%", borderRadius: "0 24px 24px 0",
          padding: "24px 20px", display: "flex", flexDirection: "column", gap: 20,
          position: "relative"
        }}>
          {/* Panel tab handle */}
          <div style={{
            position: "absolute", right: -24, top: "50%", transform: "translateY(-50%)",
            width: 24, height: 64, background: "var(--card-bg)", border: "1px solid var(--card-border)",
            borderLeft: "none", borderRadius: "0 12px 12px 0", display: "flex",
            alignItems: "center", justifyContent: "center", cursor: "pointer",
            boxShadow: "4px 0 16px rgba(0,0,0,0.05)"
          }}>
            <ChevronRight size={14} style={{ color: "var(--primary)", transform: showLeftPanel ? "rotate(180deg)" : "none" }} />
          </div>

          <div>
            <h3 style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--primary)" }}>
              Accountability State
            </h3>
            <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>Live cognitive workspace logs</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div style={{ background: "rgba(255,255,255,0.03)", padding: 12, borderRadius: 12, border: "1px solid var(--card-border)", textAlign: "center" }}>
              <span style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase" }}>Momentum</span>
              <h4 style={{ fontSize: 22, fontWeight: 800, color: "var(--primary)", marginTop: 4 }}>{user?.momentumScore || 78}%</h4>
            </div>
            <div style={{ background: "rgba(255,255,255,0.03)", padding: 12, borderRadius: 12, border: "1px solid var(--card-border)", textAlign: "center" }}>
              <span style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase" }}>Points</span>
              <h4 style={{ fontSize: 22, fontWeight: 800, color: "var(--primary)", marginTop: 4 }}>{user?.points || 0} XP</h4>
            </div>
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--muted)", marginBottom: 6 }}>
              <span>XP Level progress</span>
              <span>{(user?.points || 0) % 100}/100</span>
            </div>
            <div style={{ height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 99, overflow: "hidden" }}>
              <div style={{ height: "100%", background: "var(--primary)", width: `${(user?.points || 0) % 100}%` }} />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { label: "Active User", val: user?.name || "Timbo", icon: User },
              { label: "Account Status", val: "LifeOS Pro", icon: Star },
              { label: "Level Tracker", val: `Level ${user?.level || 1}`, icon: Award },
            ].map((i) => (
              <div key={i.label} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12 }}>
                <i.icon size={14} style={{ color: "var(--primary)" }} />
                <span style={{ color: "var(--muted)" }}>{i.label}:</span>
                <span style={{ fontWeight: 600, marginLeft: "auto" }}>{i.val}</span>
              </div>
            ))}
          </div>

          <button onClick={handleSignOut} style={{
            marginTop: "auto", width: "100%", padding: "10px", borderRadius: 12,
            background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)",
            color: "#ef4444", fontSize: 12, fontWeight: 600, display: "flex",
            alignItems: "center", justifyContent: "center", gap: 8, cursor: "pointer"
          }}>
            <LogOut size={13} />
            <span>Sign Out Session</span>
          </button>
        </div>
      </div>

      {/* ── Right Side Hover-Panel: Strategic Recommendations ── */}
      <div 
        onMouseEnter={() => setShowRightPanel(true)}
        onMouseLeave={() => setShowRightPanel(false)}
        style={{
          position: "fixed", right: 0, top: "10%", bottom: "15%", width: 280,
          zIndex: 40, transform: showRightPanel ? "translateX(0)" : "translateX(240px)",
          transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
          display: "flex", alignItems: "center"
        }}
      >
        <div className="glass" style={{
          width: "100%", height: "100%", borderRadius: "24px 0 0 24px",
          padding: "24px 20px", display: "flex", flexDirection: "column", gap: 20,
          position: "relative"
        }}>
          {/* Panel tab handle */}
          <div style={{
            position: "absolute", left: -24, top: "50%", transform: "translateY(-50%)",
            width: 24, height: 64, background: "var(--card-bg)", border: "1px solid var(--card-border)",
            borderRight: "none", borderRadius: "12px 0 0 12px", display: "flex",
            alignItems: "center", justifyContent: "center", cursor: "pointer",
            boxShadow: "-4px 0 16px rgba(0,0,0,0.05)"
          }}>
            <ChevronLeft size={14} style={{ color: "var(--primary)", transform: showRightPanel ? "rotate(180deg)" : "none" }} />
          </div>

          <div>
            <h3 style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--primary)" }}>
              Strategic Intel
            </h3>
            <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>AI-driven recommendations</p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              "Avoid skipping tree recursion blocks.",
              "DP skip spikes on afternoons.",
              "Mock sessions lower FAANG anxiety.",
              "Compounding focus triggers level shifts."
            ].map((p, index) => (
              <div key={index} style={{
                background: "rgba(255,255,255,0.02)", border: "1px solid var(--card-border)",
                padding: "10px 12px", borderRadius: 10, fontSize: 12, lineHeight: 1.5,
                display: "flex", gap: 8, color: "var(--muted)"
              }}>
                <span style={{ color: "var(--primary)" }}>◈</span>
                <span>{p}</span>
              </div>
            ))}
          </div>

          <div style={{
            marginTop: "auto", background: "var(--primary-glow)", border: "1px solid var(--card-border)",
            padding: 16, borderRadius: 16, textAlign: "center"
          }}>
            <Sparkles size={20} style={{ color: "var(--primary)", margin: "0 auto 8px" }} />
            <h4 style={{ fontSize: 13, fontWeight: 700, color: "var(--foreground)" }}>Need Coaching?</h4>
            <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 4, lineHeight: 1.5 }}>
              Click the floating AI Command Dock below to ask our strategist a fast query!
            </p>
          </div>
        </div>
      </div>

      {/* ── Dynamic Workspace (Edge-to-Edge Main Outlet) ── */}
      <main style={{
        flex: 1,
        width: "100vw",
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",
        zIndex: 10,
        paddingBottom: 110, /* Buffer for the bottom navigation bar */
      }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            style={{ width: "100%", minHeight: "100%", display: "flex", flexDirection: "column", flex: 1 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* ── Bottom Floating Navigation Dock ── */}
      <div style={{
        position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)",
        zIndex: 50, width: "auto", display: "flex", gap: 8, alignItems: "center"
      }}>
        {/* Navigation capsule */}
        <div className="glass" style={{
          padding: "6px 14px", borderRadius: "99px", display: "flex",
          gap: 6, alignItems: "center", boxShadow: "0 12px 40px rgba(0,0,0,0.25)"
        }}>
          {DOCK_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.name}
                onClick={() => navigate(item.path)}
                onMouseEnter={() => setHoveredNav(item.name)}
                onMouseLeave={() => setHoveredNav(null)}
                style={{
                  width: 42, height: 42, borderRadius: "50%", border: "none",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", position: "relative",
                  background: isActive ? "var(--primary)" : "transparent",
                  color: isActive ? "#ffffff" : "var(--foreground)",
                  transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)"
                }}
              >
                <item.icon size={18} style={{ 
                  filter: isActive ? "drop-shadow(0 2px 8px rgba(255,255,255,0.4))" : "none",
                  transition: "transform 0.2s ease"
                }} />

                {/* Animated active bar */}
                {isActive && (
                  <motion.div 
                    layoutId="activeDockDot"
                    style={{
                      position: "absolute", bottom: -2, width: 4, height: 4,
                      borderRadius: "50%", background: "#ffffff"
                    }}
                  />
                )}

                {/* Text tooltip on hover */}
                <AnimatePresence>
                  {hoveredNav === item.name && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: -45, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      style={{
                        position: "absolute", background: "var(--glass-bg)",
                        border: "1px solid var(--card-border)", color: "var(--foreground)",
                        padding: "4px 10px", borderRadius: 8, fontSize: 11,
                        fontWeight: 600, whiteSpace: "nowrap", pointerEvents: "none",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
                      }}
                    >
                      {item.name}
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            );
          })}

          <div style={{ width: 1, height: 20, background: "var(--card-border)", margin: "0 4px" }} />

          {/* Quick strategic prompt command button */}
          <button
            onClick={() => setIsCommandDockOpen(true)}
            style={{
              width: 42, height: 42, borderRadius: "50%", border: "none",
              background: "var(--primary-glow)", color: "var(--primary)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", transition: "all 0.2s"
            }}
            title="Open strategic command dock"
            onMouseEnter={e => e.currentTarget.style.transform = "scale(1.08)"}
            onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
          >
            <Sparkles size={18} style={{ margin: "0 auto" }} />
          </button>

          {/* Settings Drawer trigger */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            style={{
              width: 42, height: 42, borderRadius: "50%", border: "none",
              background: "transparent", color: "var(--foreground)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", transition: "all 0.2s"
            }}
            title="Preferences"
          >
            <Settings size={18} style={{ margin: "0 auto" }} />
          </button>
        </div>
      </div>

      {/* ── Immersive Floating Theme Switcher Orb ── */}
      <div style={{
        position: "fixed", bottom: 28, right: 28, zIndex: 50
      }}>
        <div style={{ position: "relative" }}>
          {/* Main trigger Orb */}
          <button
            onClick={() => setIsThemePanelOpen(!isThemePanelOpen)}
            style={{
              width: 46, height: 46, borderRadius: "50%",
              background: "linear-gradient(135deg, var(--primary), #8b5cf6)",
              border: "1px solid var(--card-border)",
              boxShadow: "0 8px 30px var(--primary-glow)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", cursor: "pointer", transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
            }}
            onMouseEnter={e => e.currentTarget.style.transform = "scale(1.08)"}
            onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
          >
            <Palette size={20} />
          </button>

          {/* Expanded color palette of all 8 themes */}
          <AnimatePresence>
            {isThemePanelOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.85, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: -10 }}
                exit={{ opacity: 0, scale: 0.85, y: 15 }}
                style={{
                  position: "absolute", bottom: "100%", right: 0,
                  background: "var(--glass-bg)", border: "1px solid var(--card-border)",
                  borderRadius: 20, padding: 12, display: "grid", gridTemplateColumns: "1fr 1fr",
                  gap: 8, width: 220, boxShadow: "0 10px 32px rgba(0,0,0,0.2)"
                }}
              >
                <div style={{ gridColumn: "span 2", fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "var(--primary)", marginBottom: 4, letterSpacing: "0.08em" }}>
                  Select UI Theme
                </div>
                {Object.entries(themeStyles).map(([key, value]) => {
                  const isActive = theme === key;
                  return (
                    <button
                      key={key}
                      onClick={() => {
                        setTheme(key);
                        setIsThemePanelOpen(false);
                      }}
                      style={{
                        padding: "8px", borderRadius: 10, border: "1px solid var(--card-border)",
                        background: isActive ? "var(--primary-glow)" : "rgba(255,255,255,0.03)",
                        display: "flex", alignItems: "center", gap: 8, cursor: "pointer",
                        width: "100%", transition: "all 0.15s"
                      }}
                    >
                      <span style={{
                        width: 14, height: 14, borderRadius: "50%",
                        background: `linear-gradient(135deg, ${value.primary}, ${value.primary}90)`,
                        display: "inline-block", flexShrink: 0
                      }} />
                      <span style={{ fontSize: 11, color: "var(--foreground)", fontWeight: isActive ? 600 : 400, whiteSpace: "nowrap" }}>
                        {value.name.replace(" Mode", "")}
                      </span>
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Global Slide-Up Strategic AI Command Dock Overlay ── */}
      <AnimatePresence>
        {isCommandDockOpen && (
          <div style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(8px)", zIndex: 100, display: "flex",
            alignItems: "flex-end", justifyContent: "center"
          }}>
            {/* Modal backdrop closer */}
            <div 
              onClick={() => {
                setIsCommandDockOpen(false);
                setAiResponse("");
                setCommandInput("");
              }}
              style={{ position: "absolute", inset: 0 }} 
            />

            <motion.div
              initial={{ y: "100%", opacity: 0.9 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0.9 }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="glass"
              style={{
                width: "100%", maxWidth: 640, borderRadius: "24px 24px 0 0",
                padding: "28px 32px 40px", position: "relative", zIndex: 110,
                borderBottom: "none"
              }}
            >
              <button 
                onClick={() => {
                  setIsCommandDockOpen(false);
                  setAiResponse("");
                  setCommandInput("");
                }}
                style={{
                  position: "absolute", top: 20, right: 20, background: "transparent",
                  border: "none", color: "var(--muted)", cursor: "pointer"
                }}
              >
                <X size={20} />
              </button>

              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <Bot size={22} style={{ color: "var(--primary)" }} />
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--foreground)" }}>Strategic command prompt</h3>
                <span style={{ fontSize: 10, background: "var(--primary-glow)", color: "var(--primary)", padding: "2px 8px", borderRadius: 99, fontWeight: 700, textTransform: "uppercase" }}>
                  Gemini Active
                </span>
              </div>
              <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 20 }}>
                Prompt the strategic coach directly from any page in the workspace to adapt your timeline logs.
              </p>

              <form onSubmit={handleQuickCommandSubmit} style={{ display: "flex", gap: 10, marginBottom: 20 }}>
                <input
                  value={commandInput}
                  onChange={(e) => setCommandInput(e.target.value)}
                  placeholder="e.g. Why am I procrastinating DP sessions after lunch?"
                  style={{
                    flex: 1, padding: "14px 18px", borderRadius: 14,
                    background: "rgba(255,255,255,0.03)", border: "1px solid var(--card-border)",
                    color: "var(--foreground)", fontSize: 14, outline: "none"
                  }}
                  required
                />
                <button
                  type="submit"
                  disabled={loadingAi}
                  style={{
                    padding: "0 24px", borderRadius: 14, border: "none",
                    background: "linear-gradient(135deg, var(--primary), #8b5cf6)",
                    color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer",
                    opacity: loadingAi ? 0.6 : 1
                  }}
                >
                  {loadingAi ? "Strategizing..." : "Ask Coach"}
                </button>
              </form>

              {/* Response window */}
              <AnimatePresence mode="wait">
                {(loadingAi || aiResponse) && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    style={{
                      background: "rgba(255,255,255,0.02)", border: "1px solid var(--card-border)",
                      padding: "16px 20px", borderRadius: 16, fontSize: 13, lineHeight: 1.6
                    }}
                  >
                    {loadingAi ? (
                      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        {[0, 1, 2].map((d) => (
                          <motion.span 
                            key={d}
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 1, repeat: Infinity, delay: d * 0.2 }}
                            style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--primary)", display: "inline-block" }}
                          />
                        ))}
                        <span style={{ fontSize: 12, color: "var(--muted)", marginLeft: 6 }}>Strategic model processing...</span>
                      </div>
                    ) : (
                      <div>
                        <strong style={{ color: "var(--primary)", display: "block", marginBottom: 4 }}>Coach Strategic Insight:</strong>
                        <span style={{ color: "var(--foreground)" }}>{aiResponse}</span>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Dynamic Preferences / Settings Side Drawer ── */}
      <AnimatePresence>
        {isSettingsOpen && (
          <div style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(6px)", zIndex: 100, display: "flex",
            justifyContent: "flex-end"
          }}>
            {/* Backdrop click closer */}
            <div onClick={() => setIsSettingsOpen(false)} style={{ position: "absolute", inset: 0 }} />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="glass"
              style={{
                width: "100%", maxWidth: 360, height: "100%", padding: 32,
                position: "relative", zIndex: 110, display: "flex",
                flexDirection: "column", gap: 24, borderRadius: "24px 0 0 24px",
                borderRight: "none"
              }}
            >
              <button 
                onClick={() => setIsSettingsOpen(false)}
                style={{
                  position: "absolute", top: 24, right: 24, background: "transparent",
                  border: "none", color: "var(--muted)", cursor: "pointer"
                }}
              >
                <X size={20} />
              </button>

              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Sliders size={20} style={{ color: "var(--primary)" }} />
                <h3 style={{ fontSize: 16, fontWeight: 700 }}>Workspace Controls</h3>
              </div>

              {/* Setting details */}
              <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 10 }}>
                
                {/* Section: AI Strategist calibration */}
                <div>
                  <h4 style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--primary)", marginBottom: 12 }}>
                    AI Strategist Model
                  </h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <div style={{
                      padding: 12, background: "rgba(255,255,255,0.03)", border: "1px solid var(--card-border)",
                      borderRadius: 12, display: "flex", justifyContent: "space-between", alignItems: "center"
                    }}>
                      <div style={{ fontSize: 12 }}>
                        <div>Google Gemini 1.5</div>
                        <div style={{ fontSize: 10, color: "var(--muted)" }}>Active Strategic engine</div>
                      </div>
                      <Check size={16} style={{ color: "var(--primary)" }} />
                    </div>
                  </div>
                </div>

                {/* Section: Notifications */}
                <div>
                  <h4 style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--primary)", marginBottom: 12 }}>
                    Task reminders
                  </h4>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13 }}>
                    <div>
                      <span>Task Alarm Services</span>
                      <div style={{ fontSize: 10, color: "var(--muted)" }}>Remind scheduled deep work</div>
                    </div>
                    {/* Toggle button */}
                    <div style={{
                      width: 44, height: 22, borderRadius: 99, background: "var(--primary)",
                      padding: 2, display: "flex", alignItems: "center", justifyContent: "flex-end",
                      cursor: "pointer"
                    }}>
                      <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#fff" }} />
                    </div>
                  </div>
                </div>

                {/* Section: Focus Settings */}
                <div>
                  <h4 style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--primary)", marginBottom: 12 }}>
                    Focus tuning
                  </h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13 }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "var(--muted)" }}>Default Pomodoro</span>
                      <span>25 minutes</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "var(--muted)" }}>Long Focus Sprint</span>
                      <span>90 minutes</span>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{
                marginTop: "auto", background: "rgba(255,255,255,0.02)", border: "1px solid var(--card-border)",
                padding: 16, borderRadius: 16, fontSize: 11, lineHeight: 1.5, color: "var(--muted)",
                textAlign: "center"
              }}>
                <Volume2 size={16} style={{ color: "var(--primary)", margin: "0 auto 8px" }} />
                <span>LifeOS AI system controls auto-sync logs every 60 seconds with Mongoose servers.</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
