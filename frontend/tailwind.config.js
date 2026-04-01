export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        charcoal: {
          950: "#020617",
          900: "#0b1120",
          800: "#111826",
          700: "#17203a",
        },
        crowdy: {
          accent: "#7c3aed",
          accent2: "#38bdf8",
          accent3: "#ec4899",
        },
      },
      boxShadow: {
        glow: "0 24px 80px rgba(124, 58, 237, 0.12)",
      },
    },
  },
  plugins: [],
};
