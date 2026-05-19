import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import ReactMarkdown from "react-markdown";
import { 
  Send, Sparkles, Mic, Paperclip, Activity, Brain, ShieldAlert, Zap, 
  Compass, RefreshCw, ChevronDown, Calendar, Play, Settings, Flame, 
  TrendingUp, ShieldCheck 
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { generateCoachReply } from "../ai/coach/generateCoachReply";
import { coachMemory } from "../store/coachMemory";

const INITIAL_MESSAGES = [
  {
    role: "assistant",
    type: "coaching",
    title: "System Online",
    content: "Hey — I'm your Cognitive Strategist. I've loaded your active roadmap and live consistency telemetry.\n\nHow can I help you optimize your focus today?",
    nextAction: "Select a mode below or type what's on your mind."
  },
];

const MODES = ["Strategist Mode", "Therapist-lite", "Deep Focus", "Burnout Recovery"];

const CARD_THEMES = {
  burnout:    { bg: "rgba(255,80,80,0.06)",    border: "rgba(255,100,100,0.25)", glow: "rgba(255,80,80,0.12)",   accent: "var(--accent-red)", Icon: ShieldAlert },
  motivation: { bg: "rgba(0,255,180,0.05)",    border: "rgba(0,255,180,0.25)",  glow: "rgba(0,255,180,0.12)",   accent: "var(--accent-green)", Icon: Zap },
  self_doubt: { bg: "rgba(160,100,255,0.06)",  border: "rgba(160,100,255,0.25)",glow: "rgba(160,100,255,0.12)", accent: "var(--accent-purple)", Icon: Brain },
  coaching:   { bg: "rgba(0,212,255,0.05)",    border: "rgba(0,212,255,0.22)",  glow: "rgba(0,212,255,0.10)",   accent: "var(--accent-cyan)", Icon: Compass },
};

export default function CoachPage() {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentMode, setCurrentMode] = useState("Strategist Mode");
  const [modeOpen, setModeOpen] = useState(false);
  const [liveEmotion, setLiveEmotion] = useState("Focused • Medium Stress • Stable Momentum");
  
  // Voice Reflection State
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const [voiceSeconds, setVoiceSeconds] = useState(0);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const voiceIntervalRef = useRef(null);
  
  // Rotating placeholders for the futuristic input console
  const placeholders = [
    "What's blocking your progress right now?",
    "Why are you avoiding your next deep work task?",
    "Optimize my upcoming week intelligently...",
    "Analyze my recent burnout and skip patterns..."
  ];
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  const bottomRef = useRef(null);
  const textareaRef = useRef(null);
  const navigate = useNavigate();
  const memory = coachMemory.getMemory();

  // Voice recording handlers
  const handleStartVoice = () => {
    setIsVoiceRecording(true);
    setVoiceSeconds(0);
    setVoiceTranscript("Listening to voice reflection... Speak your thoughts clearly.");
    
    const mockTranscripts = [
      "I've been feeling incredibly overwhelmed with Dynamic Programming...",
      "I've been feeling incredibly overwhelmed with Dynamic Programming and my energy drops completely by 3 PM...",
      "I've been feeling incredibly overwhelmed with Dynamic Programming and my energy drops completely by 3 PM. I keep avoiding the sliding window problems."
    ];
    
    let step = 0;
    voiceIntervalRef.current = setInterval(() => {
      setVoiceSeconds(prev => prev + 1);
      if (step < mockTranscripts.length) {
        setVoiceTranscript(mockTranscripts[step]);
        step++;
      }
    }, 2500);
  };

  const handleStopVoice = () => {
    clearInterval(voiceIntervalRef.current);
    setIsVoiceRecording(false);
    if (voiceTranscript && !voiceTranscript.includes("Listening")) {
      setInput(voiceTranscript);
      toast.success("Voice reflection transcribed & resistance patterns mapped!");
    } else {
      toast.error("Voice reflection too short.");
    }
  };

  const handleCancelVoice = () => {
    clearInterval(voiceIntervalRef.current);
    setIsVoiceRecording(false);
    toast.error("Voice reflection cancelled.");
  };

  // Auto-scroll chat
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Rotate AI input hints
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex(prev => (prev + 1) % placeholders.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + "px";
    }
  }, [input]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", content: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    const placeholder = { role: "assistant", type: "coaching", content: "", streaming: true };
    setMessages(prev => [...prev, placeholder]);

    try {
      const finalReply = await generateCoachReply(userMsg.content, (chunk) => {
        setMessages(prev => {
          const n = [...prev];
          n[n.length - 1] = { ...chunk, streaming: true };
          return n;
        });
        if (chunk.emotionDetected === "burnout") setLiveEmotion("Exhausted • High Stress • Critical Recovery Needed");
        else if (chunk.emotionDetected === "self_doubt") setLiveEmotion("Anxious • Low Confidence • Reassurance Required");
        else if (chunk.emotionDetected === "procrastination") setLiveEmotion("Avoidant • High Friction • Micro-Action Needed");
        else setLiveEmotion("Focused • Medium Stress • Stable Momentum");
      });
      setMessages(prev => {
        const n = [...prev];
        n[n.length - 1] = { ...finalReply, streaming: false };
        return n;
      });
    } catch {
      toast.error("Cognitive Engine offline. Retrying...");
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  const getSuggestions = () => {
    if (liveEmotion.includes("Exhausted")) return ["Reduce today's workload", "Explain why I feel exhausted", "Build recovery schedule"];
    if (liveEmotion.includes("Anxious")) return ["Help me rebuild confidence", "Why is everyone ahead of me?", "Break my next task down"];
    if (liveEmotion.includes("Avoidant")) return ["I can't start my work", "I'm endlessly scrolling", "Give me a 5-min micro-action"];
    return ["Analyze my procrastination", "Optimize my schedule", "Why am I losing focus?", "Build my recovery plan", "Analyze burnout risk"];
  };

  const emotionColor = liveEmotion.includes("Exhausted") ? "var(--accent-red)" : liveEmotion.includes("Anxious") ? "var(--accent-purple)" : "var(--accent-green)";
  const navItems = ["Dashboard", "Roadmap", "Analytics", "Coach", "Focus"];

  const telemetryMetrics = [
    { label: "Momentum Score", value: `${memory.momentumScore || 82}%`, sub: "↑ +4 streak", color: "var(--accent-green)", icon: TrendingUp, progress: memory.momentumScore || 82, grad: "linear-gradient(90deg, var(--accent-green), var(--accent-cyan))" },
    { label: "Burnout Risk", value: liveEmotion.includes("Exhausted") ? "Critical" : memory.burnoutHistory || "Moderate", sub: liveEmotion.includes("Exhausted") ? "Rest needed" : "Stable load", color: liveEmotion.includes("Exhausted") ? "var(--accent-red)" : "var(--accent-orange)", icon: ShieldAlert, progress: liveEmotion.includes("Exhausted") ? 90 : 35, grad: liveEmotion.includes("Exhausted") ? "linear-gradient(90deg, var(--accent-red), #ff8f8f)" : "linear-gradient(90deg, var(--accent-orange), #fbbf24)" },
    { label: "Cognitive Weakness", value: memory.recentStruggles?.[0] || "Procrastination", sub: "High friction", color: "var(--accent-purple)", icon: Brain, progress: 65, grad: "linear-gradient(90deg, var(--accent-purple), #d4a5ff)" },
    { label: "Focus State", value: liveEmotion.split("•")[0].trim() || "Deep Focus", sub: "Alpha waves active", color: "var(--accent-cyan)", icon: Activity, progress: 88, grad: "linear-gradient(90deg, var(--accent-cyan), var(--accent-green))" },
    { label: "Execution Consistency", value: "88%", sub: "Top 12% tier", color: "var(--accent-purple)", icon: ShieldCheck, progress: 88, grad: "linear-gradient(90deg, var(--accent-purple), #ec4899)" },
    { label: "Resistance Patterns", value: "Afternoon Slump", sub: "Post-lunch dip", color: "#ec4899", icon: RefreshCw, progress: 45, grad: "linear-gradient(90deg, #ec4899, #f43f5e)" },
    { label: "Streak Intelligence", value: "5 Days Active", sub: "Compounding wins", color: "var(--accent-orange)", icon: Flame, progress: 100, grad: "linear-gradient(90deg, var(--accent-orange), #ef4444)" }
  ];

  const dockIcons = [
    { name: "Roadmap", path: "/roadmap", icon: Compass },
    { name: "Calendar", path: "/calendar", icon: Calendar },
    { name: "Deep Work", path: "/focus", icon: Play },
    { name: "Analytics", path: "/analytics", icon: Activity },
    { name: "Coach", path: "/coach", icon: Brain },
    { name: "Settings", path: "/settings", icon: Settings }
  ];

  const renderCard = (msg) => {
    const theme = CARD_THEMES[msg.type] || CARD_THEMES.coaching;
    const { Icon, accent, border, glow } = theme;
    return (
      <div style={{
        background: "var(--bg-card)", border: "1px solid var(--border-color)",
        boxShadow: `0 16px 40px ${glow}, inset 0 1px 0 rgba(255,255,255,0.05)`,
        borderRadius: 28, padding: "28px 32px", width: "100%", backdropFilter: "var(--glass-blur)",
        position: "relative", overflow: "hidden"
      }}>
        <div style={{ position: "absolute", left: 0, top: 24, bottom: 24, width: 4, borderRadius: "0 4px 4px 0", background: `linear-gradient(180deg, ${accent}, transparent)` }} />

        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 12,
            background: `rgba(255,255,255,0.05)`, border: `1px solid ${border}`,
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
          }}>
            <Icon size={18} color={accent} />
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: accent, fontFamily: "'Space Mono', monospace" }}>
            {msg.title || "Cognitive Insight"}
          </span>
          {msg.streaming && (
            <span style={{ display: "flex", gap: 4, marginLeft: "auto" }}>
              {[0, 0.15, 0.3].map((d, i) => (
                <span key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: accent, animation: `bounce 1.2s ${d}s infinite` }} />
              ))}
            </span>
          )}
        </div>

        <div className="coach-prose" style={{ paddingLeft: 2, marginBottom: msg.nextAction ? 24 : 0 }}>
          <ReactMarkdown>
            {msg.content}
          </ReactMarkdown>
        </div>

        {msg.nextAction && (
          <div style={{
            background: "var(--bg-card)", border: `1px solid var(--border-color)`,
            borderRadius: 20, padding: "18px 22px", display: "flex", gap: 16, alignItems: "flex-start",
            marginTop: 20, boxShadow: "var(--shadow-card)"
          }}>
            <Sparkles size={18} color={accent} style={{ marginTop: 2, flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--text-muted)", marginBottom: 6, fontFamily: "'Space Mono', monospace" }}>
                Next Action Protocol
              </div>
              <div style={{ fontSize: 15, color: "var(--text-main)", fontWeight: 600, fontFamily: "'Inter', sans-serif", lineHeight: 1.6 }}>{msg.nextAction}</div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="coach-page-container" style={{ minHeight: "100vh", background: "var(--bg-base)", fontFamily: "'Inter', sans-serif", display: "flex", flexDirection: "column", position: "relative", color: "var(--text-main)", transition: "background 0.4s ease" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&family=Inter:wght@300;400;500;600;700&display=swap');
        .coach-page-container {
          --bg-base: #080c14;
          --bg-panel: rgba(15, 23, 42, 0.65);
          --bg-card: rgba(255, 255, 255, 0.03);
          --bg-card-hover: rgba(255, 255, 255, 0.06);
          --bg-input: rgba(10, 15, 28, 0.85);
          --border-color: rgba(255, 255, 255, 0.1);
          --border-card: rgba(255, 255, 255, 0.08);
          --border-card-hover: rgba(255, 255, 255, 0.18);
          --text-main: #ffffff;
          --text-sub: rgba(255, 255, 255, 0.85);
          --text-muted: rgba(255, 255, 255, 0.6);
          --shadow-panel: 0 24px 50px rgba(0, 0, 0, 0.4);
          --shadow-card: 0 8px 24px rgba(0, 0, 0, 0.2);
          --shadow-input: 0 24px 64px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.08), 0 10px 30px rgba(0, 255, 180, 0.1);
          --glass-blur: blur(24px);
          --accent-green: #00ffb4;
          --accent-cyan: #00d4ff;
          --accent-purple: #b07fff;
          --accent-red: #ff6b6b;
          --accent-orange: #f59e0b;
        }
        :root:not(.dark) .coach-page-container {
          --bg-base: linear-gradient(135deg, #f0fdf4 0%, #f8fafc 50%, #f1f5f9 100%);
          --bg-panel: rgba(255, 255, 255, 0.75);
          --bg-card: rgba(255, 255, 255, 0.85);
          --bg-card-hover: rgba(255, 255, 255, 1);
          --bg-input: rgba(255, 255, 255, 0.92);
          --border-color: rgba(15, 23, 42, 0.12);
          --border-card: rgba(15, 23, 42, 0.08);
          --border-card-hover: rgba(15, 23, 42, 0.22);
          --text-main: #000000;
          --text-sub: #1e293b;
          --text-muted: #334155;
          --shadow-panel: 0 20px 40px rgba(15, 23, 42, 0.06);
          --shadow-card: 0 10px 25px rgba(15, 23, 42, 0.04);
          --shadow-input: 0 20px 50px rgba(15, 23, 42, 0.1), 0 0 0 1px rgba(15, 23, 42, 0.08), 0 10px 30px rgba(0, 255, 180, 0.15);
          --glass-blur: blur(32px);
          --accent-green: #0d9488;
          --accent-cyan: #0284c7;
          --accent-purple: #7c3aed;
          --accent-red: #dc2626;
          --accent-orange: #d97706;
        }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: var(--border-color); border-radius: 99px; }
        @keyframes bounce { 0%,100% { transform: translateY(0); opacity: 0.4; } 50% { transform: translateY(-5px); opacity: 1; } }
        @keyframes floatOrb { 0%, 100% { transform: translateY(0px) scale(1); } 50% { transform: translateY(-8px) scale(1.04); } }
        @keyframes pulseAvatar { 0%, 100% { box-shadow: 0 0 20px rgba(0,255,180,0.3), 0 0 40px rgba(0,212,255,0.2); } 50% { box-shadow: 0 0 35px rgba(0,255,180,0.6), 0 0 70px rgba(0,212,255,0.4); } }
        @keyframes pulseGlow { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(1.2); } }
        div[style*="bottom: 28"][style*="left: 50%"], div[style*="bottom: 28px"][style*="left: 50%"], div[style*="bottom: 28"][style*="translateX(-50%)"], div[style*="bottom: 28px"][style*="translateX(-50%)"] { display: none !important; }
        .nav-btn { background: none; border: none; cursor: pointer; font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 500; transition: all 0.2s; padding: 6px 0; }
        .nav-btn:hover { color: var(--text-main) !important; }
        .nav-btn.active { color: var(--text-main) !important; font-weight: 700; }
        .suggestion-pill { border: 1px solid var(--border-card); background: var(--bg-card); color: var(--text-main); font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 500; padding: 12px 24px; border-radius: 99px; cursor: pointer; transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1); backdrop-filter: var(--glass-blur); box-shadow: var(--shadow-card); }
        .suggestion-pill:hover { background: var(--bg-card-hover); border-color: var(--accent-green); color: var(--text-main); transform: scale(1.03) translateY(-2px); box-shadow: 0 12px 28px rgba(0,255,180,0.2); }
        .mode-option { padding: 12px 20px; font-size: 13px; cursor: pointer; transition: all 0.2s; font-family: 'Inter', sans-serif; color: var(--text-sub); font-weight: 500; }
        .mode-option:hover { background: var(--bg-card-hover); color: var(--text-main); padding-left: 24px; }
        .mode-option.selected { color: var(--accent-green); font-weight: 700; background: rgba(0,255,180,0.08); border-left: 3px solid var(--accent-green); }
        .send-btn-active { background: linear-gradient(135deg, var(--accent-green), var(--accent-cyan)) !important; cursor: pointer !important; color: #050c10 !important; box-shadow: 0 8px 24px rgba(0,255,180,0.3); }
        .send-btn-active:hover { transform: scale(1.08); box-shadow: 0 12px 32px rgba(0,255,180,0.5); }
        .coach-prose { color: var(--text-main) !important; font-family: 'Inter', sans-serif; font-size: 15px; line-height: 1.8; }
        .coach-prose p { color: var(--text-main) !important; margin-bottom: 1em; }
        .coach-prose strong { color: var(--text-main) !important; font-weight: 700; }
        .coach-prose ul, .coach-prose ol { margin-bottom: 1em; padding-left: 1.5em; }
        .coach-prose li { margin-bottom: 0.5em; }
        .coach-prose h1, .coach-prose h2, .coach-prose h3, .coach-prose h4 { color: var(--text-main) !important; font-weight: 700; margin-top: 1.5em; margin-bottom: 0.75em; }
        .coach-prose a { color: var(--accent-green) !important; text-decoration: underline; }
        .coach-page-container textarea::placeholder { color: var(--text-muted) !important; }
      `}</style>
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
        <motion.div animate={{ scale: [1, 1.15, 1], x: [0, 40, 0], y: [0, -30, 0] }} transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }} style={{ position: "absolute", top: "-10%", left: "-5%", width: "50vw", height: "50vw", borderRadius: "50%", background: "radial-gradient(circle, rgba(0,255,180,0.12) 0%, transparent 70%)", filter: "blur(60px)" }} />
        <motion.div animate={{ scale: [1, 0.9, 1.1, 1], x: [0, -40, 20, 0], y: [0, 40, -20, 0] }} transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }} style={{ position: "absolute", bottom: "-10%", right: "-5%", width: "55vw", height: "55vw", borderRadius: "50%", background: "radial-gradient(circle, rgba(0,212,255,0.1) 0%, transparent 70%)", filter: "blur(60px)" }} />
        <motion.div animate={{ scale: [1, 1.2, 1], x: [0, 20, -20, 0], y: [0, 20, 0] }} transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }} style={{ position: "absolute", top: "20%", right: "20%", width: "40vw", height: "40vw", borderRadius: "50%", background: "radial-gradient(circle, rgba(176,127,255,0.08) 0%, transparent 70%)", filter: "blur(60px)" }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(var(--border-card) 1px, transparent 1px)", backgroundSize: "32px 32px", opacity: 0.5 }} />
      </div>

      <div style={{ position: "sticky", top: 0, zIndex: 50, height: 56, borderBottom: "1px solid var(--border-color)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 32px", background: "var(--bg-panel)", backdropFilter: "var(--glass-blur)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg, var(--accent-green), var(--accent-cyan))", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 14px rgba(0,255,180,0.3)" }}>
            <Zap size={14} color="#050c10" strokeWidth={2.5} />
          </div>
          <span style={{ fontSize: 15, fontWeight: 800, letterSpacing: "-0.03em", background: "linear-gradient(90deg,#fff,rgba(255,255,255,0.7))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            TimboAI
          </span>
        </div>
        <div style={{ display: "flex", gap: 32 }}>
          {navItems.map((item, i) => (
            <button key={item} className={`nav-btn ${i === 3 ? "active" : ""}`} onClick={() => navigate(item === "Dashboard" ? "/" : `/${item.toLowerCase()}`)} style={{ color: i === 3 ? "var(--text-main)" : "var(--text-muted)", position: "relative" }}>
              {item}
              {i === 3 && <span style={{ position: "absolute", bottom: -2, left: 0, right: 0, height: 2, borderRadius: 99, background: "linear-gradient(90deg, var(--accent-green), var(--accent-cyan))" }} />}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "5px 14px", background: "rgba(0,255,180,0.08)", border: "1px solid rgba(0,255,180,0.25)", borderRadius: 99, fontSize: 11, fontWeight: 700, color: "var(--accent-green)", fontFamily: "'Space Mono', monospace", letterSpacing: "0.06em" }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent-green)", animation: "pulseGlow 2s infinite" }} />
          COGNITIVE AI ONLINE
        </div>
      </div>

      <div style={{ display: "flex", flex: 1, position: "relative", zIndex: 1, overflow: "hidden" }}>
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, ease: "easeOut" }} style={{ width: 310, flexShrink: 0, margin: "24px 0 24px 24px", background: "var(--bg-panel)", backdropFilter: "var(--glass-blur)", border: "1px solid var(--border-color)", borderRadius: 28, boxShadow: "var(--shadow-panel)", padding: "28px 22px", display: "flex", flexDirection: "column", gap: 24, overflowY: "auto", zIndex: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--text-muted)", fontFamily: "'Space Mono', monospace" }}>Cognitive Telemetry</span>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent-green)", boxShadow: "0 0 12px var(--accent-green)" }} />
          </div>
          
          <div style={{ background: "linear-gradient(135deg, rgba(236,72,153,0.05) 0%, rgba(139,92,246,0.05) 100%)", border: "1px solid rgba(236,72,153,0.3)", borderRadius: 24, padding: "22px 24px", boxShadow: "var(--shadow-card)", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -20, right: -20, width: 100, height: 100, background: "radial-gradient(circle, rgba(236,72,153,0.15) 0%, transparent 70%)", filter: "blur(20px)" }} />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.15em", color: "#ec4899", background: "rgba(236,72,153,0.1)", border: "1px solid rgba(236,72,153,0.2)", padding: "4px 10px", borderRadius: 99, fontFamily: "'Space Mono', monospace" }}>PREMIUM TIER ACTIVE</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-main)", fontFamily: "'Space Mono', monospace" }}>$4.99/mo</span>
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "var(--text-main)", marginBottom: 6, fontFamily: "'Syne', sans-serif", letterSpacing: "-0.01em" }}>AI Behavioral OS Unlocked</div>
            <p style={{ fontSize: 12, color: "var(--text-sub)", lineHeight: 1.5, marginBottom: 16, fontFamily: "'Inter', sans-serif" }}>Advanced conversational planning, long-context memory, emotional resistance analysis, and voice-based cognitive coaching enabled.</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {["Resistance AI", "Long-Context Memory", "Voice Coaching"].map(badge => (
                <span key={badge} style={{ fontSize: 10, fontWeight: 600, color: "var(--text-sub)", background: "var(--bg-card-hover)", border: "1px solid var(--border-card)", padding: "3px 8px", borderRadius: 6 }}>✓ {badge}</span>
              ))}
            </div>
          </div>

          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-card)", borderRadius: 24, padding: "22px 20px", position: "relative", overflow: "hidden", boxShadow: "var(--shadow-card)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <Brain size={16} color="var(--accent-green)" />
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-muted)", fontFamily: "'Space Mono', monospace" }}>Daily Emotional Check-in</span>
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-main)", marginBottom: 14, fontFamily: "'Inter', sans-serif" }}>"How difficult did today feel emotionally?"</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 14 }}>
              {[
                { label: "Light", color: "--accent-green", desc: "Smooth flow", stress: "Low Stress" },
                { label: "Moderate", color: "--accent-orange", desc: "Manageable", stress: "Medium Stress" },
                { label: "Heavy", color: "--accent-red", desc: "High friction", stress: "High Stress" }
              ].map(opt => (
                <button key={opt.label} onClick={() => { setLiveEmotion(`Focused • ${opt.stress} • Calibrating Workload...`); toast.success(`Emotional state logged: ${opt.label}. AI adjusting tomorrow's cognitive load.`); setTimeout(() => { setLiveEmotion(`Focused • ${opt.stress} • Workload Calibrated`); }, 1500); }} style={{ padding: "10px 8px", borderRadius: 14, border: `1px solid var(${opt.color})`, background: liveEmotion.includes(opt.stress) ? `var(${opt.color})` : "var(--bg-card)", color: liveEmotion.includes(opt.stress) ? "#fff" : "var(--text-sub)", cursor: "pointer", transition: "all 0.2s", textAlign: "center", boxShadow: liveEmotion.includes(opt.stress) ? `0 0 12px var(${opt.color})` : "none" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, fontFamily: "'Space Mono', monospace", marginBottom: 2 }}>{opt.label}</div>
                  <div style={{ fontSize: 10, color: liveEmotion.includes(opt.stress) ? "rgba(255,255,255,0.8)" : "var(--text-muted)", fontFamily: "'Inter', sans-serif" }}>{opt.desc}</div>
                </button>
              ))}
            </div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", fontStyle: "italic", lineHeight: 1.4 }}>⚡ AI Engine auto-inserts recovery buffers & adapts roadmap difficulty based on your emotional resistance.</div>
          </div>

          <div style={{ background: "linear-gradient(135deg, var(--bg-card) 0%, rgba(2,132,199,0.03) 100%)", border: "1px solid var(--border-card)", borderRadius: 24, padding: "22px 20px", boxShadow: "var(--shadow-card)", position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <ShieldCheck size={16} color="var(--accent-green)" />
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--accent-green)", fontFamily: "'Space Mono', monospace" }}>AI Accountability System</span>
            </div>
            <p style={{ fontSize: 13, color: "var(--text-main)", lineHeight: 1.6, fontWeight: 500, fontFamily: "'Inter', sans-serif", fontStyle: "italic", marginBottom: 12 }}>"You started this goal because you wanted financial freedom and independence. One focused session right now keeps the momentum alive."</p>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid var(--border-card)", paddingTop: 10 }}>
              <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "'Space Mono', monospace" }}>MOTIVATION LINKED</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: "var(--accent-cyan)", fontFamily: "'Space Mono', monospace" }}>CRACK FAANG GOAL</span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {telemetryMetrics.map(({ label, value, sub, color, icon: Icon, progress, grad }) => (
              <motion.div key={label} whileHover={{ scale: 1.02, y: -2 }} transition={{ duration: 0.2 }} style={{ background: "var(--bg-card)", border: "1px solid var(--border-card)", borderRadius: 20, padding: "18px 20px", position: "relative", overflow: "hidden", boxShadow: "var(--shadow-card)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Icon size={15} color={color} />
                    <span style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "'Space Mono', monospace", fontWeight: 600 }}>{label}</span>
                  </div>
                  <span style={{ fontSize: 11, color: "var(--accent-green)", fontWeight: 600 }}>{sub}</span>
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, color: "var(--text-main)", marginBottom: 12, letterSpacing: "-0.02em", fontFamily: "'Syne', sans-serif" }}>{value}</div>
                <div style={{ height: 6, background: "rgba(120,120,120,0.15)", borderRadius: 99, overflow: "hidden" }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 1, ease: "easeOut" }} style={{ height: "100%", background: grad, borderRadius: 99 }} />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", overflowY: "auto", padding: "32px 24px 280px", position: "relative", zIndex: 10 }}>
          <div style={{ width: "100%", maxWidth: 900, display: "flex", flexDirection: "column", gap: 28 }}>
            {messages.length === 1 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} style={{ textAlign: "center", marginTop: 48, marginBottom: 48 }}>
                <div style={{ position: "relative", display: "inline-block", marginBottom: 36 }}>
                  <div style={{ position: "absolute", inset: -20, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,255,180,0.3) 0%, rgba(0,212,255,0.2) 50%, transparent 100%)", filter: "blur(24px)", animation: "pulseAvatar 4s infinite" }} />
                  <motion.div style={{ width: 96, height: 96, borderRadius: "50%", margin: "0 auto", position: "relative", background: "linear-gradient(135deg, var(--accent-green) 0%, var(--accent-cyan) 50%, var(--accent-purple) 100%)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 20px 48px rgba(0,255,180,0.4), inset 0 2px 0 rgba(255,255,255,0.4)", animation: "floatOrb 6s ease-in-out infinite" }}>
                    <Brain size={46} color="#050c10" strokeWidth={1.8} />
                  </motion.div>
                </div>
                <h1 style={{ fontSize: "clamp(2.8rem, 5vw, 4.5rem)", fontWeight: 800, letterSpacing: "-0.04em", marginBottom: 18, lineHeight: 1.1, color: "var(--text-main)", fontFamily: "'Syne', sans-serif" }}>Cognitive Coach</h1>
                <p style={{ color: "var(--text-sub)", fontSize: "1.1rem", fontWeight: 400, maxWidth: 580, margin: "0 auto", lineHeight: 1.65, fontFamily: "'Inter', sans-serif" }}>Research-backed cognitive mentoring and strategic execution guidance. Your AI strategist is ready.</p>
                <div style={{ display: "flex", gap: 14, justifyContent: "center", marginTop: 48, flexWrap: "wrap" }}>
                  {getSuggestions().map((s) => (
                    <button key={s} onClick={() => setInput(s)} className="suggestion-pill">{s}</button>
                  ))}
                </div>
              </motion.div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
              <AnimatePresence initial={false}>
                {messages.map((msg, i) => {
                  if (i === 0 && messages.length === 1) return null;
                  const isUser = msg.role === "user";
                  return (
                    <motion.div key={i} initial={{ opacity: 0, y: 16, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.35, ease: "easeOut" }} style={{ display: "flex", gap: 16, flexDirection: isUser ? "row-reverse" : "row", alignSelf: isUser ? "flex-end" : "flex-start", width: isUser ? "auto" : "100%", maxWidth: "100%" }}>
                      {!isUser && (
                        <div style={{ width: 40, height: 40, borderRadius: "50%", flexShrink: 0, marginTop: 4, background: "linear-gradient(135deg, var(--accent-green), var(--accent-cyan))", boxShadow: "0 0 20px rgba(0,255,180,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Brain size={22} color="#050c10" strokeWidth={2} />
                        </div>
                      )}
                      <div style={{ width: isUser ? "auto" : "calc(100% - 56px)", maxWidth: isUser ? "75%" : "100%" }}>
                        {isUser ? (
                          <div style={{ padding: "16px 24px", borderRadius: "24px 24px 6px 24px", background: "var(--bg-panel)", border: "1px solid var(--border-color)", fontSize: 15, lineHeight: 1.65, color: "var(--text-main)", fontWeight: 500, backdropFilter: "var(--glass-blur)", boxShadow: "var(--shadow-card)", fontFamily: "'Inter', sans-serif" }}>{msg.content}</div>
                        ) : renderCard(msg)}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              {loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", flexShrink: 0, marginTop: 4, background: "linear-gradient(135deg, var(--accent-green), var(--accent-cyan))", boxShadow: "0 0 20px rgba(0,255,180,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Brain size={22} color="#050c10" strokeWidth={2} />
                  </div>
                  <div style={{ padding: "18px 24px", background: "var(--bg-card)", border: "1px solid var(--border-card)", borderRadius: "6px 24px 24px 24px", display: "flex", gap: 6, alignItems: "center", backdropFilter: "var(--glass-blur)", boxShadow: "var(--shadow-card)" }}>
                    {[0, 0.18, 0.36].map((d, i) => (
                      <span key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent-cyan)", animation: `bounce 1.2s ${d}s infinite` }} />
                    ))}
                  </div>
                </motion.div>
              )}
              <div ref={bottomRef} />
            </div>
          </div>
        </div>
      </div>

      <div style={{ position: "fixed", bottom: 24, left: 334, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 16, pointerEvents: "none", zIndex: 50, padding: "0 24px" }}>
        <AnimatePresence>
          {isVoiceRecording && (
            <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }} style={{ width: "100%", maxWidth: 900, pointerEvents: "auto", background: "linear-gradient(135deg, rgba(20,28,48,0.95) 0%, rgba(10,16,30,0.95) 100%)", backdropFilter: "blur(32px)", border: "1px solid var(--accent-green)", borderRadius: 32, boxShadow: "0 24px 64px rgba(0,255,180,0.25), 0 0 0 1px rgba(0,255,180,0.2)", padding: "24px 32px", display: "flex", flexDirection: "column", gap: 20, marginBottom: 4 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#ff5555", animation: "pulseGlow 1.5s infinite" }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#ff5555", fontFamily: "'Space Mono', monospace", letterSpacing: "0.1em" }}>LIVE VOICE REFLECTION ACTIVE</span>
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "var(--accent-green)", fontFamily: "'Space Mono', monospace", marginLeft: "auto" }}>00:{voiceSeconds < 10 ? `0${voiceSeconds}` : voiceSeconds}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, height: 48, padding: "0 10px" }}>
                {[25, 45, 75, 35, 90, 60, 40, 80, 50, 70, 30, 85, 45, 65, 35, 95, 55, 75, 40, 60].map((h, i) => (
                  <motion.div key={i} animate={{ height: [`${h * 0.4}%`, `${h}%`, `${h * 0.3}%`] }} transition={{ duration: 0.8 + (i % 5) * 0.2, repeat: Infinity, ease: "easeInOut" }} style={{ flex: 1, background: i % 2 === 0 ? "var(--accent-green)" : "var(--accent-cyan)", borderRadius: 99, opacity: 0.8, boxShadow: "0 0 12px rgba(0,255,180,0.4)" }} />
                ))}
              </div>
              <div style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: "16px 22px", fontSize: 15, color: "#fff", fontFamily: "'Inter', sans-serif", fontStyle: "italic", minHeight: 64, display: "flex", alignItems: "center" }}>"{voiceTranscript}"</div>
              <div style={{ display: "flex", gap: 16, justifyContent: "flex-end" }}>
                <button onClick={handleCancelVoice} style={{ padding: "12px 24px", borderRadius: 16, border: "1px solid rgba(255,85,85,0.3)", background: "rgba(255,85,85,0.1)", color: "#ff5555", fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }} onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,85,85,0.2)"; }} onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,85,85,0.1)"; }}>Cancel</button>
                <button onClick={handleStopVoice} style={{ padding: "12px 28px", borderRadius: 16, border: "none", background: "linear-gradient(135deg, var(--accent-green), var(--accent-cyan))", color: "#050c10", fontWeight: 700, cursor: "pointer", transition: "all 0.2s", boxShadow: "0 8px 24px rgba(0,255,180,0.3)" }} onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.03)"; }} onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}>⏹️ Stop & Analyze Resistance</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div style={{ width: "100%", maxWidth: 900, pointerEvents: "auto", background: "var(--bg-input)", backdropFilter: "var(--glass-blur)", border: "1px solid var(--border-color)", borderRadius: 36, boxShadow: "var(--shadow-input)", padding: "14px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 12px 0", borderBottom: "1px solid var(--border-card)" }}>
            <div style={{ position: "relative" }}>
              <button onClick={() => setModeOpen(!modeOpen)} style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer", padding: "4px 8px 8px", color: "var(--accent-green)", fontSize: 12, fontWeight: 700, fontFamily: "'Space Mono', monospace", letterSpacing: "0.08em" }}>
                {currentMode.toUpperCase()}
                <ChevronDown size={14} style={{ transition: "transform 0.2s", transform: modeOpen ? "rotate(180deg)" : "none" }} />
              </button>
              <AnimatePresence>
                {modeOpen && (
                  <motion.div initial={{ opacity: 0, y: -8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -4, scale: 0.97 }} style={{ position: "absolute", bottom: "100%", left: 0, marginBottom: 12, background: "var(--bg-input)", backdropFilter: "var(--glass-blur)", border: "1px solid var(--border-color)", borderRadius: 20, overflow: "hidden", minWidth: 220, boxShadow: "var(--shadow-panel)" }}>
                    {MODES.map(m => (
                      <div key={m} className={`mode-option ${m === currentMode ? "selected" : ""}`} onClick={() => { setCurrentMode(m); setModeOpen(false); }}>{m}</div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div style={{ display: "flex", alignItems: "center" }}>
              <motion.div animate={{ opacity: [0.7, 1, 0.7] }} transition={{ duration: 3, repeat: Infinity }} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 18px", background: "var(--bg-card)", border: "1px solid var(--border-card)", borderRadius: 99, fontSize: 11, fontWeight: 600, color: "var(--text-sub)", fontFamily: "'Space Mono', monospace", letterSpacing: "0.06em", boxShadow: "var(--shadow-card)" }}>
                <Activity size={13} color={emotionColor} />
                <span style={{ color: "var(--text-muted)" }}>STATE: </span>
                <span style={{ color: emotionColor, fontWeight: 700 }}>{liveEmotion}</span>
              </motion.div>
            </div>
            <div style={{ display: "flex", gap: 12, paddingBottom: 4 }}>
              <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 6, borderRadius: 8, transition: "all 0.2s" }} onClick={() => toast.success("File attachment protocol ready. Uploading context...")} onMouseEnter={e => { e.currentTarget.style.color = "var(--accent-green)"; e.currentTarget.style.background = "rgba(0,255,180,0.1)"; }} onMouseLeave={e => { e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.background = "transparent"; }}>
                <Paperclip size={18} />
              </button>
              <button style={{ background: isVoiceRecording ? "rgba(255,85,85,0.2)" : "none", border: "none", cursor: "pointer", color: isVoiceRecording ? "#ff5555" : "var(--text-muted)", padding: 6, borderRadius: 8, transition: "all 0.2s" }} onClick={isVoiceRecording ? handleStopVoice : handleStartVoice} title="AI Voice Reflection / Journaling" onMouseEnter={e => { e.currentTarget.style.color = isVoiceRecording ? "#ff5555" : "var(--accent-green)"; e.currentTarget.style.background = isVoiceRecording ? "rgba(255,85,85,0.3)" : "rgba(0,255,180,0.1)"; }} onMouseLeave={e => { e.currentTarget.style.color = isVoiceRecording ? "#ff5555" : "var(--text-muted)"; e.currentTarget.style.background = isVoiceRecording ? "rgba(255,85,85,0.2)" : "transparent"; }}>
                <Mic size={18} className={isVoiceRecording ? "animate-pulse" : ""} />
              </button>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 14, padding: "8px 10px 10px" }}>
            <textarea ref={textareaRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }} placeholder={placeholders[placeholderIndex]} disabled={loading} rows={1} style={{ flex: 1, background: "transparent", border: "none", color: "var(--text-main)", fontSize: 16, outline: "none", resize: "none", lineHeight: 1.6, fontFamily: "'Inter', sans-serif", padding: "8px 12px", maxHeight: 120 }} />
            <button onClick={handleSend} disabled={loading || !input.trim()} className={input.trim() && !loading ? "send-btn-active" : ""} style={{ width: 44, height: 44, borderRadius: "50%", flexShrink: 0, background: "var(--bg-card)", color: "var(--text-muted)", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)", marginBottom: 2, border: "1px solid var(--border-card)" }}>
              <Send size={18} color={input.trim() && !loading ? "#050c10" : undefined} style={{ transform: "translateX(-1px) translateY(1px)" }} />
            </button>
          </div>
        </div>
        <div style={{ pointerEvents: "auto", display: "flex", alignItems: "center", gap: 8, background: "var(--bg-panel)", backdropFilter: "var(--glass-blur)", border: "1px solid var(--border-color)", borderRadius: 99, padding: "8px 16px", boxShadow: "var(--shadow-panel)" }}>
          {dockIcons.map((item) => {
            const isActive = item.name === "Coach";
            return (
              <motion.button key={item.name} onClick={() => navigate(item.path)} whileHover={{ scale: 1.2, y: -4 }} transition={{ type: "spring", stiffness: 400, damping: 20 }} style={{ width: 44, height: 44, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", background: isActive ? "linear-gradient(135deg, var(--accent-green), var(--accent-cyan))" : "var(--bg-card)", color: isActive ? "#050c10" : "var(--text-sub)", boxShadow: isActive ? "0 8px 24px rgba(0,255,180,0.4)" : "none", position: "relative", border: isActive ? "none" : "1px solid var(--border-card)" }} title={item.name}>
                <item.icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                {isActive && <span style={{ position: "absolute", bottom: -4, width: 4, height: 4, borderRadius: "50%", background: "var(--accent-green)", boxShadow: "0 0 8px var(--accent-green)" }} />}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
