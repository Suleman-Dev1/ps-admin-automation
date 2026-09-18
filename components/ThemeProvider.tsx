"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { ThemeSettings } from "@/lib/types";

interface ThemeContextType {
  theme: ThemeSettings;
  refreshTheme: () => Promise<void>;
  updateThemeLocal: (newTheme: Partial<ThemeSettings>) => void;
}

const defaultTheme: ThemeSettings = {
  firm_name: "Apex Professional Advisory",
  tagline: "Automated Administrative Onboarding & Verification",
  logo_url: "",
  primary_color: "#1e3a8a",
  secondary_color: "#0284c7",
  accent_color: "#f59e0b",
  background_color: "#f8fafc",
  surface_color: "#ffffff",
  border_color: "#e2e8f0",
  text_primary: "#0f172a",
  text_secondary: "#475569",
  font_family: "'Inter', sans-serif",
  border_radius: "8px",
};

const ThemeContext = createContext<ThemeContextType>({
  theme: defaultTheme,
  refreshTheme: async () => {},
  updateThemeLocal: () => {},
});

export function ThemeProvider({
  children,
  initialTheme,
}: {
  children: React.ReactNode;
  initialTheme?: ThemeSettings;
}) {
  const [theme, setTheme] = useState<ThemeSettings>(initialTheme || defaultTheme);

  const applyThemeToDOM = (t: ThemeSettings) => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    root.style.setProperty("--brand-primary", t.primary_color || "#1e3a8a");
    root.style.setProperty("--brand-secondary", t.secondary_color || "#0284c7");
    root.style.setProperty("--brand-accent", t.accent_color || "#f59e0b");
    root.style.setProperty("--brand-bg", t.background_color || "#f8fafc");
    root.style.setProperty("--brand-surface", t.surface_color || "#ffffff");
    root.style.setProperty("--brand-border", t.border_color || "#e2e8f0");
    root.style.setProperty("--brand-text-primary", t.text_primary || "#0f172a");
    root.style.setProperty("--brand-text-secondary", t.text_secondary || "#475569");
    root.style.setProperty("--brand-radius", t.border_radius || "8px");
  };

  const refreshTheme = async () => {
    try {
      const res = await fetch("/api/admin/theme");
      if (res.ok) {
        const data = await res.json();
        setTheme(data);
        applyThemeToDOM(data);
      }
    } catch (err) {
      console.warn("Failed to fetch theme from admin:", err);
    }
  };

  useEffect(() => {
    applyThemeToDOM(theme);
    refreshTheme();
  }, []);

  const updateThemeLocal = (newTheme: Partial<ThemeSettings>) => {
    const updated = { ...theme, ...newTheme };
    setTheme(updated);
    applyThemeToDOM(updated);
  };

  return (
    <ThemeContext.Provider value={{ theme, refreshTheme, updateThemeLocal }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
