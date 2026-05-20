import React, { useMemo, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Bell,
  Bot,
  CalendarDays,
  Crown,
  Flame,
  Compass,
  Gauge,
  HeartHandshake,
  LogOut,
  Moon,
  Plus,
  Search,
  Settings,
  Sparkles,
  Sun,
  Target,
  TimerReset,
  UsersRound,
  UserRound,
  Zap,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { themeStyles, useTheme } from "../context/ThemeContext";

const tabs = [
  { name: "Dashboard", path: "/", icon: Target, cue: "Mission" },
  { name: "Calendar", path: "/calendar", icon: CalendarDays, cue: "Flow" },
  { name: "Roadmap", path: "/roadmap", icon: Compass, cue: "Path" },
  { name: "Focus", path: "/focus", icon: TimerReset, cue: "Deep work" },
  { name: "AI Coach", path: "/coach", icon: Bot, cue: "Support" },
  { name: "Analytics", path: "/analytics", icon: Gauge, cue: "Trends" },
  { name: "Habits", path: "/habits", icon: Flame, cue: "Streaks" },
  { name: "Team", path: "/team", icon: UsersRound, cue: "Shared" },
  { name: "Settings", path: "/settings", icon: Settings, cue: "Control" },
];

const mobileTabs = tabs.slice(0, 5);

const pageMeta = {
  "/": { title: "Dashboard", crumb: "Mission control" },
  "/calendar": { title: "Calendar", crumb: "Adaptive schedule" },
  "/focus": { title: "Focus", crumb: "Deep work sanctuary" },
  "/coach": { title: "AI Coach", crumb: "Emotional strategy" },
  "/roadmap": { title: "Roadmap", crumb: "Momentum path" },
  "/analytics": { title: "Analytics", crumb: "Progress intelligence" },
  "/habits": { title: "Habits", crumb: "Streak systems" },
  "/team": { title: "Team", crumb: "Shared execution" },
  "/notifications": { title: "Notifications", crumb: "Signals" },
  "/settings": { title: "Settings", crumb: "Workspace control" },
  "/profile": { title: "Profile", crumb: "Your aura" },
  "/premium": { title: "Premium", crumb: "Upgrade" },
};

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const meta = pageMeta[location.pathname] || pageMeta["/"];

  const themeEntries = useMemo(() => Object.entries(themeStyles), []);

  const signOut = async () => {
    await logout();
    toast.success("Signed out. Your momentum is safe.");
    navigate("/login");
  };

  return (
    <div className="app-shell">
      <aside
        className={`app-sidebar ${sidebarOpen ? "expanded" : ""}`}
        onMouseEnter={() => setSidebarOpen(true)}
        onMouseLeave={() => setSidebarOpen(false)}
        aria-label="Workspace navigation"
      >
        <button className="sidebar-logo" onClick={() => navigate("/")}>
          <span><Sparkles size={19} /></span>
          <strong>Timbo-Timer</strong>
        </button>

        <nav className="sidebar-nav">
          {tabs.map(({ name, path, icon: Icon, cue }) => (
            <NavLink key={name} to={path} end={path === "/"} className={({ isActive }) => isActive ? "active" : ""}>
              <Icon size={20} />
              <span><strong>{name}</strong><small>{cue}</small></span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-shortcuts">
          <button title="Quick add"><Plus size={18} /><span>Quick add</span></button>
          <button title="Start focus"><Zap size={18} /><span>Start focus</span></button>
          <button title="Team room" onClick={() => navigate("/team")}><HeartHandshake size={18} /><span>Team room</span></button>
        </div>

        <div className="sidebar-themes" aria-label="Theme selector">
          {themeEntries.map(([key, value]) => (
            <button
              key={key}
              title={value.name}
              className={theme === key ? "active" : ""}
              onClick={() => setTheme(key)}
              style={{ "--swatch": value.primary }}
            />
          ))}
        </div>

        <button className="sidebar-premium" onClick={() => navigate("/premium")} title="Upgrade to Pro">
          <Crown size={18} />
          <span><strong>Upgrade to Pro</strong><small>AI rooms and insights</small></span>
        </button>

        <button className="sidebar-profile" onClick={() => navigate("/profile")} title="Profile">
          <UserRound size={18} />
          <span><strong>{user?.name || "Timbo"}</strong><small>Pro Plan</small></span>
          <LogOut size={15} className="profile-exit" />
        </button>
      </aside>

      <section className="app-frame">
        <header className="app-navbar">
          <div className="nav-title">
            <span>{meta.crumb}</span>
            <h1>{meta.title}</h1>
          </div>

          <label className="global-search">
            <Search size={17} />
            <input placeholder="Search missions, ask Timbo, or jump anywhere..." />
          </label>

          <div className="nav-actions">
            <span className="streak-pill">5 day flow</span>
            <button title="Notifications" onClick={() => navigate("/notifications")}><Bell size={18} /></button>
            <button onClick={() => setTheme(theme === "dark" ? "mint" : "dark")} title="Toggle theme">
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </header>

        <main className="app-workspace">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 14, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.34, ease: [0.2, 0.8, 0.2, 1] }}
            className="workspace-inner"
          >
            <Outlet />
          </motion.div>
        </main>

        <div className="command-dock" role="search">
          <button><Plus size={18} /><span>Add</span></button>
          <div><Search size={17} /><input placeholder="Ask Timbo to plan, search, or start focus..." /></div>
          <button onClick={() => navigate("/focus")}><TimerReset size={18} /><span>Focus</span></button>
        </div>
      </section>

      <nav className="mobile-bottom-nav" aria-label="Primary navigation">
        {mobileTabs.map(({ name, path, icon: Icon }) => (
          <NavLink key={name} to={path} end={path === "/"} className={({ isActive }) => isActive ? "active" : ""}>
            <Icon size={19} />
            <span>{name}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
