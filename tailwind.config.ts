import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "var(--brand-primary, #1e3a8a)",
          secondary: "var(--brand-secondary, #0284c7)",
          accent: "var(--brand-accent, #f59e0b)",
          bg: "var(--brand-bg, #f8fafc)",
          surface: "var(--brand-surface, #ffffff)",
          border: "var(--brand-border, #e2e8f0)",
          textPrimary: "var(--brand-text-primary, #0f172a)",
          textSecondary: "var(--brand-text-secondary, #475569)",
        }
      },
      borderRadius: {
        brand: "var(--brand-radius, 8px)",
      }
    },
  },
  plugins: [],
};
export default config;
