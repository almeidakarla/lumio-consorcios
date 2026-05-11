"use client";

import { useState, useEffect } from "react";

const THEME_KEY = "lumio-crm-theme";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(THEME_KEY) as "dark" | "light" | null;
    if (stored) {
      setTheme(stored);
      document.documentElement.setAttribute("data-theme", stored);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem(THEME_KEY, newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <button className="crm-theme-toggle" aria-label="Toggle theme">
        <span>&#9790;</span>
      </button>
    );
  }

  return (
    <button
      className="crm-theme-toggle"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      {theme === "dark" ? (
        <span>&#9788;</span> // Sun icon for switching to light
      ) : (
        <span>&#9790;</span> // Moon icon for switching to dark
      )}
    </button>
  );
}
