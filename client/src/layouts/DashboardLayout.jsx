import React from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Bot, CalendarDays, Compass, LogOut, Moon, Sparkles, Sun, Target, TimerReset } from "lucide-react";
import { toast } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { themeStyles, useTheme } from "../context/ThemeContext";

const tabs = [
  { name: "Today", path: "/", icon: Target },
  { name: "Calendar", path: "/calendar", icon: CalendarDays },
  { name: "Focus", path: "/focus", icon: TimerReset },
  { name: "Coach", path: "/coach", icon: Bot },
  { name: "Roadmap", path: "/roadmap", icon: Compass },
];

export default function DashboardLayout() {
  const { logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const signOut = async () => {
    await logout();
    toast.success("Signed out. Your momentum is safe.");
    navigate("/login");
  };

  return (
    <div className="timbo-shell">
      <header className="timbo-topbar">
        <button className="timbo-brand" onClick={() => navigate("/")}>
          <span><Sparkles size={17} /></span>
          <strong>Timbo-Timer</strong>
        </button>

        <div className="timbo-topbar-actions">
          <div className="theme-dots" aria-label="Theme selector">
            {Object.entries(themeStyles).map(([key, value]) => (
              <button
                key={key}
                title={`${value.name} mode`}
                aria-label={`${value.name} mode`}
                className={theme === key ? "active" : ""}
                onClick={() => setTheme(key)}
                style={{ "--swatch": value.primary }}
              />
            ))}
          </div>
          <button className="icon-quiet" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} title="Toggle theme">
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button className="icon-quiet" onClick={signOut} title="Sign out">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <aside className="timbo-side-rail" aria-label="Workspace navigation">
        {tabs.map(({ name, path, icon: Icon }) => (
          <NavLink key={name} to={path} end={path === "/"} className={({ isActive }) => isActive ? "active" : ""} title={name}>
            <Icon size={19} />
            <span>{name}</span>
          </NavLink>
        ))}
      </aside>

      <main className="timbo-main">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
          className="timbo-screen"
        >
          <Outlet />
        </motion.div>
      </main>

      <nav className="timbo-bottom-nav" aria-label="Primary navigation">
        {tabs.map(({ name, path, icon: Icon }) => (
          <NavLink key={name} to={path} end={path === "/"} className={({ isActive }) => isActive ? "active" : ""}>
            <Icon size={19} />
            <span>{name}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
