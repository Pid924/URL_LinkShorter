import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0F1115",
          surface: "#171A21",
          raised: "#1F232C",
          border: "#282D38",
          borderStrong: "#363C49",
        },
        text: {
          DEFAULT: "#E8EAF0",
          muted: "#9198AA",
          faint: "#5B6273",
        },
        accent: {
          DEFAULT: "#6C5CE7",
          soft: "#6C5CE71F",
          hover: "#7D6EF0",
        },
        success: {
          DEFAULT: "#2DD4A7",
          soft: "#2DD4A71A",
        },
        warning: {
          DEFAULT: "#F5A623",
          soft: "#F5A6231A",
        },
        danger: {
          DEFAULT: "#F0576B",
          soft: "#F0576B1A",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      boxShadow: {
        panel: "0 8px 30px -12px rgba(0,0,0,0.5)",
      },
      keyframes: {
        blink: {
          "0%, 49%": { opacity: "1" },
          "50%, 100%": { opacity: "0" },
        },
        "slide-in": {
          from: { transform: "translateX(100%)" },
          to: { transform: "translateX(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "pop-in": {
          "0%": { opacity: "0", transform: "scale(0.92) translateY(4px)" },
          "100%": { opacity: "1", transform: "scale(1) translateY(0)" },
        },
      },
      animation: {
        blink: "blink 1.1s step-end infinite",
        "slide-in": "slide-in 0.28s cubic-bezier(0.16, 1, 0.3, 1)",
        "fade-in": "fade-in 0.2s ease-out",
        "pop-in": "pop-in 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
