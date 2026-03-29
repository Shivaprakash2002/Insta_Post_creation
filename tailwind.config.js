/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Bebas Neue'", "cursive"],
        body: ["'DM Sans'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      colors: {
        brand: {
          yellow: "#FFD100",
          orange: "#FF6B00",
          bg: "#0A0A0A",
          surface: "#111111",
          border: "#222222",
          muted: "#444444",
        },
      },
      animation: {
        "pulse-slow": "pulse 3s ease-in-out infinite",
        "slide-up": "slideUp 0.4s ease-out forwards",
        "fade-in": "fadeIn 0.3s ease-out forwards",
        shimmer: "shimmer 1.5s infinite",
      },
      keyframes: {
        slideUp: {
          from: { opacity: 0, transform: "translateY(16px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
        fadeIn: {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};
