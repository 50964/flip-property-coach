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
        flip: {
          dark: "#0F172A",
          slate: "#1E2937",
          accent: "#D4AF37",
          gold: "#F59E0B",
          success: "#10B981",
          danger: "#EF4444",
        },
      },
    },
  },
  plugins: [],
};
export default config;