import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        notes: {
          canvas: "#121212",
          panel: "#151515",
          raised: "#181818",
          border: "rgba(255, 255, 255, 0.08)",
          text: "#f4f4f5",
          muted: "#a1a1aa",
        },
        semantic: {
          green: "#22c55e",
          yellow: "#eab308",
          red: "#ef4444",
          blue: "#3b82f6",
          purple: "#a855f7",
        },
      },
      fontFamily: {
        sans: ["var(--font-ibm)", "system-ui", "sans-serif"],
        display: ["var(--font-caveat)", "cursive"],
      },
    },
  },
  plugins: [],
};

export default config;
