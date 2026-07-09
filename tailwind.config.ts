import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ocean: {
          50: "#eef9ff",
          100: "#d9f1ff",
          200: "#bce6ff",
          300: "#8ed8ff",
          400: "#56c2ff",
          500: "#2da4f5",
          600: "#1a82d1",
          700: "#1768aa",
          800: "#19578c",
          900: "#194a73",
          950: "#102e4a",
        },
        ice: {
          50: "#f3fbfd",
          100: "#e1f6fb",
          900: "#0b3a4a",
        },
        coral: {
          400: "#ff8a73",
          500: "#ff6b4a",
          600: "#f04e2c",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-poppins)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 2px 12px -2px rgba(16, 46, 74, 0.08)",
        "card-hover": "0 8px 24px -4px rgba(16, 46, 74, 0.15)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};

export default config;
