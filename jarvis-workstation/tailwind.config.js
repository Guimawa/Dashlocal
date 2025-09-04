const { tokens } = require("./styles/tokens.js");

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: tokens.colors.primary,
          dark: tokens.colors.primaryDark,
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: tokens.colors.primary,
          700: tokens.colors.primaryDark,
          800: "#1e40af",
          900: "#1e3a8a",
        },
        secondary: {
          DEFAULT: tokens.colors.secondary,
          dark: "#7c3aed",
          50: "#faf5ff",
          100: "#f3e8ff",
          200: "#e9d5ff",
          300: "#d8b4fe",
          400: "#c084fc",
          500: "#a855f7",
          600: tokens.colors.secondary,
          700: "#7c3aed",
          800: "#6b21a8",
          900: "#581c87",
        },
        success: tokens.colors.success,
        warning: tokens.colors.warning,
        error: tokens.colors.error,
        info: tokens.colors.info,
        background: tokens.colors.backgroundLight,
        text: tokens.colors.textPrimary,
        gray: {
          50: "#f9fafb",
          100: "#f3f4f6",
          200: tokens.colors.border,
          300: "#d1d5db",
          400: tokens.colors.textSecondary,
          500: "#6b7280",
          600: "#4b5563",
          700: "#374151",
          800: "#1f2937",
          900: tokens.colors.textPrimary,
        },

        // Tokens handshake ajoutés
        accent: {
          1: tokens.colors.accent[1],
          2: tokens.colors.accent[2],
          3: tokens.colors.accent[3],
          4: tokens.colors.accent[4],
        },
        ink: tokens.colors.ink,
        bg: tokens.colors.bg,
        panel: tokens.colors.panel,
      },
      borderRadius: {
        sm: tokens.radius.sm,
        md: tokens.radius.md,
        lg: tokens.radius.lg,
        "2xl": tokens.radius["2xl"], // Ajouté de handshake
      },
      fontFamily: {
        inter: tokens.typography.fontFamily,
        mono: [
          "JetBrains Mono",
          "Fira Code",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
      spacing: {
        xxs: tokens.spacing.xxs,
        xs: tokens.spacing.xs,
        sm: tokens.spacing.sm,
        md: tokens.spacing.md,
        lg: tokens.spacing.lg,
        xl: tokens.spacing.xl,
        xxl: tokens.spacing.xxl,
      },
      boxShadow: {
        sm: tokens.shadows.sm,
        md: tokens.shadows.md,
        lg: tokens.shadows.lg,
        glow: tokens.shadows.glow, // Ajouté de handshake
        "glow-accent": tokens.shadows.glowAccent,
        "glow-warning": tokens.shadows.glowWarning,
        "glow-error": tokens.shadows.glowError,
      },
      animation: {
        "spin-slow": "spin 3s linear infinite",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [],
};
