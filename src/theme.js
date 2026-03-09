// ─── THEME: matches Landing.jsx design language ─────────────────────────────
// Light, warm palette. Single accent (deep green). DM Sans + Instrument Serif.
// No competing neon colors. Professional, clean, trustworthy.

export const colors = {
  bg: "#FAFAF8",
  card: "#FFFFFF",
  cardBorder: "#E4E2DD",
  accent: "#1A7F5A",
  accentDim: "#145F44",
  accentGlow: "rgba(26,127,90,0.08)",
  accentLight: "#E8F5EE",
  gold: "#B8860B",
  goldDim: "#8B6914",
  blue: "#1A7F5A",        // intentionally same as accent — one color system
  purple: "#6B5B95",
  red: "#C0392B",
  text: "#1A1917",
  textDim: "#5C5A54",
  textMuted: "#8A877F",
  white: "#FFFFFF",
  inputBg: "#FFFFFF",
  inputBorder: "#D4D2CC",
  // Dark section (for teaser / special moments)
  darkBg: "#1B2A4A",
  darkCard: "rgba(255,255,255,0.06)",
  darkBorder: "rgba(255,255,255,0.1)",
  darkText: "#FFFFFF",
  darkTextDim: "rgba(255,255,255,0.6)",
  darkTextMuted: "rgba(255,255,255,0.4)",
  darkAccent: "#5BDFAA",
};

export const cardStyle = {
  background: colors.card,
  border: `1px solid ${colors.cardBorder}`,
  borderRadius: 16,
  padding: 24,
};

export const headingStyle = {
  fontFamily: "'Instrument Serif', serif",
  fontSize: 32,
  fontWeight: 400,
  letterSpacing: "-0.02em",
  marginBottom: 8,
  color: colors.text,
};

export const subStyle = {
  fontSize: 16,
  color: colors.textDim,
  marginBottom: 0,
  lineHeight: 1.6,
};

export const btnPrimary = {
  padding: "12px 24px",
  borderRadius: 10,
  border: "none",
  background: colors.accent,
  color: "#FFFFFF",
  fontWeight: 700,
  fontSize: 14,
  cursor: "pointer",
  fontFamily: "inherit",
  boxShadow: "0 2px 12px rgba(26,127,90,0.25)",
  transition: "all 0.2s",
};

export const btnSecondary = {
  padding: "12px 24px",
  borderRadius: 10,
  border: `1.5px solid ${colors.cardBorder}`,
  background: "transparent",
  color: colors.text,
  fontWeight: 600,
  fontSize: 14,
  cursor: "pointer",
  fontFamily: "inherit",
  transition: "all 0.2s",
};

export const fmt = (n) => "$" + (n || 0).toLocaleString("en-US");

