import React, { createContext, useState, useEffect, useContext } from "react";

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const themeStyles = {
  dark: {
    name: "Dark Mode",
    background: "#080c14",
    backgroundEnd: "#0d111d",
    foreground: "#ffffff",
    cardBg: "rgba(15, 23, 42, 0.6)",
    cardBorder: "rgba(255, 255, 255, 0.06)",
    primary: "#6366f1",
    primaryGlow: "rgba(99, 102, 241, 0.25)",
    shadow: "rgba(0, 0, 0, 0.5)",
    muted: "#cbd5e1",
    glassBg: "rgba(13, 17, 29, 0.8)",
  },
  light: {
    name: "Light Mode",
    background: "#f8fafc",
    backgroundEnd: "#f1f5f9",
    foreground: "#000000",
    cardBg: "rgba(255, 255, 255, 0.75)",
    cardBorder: "rgba(15, 23, 42, 0.08)",
    primary: "#2563eb",
    primaryGlow: "rgba(37, 99, 235, 0.15)",
    shadow: "rgba(15, 23, 42, 0.05)",
    muted: "#334155",
    glassBg: "rgba(255, 255, 255, 0.85)",
  },
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("timbo-theme") || "dark";
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCommandDockOpen, setIsCommandDockOpen] = useState(false);

  useEffect(() => {
    const root = window.document.documentElement;
    const styles = themeStyles[theme] || themeStyles.dark;

    // Remove any existing theme- classes
    Object.keys(themeStyles).forEach((t) => {
      root.classList.remove(`theme-${t}`);
    });

    root.classList.add(`theme-${theme}`);
    localStorage.setItem("timbo-theme", theme);

    // Sync HTML dark mode class for Tailwind support
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    // Set root style custom properties
    root.style.setProperty("--background", styles.background);
    root.style.setProperty("--background-end", styles.backgroundEnd);
    root.style.setProperty("--foreground", styles.foreground);
    root.style.setProperty("--card-bg", styles.cardBg);
    root.style.setProperty("--card-border", styles.cardBorder);
    root.style.setProperty("--primary", styles.primary);
    root.style.setProperty("--primary-glow", styles.primaryGlow);
    root.style.setProperty("--shadow", styles.shadow);
    root.style.setProperty("--muted", styles.muted);
    root.style.setProperty("--glass-bg", styles.glassBg);
  }, [theme]);

  // Backward compatibility with simple toggleTheme requests
  const toggleTheme = () => {
    setTheme((prev) => {
      const list = Object.keys(themeStyles);
      const nextIdx = (list.indexOf(prev) + 1) % list.length;
      return list[nextIdx];
    });
  };

  const isDarkMode = theme === "dark";

  return (
    <ThemeContext.Provider value={{
      theme,
      setTheme,
      isDarkMode,
      toggleTheme,
      isSettingsOpen,
      setIsSettingsOpen,
      isCommandDockOpen,
      setIsCommandDockOpen,
      themeDetails: themeStyles[theme] || themeStyles.dark
    }}>
      {children}
    </ThemeContext.Provider>
  );
};
