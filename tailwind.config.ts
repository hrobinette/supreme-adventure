import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // AppOmni-inspired dark palette (swap these to match an official brand kit).
        ink: "#070B16", // page base
        "ink-2": "#0B1120", // page gradient end
        surface: "#0F1729", // card
        "surface-2": "#131D33", // elevated / hover
        line: "#1E2A44", // borders
        muted: "#8A99B5", // secondary text
        fg: "#E6ECF5", // primary text
        brand: {
          DEFAULT: "#19E3B1", // signature teal-green
          dark: "#0FB98E",
          soft: "#10241F",
        },
        accent: {
          sky: "#38BDF8",
          violet: "#8B5CF6",
          pink: "#EC4899",
          amber: "#F59E0B",
        },
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(25,227,177,0.15), 0 8px 40px -12px rgba(25,227,177,0.35)",
        card: "0 8px 30px -12px rgba(0,0,0,0.6)",
      },
      backgroundImage: {
        "brand-gradient":
          "linear-gradient(135deg, #19E3B1 0%, #38BDF8 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
