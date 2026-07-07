import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "rgb(var(--color-background) / <alpha-value>)",
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        card: "rgb(var(--color-card) / <alpha-value>)",
        ink: "rgb(var(--color-ink) / <alpha-value>)",
        muted: "rgb(var(--color-muted) / <alpha-value>)",
        accent: {
          DEFAULT: "#0071E3",
          hover: "#0077ED",
        },
        success: "#1DB954",
        error: "#E8453C",
        border: "rgb(var(--color-border) / <alpha-value>)",
        dark: "#000000",
        darksoft: "#1D1D1F",
      },
      fontFamily: {
        heading: ["var(--font-inter-tight)", "Inter Tight", "system-ui", "sans-serif"],
        body: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        soft: "var(--shadow-soft)",
        card: "var(--shadow-card)",
        nav: "var(--shadow-nav)",
      },
    },
  },
  plugins: [],
};
export default config;
