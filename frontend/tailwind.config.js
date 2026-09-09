/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: { DEFAULT: "var(--primary)", light: "var(--primary-light)" },
        secondary: { DEFAULT: "var(--secondary)", light: "var(--secondary-light)" },
        accent: { DEFAULT: "var(--accent)", light: "var(--accent-light)" },
        success: { DEFAULT: "var(--success)", light: "var(--success-light)" },
        warning: { DEFAULT: "var(--warning)", light: "var(--warning-light)" },
        danger: { DEFAULT: "var(--danger)", light: "var(--danger-light)" },
        border: "var(--border)",
        muted: "var(--muted)",
      },
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "Inter", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "ui-monospace", "monospace"],
      },
      boxShadow: {
        soft: "0 1px 2px rgba(20, 20, 43, 0.04), 0 8px 24px rgba(20, 20, 43, 0.06)",
        lift: "0 12px 32px rgba(76, 65, 255, 0.16)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      keyframes: {
        floaty: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.45" },
        },
      },
      animation: {
        floaty: "floaty 5s ease-in-out infinite",
        pulseSoft: "pulseSoft 1.6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
