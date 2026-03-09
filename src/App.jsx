import { useState } from 'react';
import { runCostSegAnalysis } from './engine/engine';
import { computeUnitCostBreakdown } from './engine/unitCosts';
import { validateForm, getWarnings } from './engine/validation';
import { generateDepreciationSchedule } from './engine/depreciationSchedule';
import { colors, btnPrimary, btnSecondary, fmt } from './theme';
import { StepProperty, StepBuildingInfo, StepReview } from './steps/steps';
import { ResultsDashboard } from './pages/Results';

export default function App() {
  const [step, setStep] = useState(0);
  const [showTeaser, setShowTeaser] = useState(false);
  const [teaserData, setTeaserData] = useState(null);
  const [results, setResults] = useState(null);
  const [unitCostDetail, setUnitCostDetail] = useState(null);
  const [depSchedule, setDepSchedule] = useState(null);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    propertyType: "single_family",
    propertyName: "",
    address: "",
    city: "",
    state: "CA",
    zip: "",
    purchasePrice: "",
    landValue: "",
    yearBuilt: "",
    yearPurchased: "",
    sqft: "",
    stories: "1",
    buildingGrade: "standard",
    hasPool: false,
    isFurnished: false,
    isShortTermRental: false,
    hasHotTub: false,
    hasFireplace: false,
    numFireplaces: "1",
    hasGameRoom: false,
    hasDeck: false,
    deckSize: "medium",
    poolType: "inground_concrete",
    flooringType: "default",
    recentlyRenovated: false,
    bedrooms: "3",
    bathrooms: "2",
    taxRate: "37",
    // Renovation fields
    hasRenovation: false,
    renoMode: "total",        // "total" or "detailed"
    renoTotalAmount: "",
    renovationItems: [],
    renoIndirectType: "gc",
    renoIndirectCustomRate: "",
  });

  const update = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user edits it
    if (errors[field]) {
      setErrors(prev => { const next = { ...prev }; delete next[field]; return next; });
    }
  };

  const handleNext = () => {
    const { valid, errors: stepErrors } = validateForm(formData, step);
    if (!valid) {
      setErrors(stepErrors);
      return;
    }
    setErrors({});
    
    // Show teaser when leaving step 0
    if (step === 0) {
      const quickR = runCostSegAnalysis({ ...formData, sqft: "1500", taxRate: formData.taxRate || "37" });
      if (quickR.year1TaxSavings > 0) {
        setTeaserData(quickR);
        setShowTeaser(true);
        return;
      }
    }
    setStep(step + 1);
  };

  const dismissTeaser = () => {
    setShowTeaser(false);
    setTeaserData(null);
    setStep(1);
  };

  const handleSubmit = () => {
    const r = runCostSegAnalysis(formData);
    const detail = computeUnitCostBreakdown(formData, r.depreciableBasis);
    const schedule = generateDepreciationSchedule(r, formData);
    setResults(r);
    setUnitCostDetail(detail);
    setDepSchedule(schedule);
    setStep(3);
  };

  if (step === 3 && results) {
    return <ResultsDashboard results={results} formData={formData} unitCostDetail={unitCostDetail} depSchedule={depSchedule} onBack={() => { setStep(0); setResults(null); setUnitCostDetail(null); setDepSchedule(null); setShowTeaser(false); setTeaserData(null); }} />;
  }

  // ── Teaser interstitial between Step 0 and Step 1 ──
  if (showTeaser && teaserData) {
    const t = teaserData;
    return (
      <div style={{ minHeight: "100vh", background: `linear-gradient(180deg, ${colors.bg} 0%, #0F172A 100%)`, color: colors.text, fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
        {/* Header */}
        <div style={{ borderBottom: `1px solid ${colors.cardBorder}`, padding: "20px 0" }}>
          <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg, ${colors.accent}, ${colors.blue})`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 16, color: colors.bg }}>CS</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, letterSpacing: "-0.02em" }}>CostSeg<span style={{ color: colors.accent }}>Pro</span></div>
              <div style={{ fontSize: 11, color: colors.textMuted }}>Accelerated Depreciation Analysis</div>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 560, margin: "0 auto", padding: "60px 24px", textAlign: "center" }}>
          <div style={{ fontSize: 14, color: colors.accent, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
            Based on your property
          </div>
          <div style={{ fontSize: 13, color: colors.textMuted, marginBottom: 28 }}>
            {[formData.address, formData.city, formData.state].filter(Boolean).join(", ")} &middot; {fmt(t.purchasePrice)}
          </div>

          {/* Big number */}
          <div style={{
            padding: "32px 24px", borderRadius: 20, marginBottom: 24,
            background: `linear-gradient(135deg, ${colors.accent}12, ${colors.blue || "#3B82F6"}08)`,
            border: `1.5px solid ${colors.accent}33`,
          }}>
            <div style={{ fontSize: 13, color: colors.textMuted, marginBottom: 6 }}>Estimated Year 1 Tax Savings</div>
            <div style={{ fontSize: 48, fontWeight: 800, color: colors.accent, letterSpacing: "-0.03em", lineHeight: 1.1 }}>
              {fmt(t.year1TaxSavings)}
            </div>
            <div style={{ fontSize: 13, color: colors.textDim, marginTop: 10 }}>
              {fmt(t.segregatedTotal)} accelerated &middot; {t.bonusRate}% bonus depreciation
            </div>
          </div>

          {/* Breakdown pills */}
          <div style={{ display: "flex", justifyContent: "center", gap: 12, marginBottom: 32, flexWrap: "wrap" }}>
            <div style={{ padding: "8px 16px", borderRadius: 10, background: `${colors.accent}12`, border: `1px solid ${colors.accent}33` }}>
              <div style={{ fontSize: 11, color: colors.textMuted }}>5-Yr Property</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: colors.accent }}>{t.pp5Pct}%</div>
            </div>
            <div style={{ padding: "8px 16px", borderRadius: 10, background: `${colors.blue || "#3B82F6"}12`, border: `1px solid ${colors.blue || "#3B82F6"}33` }}>
              <div style={{ fontSize: 11, color: colors.textMuted }}>15-Yr Property</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: colors.blue || "#3B82F6" }}>{t.li15Pct}%</div>
            </div>
            <div style={{ padding: "8px 16px", borderRadius: 10, background: `${colors.gold}12`, border: `1px solid ${colors.gold}33` }}>
              <div style={{ fontSize: 11, color: colors.textMuted }}>5-Yr NPV Benefit</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: colors.gold }}>{fmt(t.npvBenefit)}</div>
            </div>
          </div>

          <div style={{ fontSize: 13, color: colors.textMuted, lineHeight: 1.6, marginBottom: 28 }}>
            This is a quick estimate using default assumptions. Add your building details for a more accurate, component-level analysis with a downloadable report.
          </div>

          <button onClick={dismissTeaser} style={{
            ...btnPrimary,
            background: `linear-gradient(135deg, ${colors.accent}, ${colors.accentDim})`,
            fontSize: 16, padding: "16px 40px",
            boxShadow: `0 0 40px ${colors.accentGlow}`,
          }}>
            Get Detailed Analysis {"\u2192"}
          </button>

          <div style={{ marginTop: 16 }}>
            <button onClick={() => { setShowTeaser(false); setTeaserData(null); setStep(0); }} style={{
              background: "transparent", border: "none", color: colors.textMuted,
              fontSize: 13, cursor: "pointer", fontFamily: "inherit",
            }}>
              {"\u2190"} Edit property details
            </button>
          </div>
        </div>
      </div>
    );
  }

  const steps = [
    { title: "Property", icon: "\uD83C\uDFE0" },
    { title: "Building Info", icon: "\uD83D\uDD28" },
    { title: "Review & Run", icon: "\u26A1" },
  ];

  const warnings = step === 2 ? getWarnings(formData) : [];

  return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(180deg, ${colors.bg} 0%, #0F172A 100%)`, color: colors.text, fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      <style>{`
        @media (max-width: 600px) {
          .csp-form-grid-2 { grid-template-columns: 1fr !important; }
          .csp-form-grid-3 { grid-template-columns: 1fr !important; }
          .csp-form-heading { font-size: 22px !important; }
          .csp-property-grid { grid-template-columns: 1fr !important; }
          .csp-nav-btn { font-size: 13px !important; padding: 10px 18px !important; }
          .csp-run-btn { font-size: 14px !important; padding: 12px 24px !important; }
          .csp-step-label { font-size: 9px !important; }
        }
      `}</style>
      {/* Header */}
      <div style={{ borderBottom: `1px solid ${colors.cardBorder}`, padding: "20px 0" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg, ${colors.accent}, ${colors.blue})`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 16, color: colors.bg }}>CS</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, letterSpacing: "-0.02em" }}>CostSeg<span style={{ color: colors.accent }}>Pro</span></div>
              <div style={{ fontSize: 11, color: colors.textMuted }}>Accelerated Depreciation Analysis</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 24px" }}>
        {/* Progress */}
        <div style={{ display: "flex", gap: 8, marginBottom: 40 }}>
          {steps.map((s, i) => (
            <div key={i} onClick={() => i <= step && setStep(i)} style={{ flex: 1, cursor: i <= step ? "pointer" : "default", opacity: i <= step ? 1 : 0.35 }}>
              <div style={{
                height: 3, borderRadius: 2, marginBottom: 8,
                background: i < step ? colors.accent : i === step ? `linear-gradient(90deg, ${colors.accent}, ${colors.blue})` : colors.inputBorder,
              }} />
              <div className="csp-step-label" style={{ fontSize: 11, color: i <= step ? colors.textDim : colors.textMuted, display: "flex", alignItems: "center", gap: 4 }}>
                <span>{s.icon}</span> {s.title}
              </div>
            </div>
          ))}
        </div>

        {/* Step Content */}
        {step === 0 && <StepProperty formData={formData} update={update} errors={errors} />}
        {step === 1 && <StepBuildingInfo formData={formData} update={update} errors={errors} />}
        {step === 2 && <StepReview formData={formData} warnings={warnings} />}

        {/* Validation Errors Summary */}
        {Object.keys(errors).length > 0 && (
          <div style={{
            marginTop: 16, padding: "12px 16px", borderRadius: 10,
            background: `${colors.red}15`, border: `1px solid ${colors.red}33`,
          }}>
            <div style={{ fontSize: 13, color: colors.red, fontWeight: 600, marginBottom: 4 }}>Please fix the following:</div>
            {Object.values(errors).map((err, i) => (
              <div key={i} style={{ fontSize: 12, color: colors.red, opacity: 0.9, marginTop: 2 }}>{"\u2022"} {err}</div>
            ))}
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 32 }}>
          {step > 0 ? (
            <button onClick={() => { setStep(step - 1); setErrors({}); }} style={btnSecondary}>{"\u2190"} Back</button>
          ) : <div />}
          {step < 2 ? (
            <button onClick={handleNext} style={btnPrimary}>Continue {"\u2192"}</button>
          ) : (
            <button onClick={handleSubmit} style={{
              ...btnPrimary,
              background: `linear-gradient(135deg, ${colors.accent}, ${colors.accentDim})`,
              fontSize: 16, padding: "14px 32px",
              boxShadow: `0 0 30px ${colors.accentGlow}`,
            }}>
              {"\u26A1"} Run Cost Segregation Analysis
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
