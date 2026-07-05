import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#FBFBFD",
        surface: "#F5F5F7",
        ink: "#1D1D1F",
        muted: "#86868B",
        accent: {
          DEFAULT: "#0071E3",
          hover: "#0077ED",
        },
        success: "#1DB954",
        error: "#E8453C",
        border: "#D2D2D7",
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
        soft: "0 8px 30px rgba(0,0,0,0.06)",
        card: "0 2px 20px rgba(0,0,0,0.04)",
      },
    },
  },
  plugins: [],
};
export default config;
