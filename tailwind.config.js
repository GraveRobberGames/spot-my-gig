/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require("nativewind/preset")],
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./index.{js,jsx,ts,tsx}",
    "./screens/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}", // if using Expo Router
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Poppins", "System"],
      },
      colors: {
        "primary-1": "#EBE7FC",
        "primary-2": "#D6CFF9",
        "primary-3": "#C2B7F6",
        "primary-4": "#A796F2",
        "primary-5": "#775EEB",
        "primary-6": "#6550C8",
        "primary-7": "#5342A4",
        "primary-8": "#413481",
        "accent-cyan": "#22D3EE",
        "accent-lime": "#A3E635",
        success: "#22C55E",
        warning: "#F59E0B",
        danger: "#EF4444",

        bg: "#0B0B10",
        surface: "#12121A",
        card: "#191927",
        border: "rgba(255,255,255,0.10)",

        text: "#F3F4F6",
        muted: "#A1A1AA",
      },
    },
  },
  plugins: [],
};
