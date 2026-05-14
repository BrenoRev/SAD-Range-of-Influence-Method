import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        page: "#fafafa",
        surface: "#ffffff",
        line: "#e6e6e6",
        muted: "#6b7280",
        ink: "#1a1a1a",
        accent: {
          DEFAULT: "#5e6ad2",
          hover: "#4f5ac0",
          soft: "#eef0fb",
        },
        ok: {
          DEFAULT: "#16a34a",
          soft: "#e7f6ec",
        },
        danger: "#dc2626",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "Menlo", "monospace"],
      },
      boxShadow: { card: "0 1px 2px rgba(0,0,0,0.04)" },
      borderRadius: { md: "8px", lg: "12px" },
    },
  },
  plugins: [],
} satisfies Config;
