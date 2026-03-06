import { colors, cardStyle, btnSecondary, fmt } from './theme';
import { StatCard, AllocRow, ComponentTable } from './components';

export function ResultsDashboard({ results: r, formData, onBack }) {
  return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(180deg, ${colors.bg} 0%, #0F172A 100%)`, color: colors.text, fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      {/* Header */}
      <div style={{ borderBottom: `1px solid ${colors.cardBorder}`, padding: "16px 0" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg, ${colors.accent}, ${colors.blue})`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 16, color: colors.bg }}>CS</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>CostSeg<span style={{ color: colors.accent }}>Pro</span></div>
              <div style={{ fontSize: 11, color: colors.textMuted }}>Analysis Results</div>
            </div>
          </div>
          <button onClick={onBack} style={btnSecondary}>← New Analysis</button>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px" }}>
        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontSize: 13, color: colors.accent, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Estimated First-Year Tax Savings</div>
          <div style={{ fontSize: 56, fontWeight: 800, letterSpacing: "-0.03em", background: `linear-gradient(135deg, ${colors.accent}, ${colors.gold})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            {fmt(r.year1TaxSavings)}
          </div>
          <div style={{ fontSize: 14, color: colors.textDim, marginTop: 8 }}>
            {r.propertyType} · {fmt(r.purchasePrice)} purchase · {r.bonusRate}% bonus depreciation ({r.yearPurchased})
          </div>
        </div>

        {/* Summary Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginBottom: 24 }}>
          <StatCard label="Total Segregated" value={fmt(r.segregatedTotal)} sub={`${r.segregatedPct}% of depreciable basis`} color={colors.accent} />
          <StatCard label="Year 1 Bonus Deduction" value={fmt(r.bonusAmount)} sub={`At ${r.bonusRate}% bonus rate`} color={colors.gold} />
          <StatCard label="5-Year NPV Benefit" value={fmt(r.npvBenefit)} sub={`At ${r.taxRate}% tax rate, 5% discount`} color={colors.blue} />
        </div>

        {/* Allocation Breakdown */}
        <div style={{ ...cardStyle, marginBottom: 24 }}>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 20 }}>Cost Allocation Summary</div>

          {/* Visual bar */}
          <div style={{ display: "flex", height: 32, borderRadius: 8, overflow: "hidden", marginBottom: 20, gap: 2 }}>
            <div style={{ width: `${r.landPct}%`, background: colors.textMuted, minWidth: parseFloat(r.landPct) > 3 ? "auto" : 0 }} />
            <div style={{ width: `${parseFloat(r.buildingPct) * (100 - parseFloat(r.landPct)) / 100}%`, background: colors.blue }} />
            <div style={{ width: `${parseFloat(r.li15Pct) * (100 - parseFloat(r.landPct)) / 100}%`, background: colors.gold }} />
            <div style={{ width: `${parseFloat(r.pp5Pct) * (100 - parseFloat(r.landPct)) / 100}%`, background: colors.accent }} />
          </div>

          <div style={{ display: "grid", gap: 10 }}>
            <AllocRow color={colors.textMuted} label="Land (Non-Depreciable)" value={fmt(r.landValue)} pct={r.landPct} />
            <AllocRow color={colors.blue} label={`Building (${r.buildingLife}-Year SL)`} value={fmt(r.buildingTotal)} pct={r.buildingPct} />
            <AllocRow color={colors.gold} label="Land Improvements (15-Year 150% DB)" value={fmt(r.li15Total)} pct={r.li15Pct} />
            <AllocRow color={colors.accent} label="Personal Property (5-Year 200% DB)" value={fmt(r.pp5Total)} pct={r.pp5Pct} />
          </div>

          <div style={{ borderTop: `1px solid ${colors.cardBorder}`, marginTop: 16, paddingTop: 16, display: "flex", justifyContent: "space-between", fontWeight: 700 }}>
            <span>Total Depreciable Basis</span>
            <span>{fmt(r.depreciableBasis)}</span>
          </div>
        </div>

        {/* Component Details */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16, marginBottom: 24 }}>
          <ComponentTable title="5-Year Personal Property" items={r.pp5Components} color={colors.accent} total={r.pp5Total} />
          <ComponentTable title="15-Year Land Improvements" items={r.li15Components} color={colors.gold} total={r.li15Total} />
        </div>

        {/* Depreciation Comparison */}
        <div style={{ ...cardStyle, marginBottom: 24 }}>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>Year 1 Depreciation Comparison</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
            <div style={{ padding: 20, borderRadius: 12, background: colors.accentGlow, border: `1px solid ${colors.accent}33` }}>
              <div style={{ fontSize: 12, color: colors.accent, fontWeight: 600, marginBottom: 4 }}>WITH COST SEGREGATION</div>
              <div style={{ fontSize: 28, fontWeight: 800 }}>{fmt(r.csYear1Dep)}</div>
              <div style={{ fontSize: 12, color: colors.textDim, marginTop: 4 }}>Year 1 total depreciation</div>
            </div>
            <div style={{ padding: 20, borderRadius: 12, background: `${colors.red}11`, border: `1px solid ${colors.red}33` }}>
              <div style={{ fontSize: 12, color: colors.red, fontWeight: 600, marginBottom: 4 }}>WITHOUT COST SEGREGATION</div>
              <div style={{ fontSize: 28, fontWeight: 800 }}>{fmt(r.noCsYear1Dep)}</div>
              <div style={{ fontSize: 12, color: colors.textDim, marginTop: 4 }}>Year 1 straight-line only</div>
            </div>
          </div>
          <div style={{ textAlign: "center", marginTop: 16, padding: 16, borderRadius: 12, background: `${colors.gold}11`, border: `1px solid ${colors.gold}33` }}>
            <div style={{ fontSize: 12, color: colors.gold, fontWeight: 600 }}>ADDITIONAL YEAR 1 DEDUCTION</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: colors.gold }}>{fmt(r.year1Benefit)}</div>
          </div>
        </div>

        {/* Disclaimer */}
        <div style={{ ...cardStyle, borderColor: `${colors.gold}33`, background: `${colors.gold}08` }}>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <div style={{ fontSize: 20, flexShrink: 0 }}>⚠️</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: colors.gold, marginBottom: 6 }}>Important Disclaimer</div>
              <div style={{ fontSize: 13, color: colors.textDim, lineHeight: 1.6 }}>
                This is a <strong style={{ color: colors.text }}>preliminary estimate</strong> for planning purposes only. It is not a formal cost segregation study and should not be attached to your tax return. The allocations are based on industry benchmarks and the property characteristics you provided. For filing purposes, consult with your CPA or tax advisor. A formal engineering-based study may be required for larger properties or if selected for audit. This analysis does not constitute tax advice.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
