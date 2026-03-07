import { colors, cardStyle, fmt } from './theme';

// Strip $, commas, spaces from pasted numeric values
function cleanNumeric(val) {
  if (typeof val !== 'string') return val;
  return val.replace(/[$,\s]/g, '');
}

export function Input({ label, value, onChange, placeholder, type = "text", helper, error, numeric }) {
  const handleChange = (v) => {
    onChange(numeric ? cleanNumeric(v) : v);
  };
  return (
    <div>
      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: error ? colors.red : colors.textDim, marginBottom: 6 }}>{label}</label>
      <input
        type={numeric ? "text" : type} inputMode={numeric ? "decimal" : undefined}
        value={value} onChange={e => handleChange(e.target.value)} placeholder={placeholder}
        style={{
          width: "100%", padding: "12px 14px", borderRadius: 10, border: `1.5px solid ${error ? colors.red + "99" : colors.inputBorder}`,
          background: error ? colors.red + "08" : colors.inputBg, color: colors.text, fontSize: 15, outline: "none",
          fontFamily: "inherit", boxSizing: "border-box",
          transition: "border-color 0.15s",
        }}
        onFocus={e => e.target.style.borderColor = error ? colors.red : colors.accent}
        onBlur={e => e.target.style.borderColor = error ? colors.red + "99" : colors.inputBorder}
      />
      {error && <div style={{ fontSize: 11, color: colors.red, marginTop: 4 }}>{error}</div>}
      {!error && helper && <div style={{ fontSize: 11, color: colors.textMuted, marginTop: 4 }}>{helper}</div>}
    </div>
  );
}

export function Select({ label, value, onChange, options }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: colors.textDim, marginBottom: 6 }}>{label}</label>
      <select
        value={value} onChange={e => onChange(e.target.value)}
        style={{
          width: "100%", padding: "12px 14px", borderRadius: 10, border: `1.5px solid ${colors.inputBorder}`,
          background: colors.inputBg, color: colors.text, fontSize: 15, outline: "none",
          fontFamily: "inherit", boxSizing: "border-box", cursor: "pointer",
          appearance: "none",
        }}
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

export function StatCard({ label, value, sub, color }) {
  return (
    <div style={{ ...cardStyle, borderTop: `3px solid ${color}` }}>
      <div style={{ fontSize: 12, color: colors.textMuted, fontWeight: 600, marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em" }}>{value}</div>
      <div style={{ fontSize: 12, color: colors.textDim, marginTop: 4 }}>{sub}</div>
    </div>
  );
}

export function AllocRow({ color, label, value, pct }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ width: 12, height: 12, borderRadius: 3, background: color, flexShrink: 0 }} />
      <div style={{ flex: 1, fontSize: 14 }}>{label}</div>
      <div style={{ fontWeight: 600, fontSize: 14, minWidth: 90, textAlign: "right" }}>{value}</div>
      <div style={{ fontSize: 13, color: colors.textDim, minWidth: 50, textAlign: "right" }}>{pct}%</div>
    </div>
  );
}

export function ComponentTable({ title, items, color, total }) {
  return (
    <div style={cardStyle}>
      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12, color }}>{title}</div>
      <div style={{ display: "grid", gap: 6 }}>
        {items.map((item, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "4px 0", borderBottom: i < items.length - 1 ? `1px solid ${colors.cardBorder}` : "none" }}>
            <span style={{ color: colors.textDim }}>{item.name}</span>
            <span style={{ fontWeight: 600 }}>{fmt(item.value)}</span>
          </div>
        ))}
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 700, paddingTop: 8, borderTop: `1px solid ${color}44` }}>
          <span>Total</span>
          <span style={{ color }}>{fmt(total)}</span>
        </div>
      </div>
    </div>
  );
}
