import React, { createContext, useState, useEffect, useContext } from "react";

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const themeStyles = {
  dark: {
    name: "Midnight Dark",
    background: "#06120f",
    backgroundEnd: "#0d1f1a",
    foreground: "#f7fbff",
    cardBg: "rgba(12, 26, 22, 0.74)",
    cardBorder: "rgba(255, 255, 255, 0.1)",
    primary: "#79e2bb",
    primaryGlow: "rgba(121, 226, 187, 0.2)",
    shadow: "rgba(0, 0, 0, 0.42)",
    muted: "#bad5cd",
    glassBg: "rgba(10, 25, 21, 0.82)",
  },
  light: {
    name: "Soft Light",
    background: "#f8fafc",
    backgroundEnd: "#eef4f8",
    foreground: "#111827",
    cardBg: "rgba(255, 255, 255, 0.78)",
    cardBorder: "rgba(17, 24, 39, 0.1)",
    primary: "#128667",
    primaryGlow: "rgba(18, 134, 103, 0.13)",
    shadow: "rgba(15, 23, 42, 0.08)",
    muted: "#4b5f78",
    glassBg: "rgba(255, 255, 255, 0.85)",
  },
  mint: {
    name: "Mint Green",
    background: "#f0fbf7",
    backgroundEnd: "#def7ef",
    foreground: "#10221d",
    cardBg: "rgba(255, 255, 255, 0.76)",
    cardBorder: "rgba(13, 114, 88, 0.15)",
    primary: "#0f9f7b",
    primaryGlow: "rgba(15, 159, 123, 0.17)",
    shadow: "rgba(16, 34, 29, 0.08)",
    muted: "#506961",
    glassBg: "rgba(255, 255, 255, 0.84)",
  },
  lavender: {
    name: "Lavender Purple",
    background: "#f7f3ff",
    backgroundEnd: "#ece6ff",
    foreground: "#201936",
    cardBg: "rgba(255, 255, 255, 0.76)",
    cardBorder: "rgba(113, 77, 170, 0.15)",
    primary: "#7b5cff",
    primaryGlow: "rgba(123, 92, 255, 0.16)",
    shadow: "rgba(32, 25, 54, 0.08)",
    muted: "#635a78",
    glassBg: "rgba(255, 255, 255, 0.86)",
  },
  yellow: {
    name: "Sunset Yellow",
    background: "#fffbea",
    backgroundEnd: "#fff0bf",
    foreground: "#302616",
    cardBg: "rgba(255, 255, 255, 0.78)",
    cardBorder: "rgba(180, 83, 9, 0.15)",
    primary: "#b45309",
    primaryGlow: "rgba(180, 83, 9, 0.15)",
    shadow: "rgba(48, 38, 22, 0.08)",
    muted: "#715f42",
    glassBg: "rgba(255, 255, 255, 0.86)",
  },
  rose: {
    name: "Rose Pink",
    background: "#fff4f8",
    backgroundEnd: "#fde8f0",
    foreground: "#321826",
    cardBg: "rgba(255, 255, 255, 0.78)",
    cardBorder: "rgba(219, 39, 119, 0.14)",
    primary: "#db2777",
    primaryGlow: "rgba(219, 39, 119, 0.14)",
    shadow: "rgba(50, 24, 38, 0.08)",
    muted: "#765364",
    glassBg: "rgba(255, 255, 255, 0.86)",
  },
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("timbo-theme") || "mint";
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
