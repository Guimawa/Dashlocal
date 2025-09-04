export const tokens = {
  colors: {
    // Tokens Jarvis existants
    primary: "#2563EB",
    primaryDark: "#1E3A8A",
    secondary: "#9333EA",
    success: "#22C55E",
    warning: "#F59E0B",
    error: "#EF4444",
    info: "#0EA5E9",
    backgroundLight: "#FFFFFF",
    backgroundDark: "#0F172A",
    textPrimary: "#111827",
    textSecondary: "#6B7280",
    border: "#E5E7EB",

    // Tokens handshake ajoutés
    accent: {
      1: "#79ffe1", // vert fluo
      2: "#ffd166", // jaune
      3: "#5cb3ff", // bleu
      4: "#f78fb3", // rose
    },
    ink: "#e8eaf6",
    bg: "#0b1020",
    panel: "#0f152b",
  },

  typography: {
    fontFamily: ["Inter", "Roboto", "Helvetica", "Arial", "sans-serif"],
    h1: { size: "2rem", weight: 700, lineHeight: "2.5rem" },
    h2: { size: "1.5rem", weight: 600, lineHeight: "2rem" },
    h3: { size: "1.25rem", weight: 600, lineHeight: "1.75rem" },
    body: { size: "1rem", weight: 400, lineHeight: "1.5rem" },
    caption: { size: "0.875rem", weight: 400, lineHeight: "1.25rem" },
  },

  spacing: {
    xxs: "4px",
    xs: "8px",
    sm: "12px",
    md: "16px",
    lg: "24px",
    xl: "32px",
    xxl: "40px",
  },

  radius: {
    sm: "8px",
    md: "16px",
    lg: "24px",
    "2xl": "1.25rem", // Ajouté de handshake
  },

  shadows: {
    sm: "0 1px 2px rgba(0,0,0,0.05)",
    md: "0 4px 6px rgba(0,0,0,0.1)",
    lg: "0 10px 15px rgba(0,0,0,0.15)",
    glow: "0 0 12px rgba(124, 198, 255, 0.25)", // Ajouté de handshake
    glowAccent: "0 0 20px rgba(121, 255, 225, 0.3)", // Glow vert fluo
    glowWarning: "0 0 20px rgba(255, 209, 102, 0.3)", // Glow jaune
    glowError: "0 0 20px rgba(247, 143, 179, 0.3)", // Glow rose
  },
};
