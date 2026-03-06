export const colors = {
  bg: "#0A0F1C",
  card: "#111827",
  cardBorder: "#1E293B",
  accent: "#10B981",
  accentDim: "#059669",
  accentGlow: "rgba(16,185,129,0.15)",
  gold: "#F59E0B",
  goldDim: "#D97706",
  blue: "#3B82F6",
  purple: "#8B5CF6",
  red: "#EF4444",
  text: "#F1F5F9",
  textDim: "#94A3B8",
  textMuted: "#64748B",
  white: "#FFFFFF",
  inputBg: "#1E293B",
  inputBorder: "#334155",
};

export const cardStyle = {
  background: colors.card,
  border: `1px solid ${colors.cardBorder}`,
  borderRadius: 16,
  padding: 24,
};

export const headingStyle = {
  fontSize: 28,
  fontWeight: 800,
  letterSpacing: "-0.03em",
  marginBottom: 8,
};

export const subStyle = {
  fontSize: 15,
  color: colors.textDim,
  marginBottom: 0,
};

export const btnPrimary = {
  padding: "12px 24px",
  borderRadius: 10,
  border: "none",
  background: colors.accent,
  color: colors.bg,
  fontWeight: 700,
  fontSize: 14,
  cursor: "pointer",
  fontFamily: "inherit",
};

export const btnSecondary = {
  padding: "12px 24px",
  borderRadius: 10,
  border: `1.5px solid ${colors.inputBorder}`,
  background: "transparent",
  color: colors.textDim,
  fontWeight: 600,
  fontSize: 14,
  cursor: "pointer",
  fontFamily: "inherit",
};

export const fmt = (n) => "$" + (n || 0).toLocaleString("en-US");
