import { useState, useEffect, useRef } from 'react';
import { runCostSegAnalysis } from './engine/engine';
import { computeUnitCostBreakdown } from './engine/unitCosts';
import { validateForm, getWarnings } from './engine/validation';
import { generateDepreciationSchedule } from './engine/depreciationSchedule';
import { colors, btnPrimary, btnSecondary } from './theme';
import { StepProperty, StepBuildingInfo, StepReview } from './steps/steps';
import { ResultsDashboard } from './pages/Results';

const STORAGE_KEY = 'costseg_form';
const defaultFormData = {
  propertyType: "single_family",
  propertyName: "",
  address: "",
  city: "",
  state: "CA",
  zip: "",
  purchasePrice: "",
  landValue: "",
  yearBuilt: "",
  yearPurchased: String(new Date().getFullYear()),
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
  hasRenovation: false,
  renoOver10k: false,
  renoMode: "total",
  renoTotalAmount: "",
  renovationItems: [],
  renoIndirectType: "gc",
  renoIndirectCustomRate: "",
};

function loadSavedForm() {
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...defaultFormData, ...parsed };
    }
  } catch {}
  return defaultFormData;
}

export default function App() {
  const [step, setStep] = useState(0);
  const [results, setResults] = useState(null);
  const [unitCostDetail, setUnitCostDetail] = useState(null);
  const [depSchedule, setDepSchedule] = useState(null);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState(loadSavedForm);
  const skipPush = useRef(false);

  // Persist form data to sessionStorage
  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
  }, [formData]);

  // Push browser history on step change
  useEffect(() => {
    if (skipPush.current) {
      skipPush.current = false;
      return;
    }
    window.history.pushState({ step }, '', window.location.hash || '#/app');
  }, [step]);

  // Handle browser back/forward buttons
  useEffect(() => {
    const onPopState = (e) => {
      if (e.state && typeof e.state.step === 'number') {
        skipPush.current = true;
        setStep(e.state.step);
        setErrors({});
        if (e.state.step < 3) {
          setResults(null);
          setUnitCostDetail(null);
          setDepSchedule(null);
        }
      }
    };
    window.addEventListener('popstate', onPopState);
    // Replace initial history entry with step 0
    window.history.replaceState({ step: 0 }, '', window.location.hash || '#/app');
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

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
    setStep(step + 1);
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
    return <ResultsDashboard results={results} formData={formData} unitCostDetail={unitCostDetail} depSchedule={depSchedule} onBack={() => { setStep(0); setResults(null); setUnitCostDetail(null); setDepSchedule(null); sessionStorage.removeItem(STORAGE_KEY); setFormData(defaultFormData); }} />;
  }

  const steps = [
    { title: "Property", icon: "\uD83C\uDFE0" },
    { title: "Building Info", icon: "\uD83D\uDD28" },
    { title: "Review & Run", icon: "\u26A1" },
  ];

  const warnings = step === 2 ? getWarnings(formData) : [];

  return (
    <div style={{ minHeight: "100vh", background: colors.bg, color: colors.text, fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Instrument+Serif:ital@0;1&display=swap');
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
      <div style={{ borderBottom: `1px solid ${colors.cardBorder}`, padding: "16px 0", background: "rgba(250,250,248,0.85)", backdropFilter: "blur(20px)" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: colors.text }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: `linear-gradient(135deg, ${colors.accent}, ${colors.accentDim})`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13, color: "white" }}>CS</div>
            <div style={{ fontWeight: 700, fontSize: 17, letterSpacing: "-0.03em" }}>CostSeg<span style={{ color: colors.accent }}>Pro</span></div>
          </a>
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
              fontSize: 16, padding: "16px 36px", borderRadius: 12,
              boxShadow: "0 4px 20px rgba(26,127,90,0.35)",
            }}>
              Run Cost Segregation Analysis →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
