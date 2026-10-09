import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F3F0EA",
        ivory: "#F7F5F1",
        ink: "#161411",
        clay: "#9C4221",
        claydeep: "#7C3419",
        sage: "#1E3A32",
        sand: "#E7E1D6",
        stone: "#7A736A",
        line: "#DDD6CB",
        moss: "#3E5C4D",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        sheet: "0 24px 80px rgba(22, 20, 17, 0.18)",
      },
      maxWidth: {
        page: "1240px",
      },
    },
  },
  plugins: [],
};

export default config;
