import { useState, useEffect } from 'react';
import { runCostSegAnalysis } from './engine/engine';
import { computeUnitCostBreakdown } from './engine/unitCosts';
import { validateForm, getWarnings } from './engine/validation';
import { generateDepreciationSchedule } from './engine/depreciationSchedule';
import { colors, btnPrimary, btnSecondary } from './theme';
import { StepProperty, StepBuildingInfo, StepReview } from './steps/steps';
import { ResultsDashboard } from './pages/Results';

const DEFAULT_FORM = {
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
  is1031Exchange: false,
  // Renovation fields
  hasRenovation: false,
  renoOver10k: false,
  renoMode: "total",        // "total" or "detailed"
  renoTotalAmount: "",
  renovationItems: [],
  renoIndirectType: "gc",
  renoIndirectCustomRate: "",
  // Advanced detail fields (optional)
  kitchenCabinetryGrade: "standard",
  countertopMaterial: "standard",
  hasWindowCoverings: false,
  windowCoveringsCount: "",
};

function loadSavedForm() {
  try {
    const saved = localStorage.getItem('csp_formData');
    if (saved) return { ...DEFAULT_FORM, ...JSON.parse(saved) };
  } catch {}
  return DEFAULT_FORM;
}

export default function App() {
  const [step, setStep] = useState(0);
  const [results, setResults] = useState(null);
  const [unitCostDetail, setUnitCostDetail] = useState(null);
  const [depSchedule, setDepSchedule] = useState(null);
  const [errors, setErrors] = useState({});
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [disclaimerAgreed, setDisclaimerAgreed] = useState(false);
  const [formData, setFormData] = useState(loadSavedForm);

  // On mount: check if returning from Stripe checkout
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');
    const paymentStatus = params.get('payment');

    if (sessionId && paymentStatus === 'success') {
      try {
        const saved = localStorage.getItem('csp_formData');
        if (saved) {
          const savedForm = JSON.parse(saved);
          setFormData(savedForm);
          const r = runCostSegAnalysis(savedForm);
          const detail = computeUnitCostBreakdown(savedForm, r.depreciableBasis);
          const schedule = generateDepreciationSchedule(r, savedForm);
          setResults(r);
          setUnitCostDetail(detail);
          setDepSchedule(schedule);
          setStep(3);
          window.scrollTo(0, 0);
        } else {
          console.warn('CostSegPro: No saved form data found after Stripe return');
        }
      } catch (err) {
        console.error('Failed to restore session:', err);
      }
    }

    if (paymentStatus === 'cancelled') {
      try {
        const saved = localStorage.getItem('csp_formData');
        if (saved) {
          const savedForm = JSON.parse(saved);
          setFormData(savedForm);
          const r = runCostSegAnalysis(savedForm);
          const detail = computeUnitCostBreakdown(savedForm, r.depreciableBasis);
          const schedule = generateDepreciationSchedule(r, savedForm);
          setResults(r);
          setUnitCostDetail(detail);
          setDepSchedule(schedule);
          setStep(3);
          window.scrollTo(0, 0);
          localStorage.removeItem('csp_formData');
        }
      } catch (err) {
        console.error('Failed to restore session:', err);
      }
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const update = (field, value) => {
    setFormData(prev => {
      const next = { ...prev, [field]: value };
      localStorage.setItem('csp_formData', JSON.stringify(next));
      return next;
    });
    // Clear error for this field when user edits it
    if (errors[field]) {
      setErrors(prev => { const next = { ...prev }; delete next[field]; return next; });
    }
  };

  const handleStartOver = () => {
    localStorage.removeItem('csp_formData');
    setFormData(DEFAULT_FORM);
    setStep(0);
    setResults(null);
    setUnitCostDetail(null);
    setDepSchedule(null);
    setErrors({});
    window.scrollTo(0, 0);
  };

  const handleNext = () => {
    const { valid, errors: stepErrors } = validateForm(formData, step);
    if (!valid) {
      setErrors(stepErrors);
      return;
    }
    setErrors({});
    setStep(step + 1);
    window.scrollTo(0, 0);
  };

  const handleSubmit = () => {
    setShowDisclaimer(true);
  };

  const handleDisclaimerConfirm = () => {
    setShowDisclaimer(false);
    const r = runCostSegAnalysis(formData);
    const detail = computeUnitCostBreakdown(formData, r.depreciableBasis);
    const schedule = generateDepreciationSchedule(r, formData);
    setResults(r);
    setUnitCostDetail(detail);
    setDepSchedule(schedule);
    setStep(3);
    window.scrollTo(0, 0);
  };

  if (step === 3 && results) {
    return <ResultsDashboard results={results} formData={formData} unitCostDetail={unitCostDetail} depSchedule={depSchedule} onBack={() => { setStep(0); setResults(null); setUnitCostDetail(null); setDepSchedule(null); }} onStartOver={handleStartOver} />;
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
            <button onClick={() => { setStep(step - 1); setErrors({}); window.scrollTo(0, 0); }} style={btnSecondary}>{"\u2190"} Back</button>
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
        <div style={{ textAlign: "center", marginTop: 16 }}>
          <button onClick={handleStartOver} style={{ background: "none", border: "none", color: colors.textMuted, fontSize: 12, cursor: "pointer", textDecoration: "underline", padding: 4 }}>
            Clear form & start over
          </button>
        </div>
      </div>

      {/* Disclaimer Modal */}
      {showDisclaimer && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: 24,
        }}
          onClick={() => setShowDisclaimer(false)}
        >
          <div style={{
            background: '#fff', borderRadius: 16, padding: '28px 28px 24px', maxWidth: 480, width: '100%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)', border: `1px solid ${colors.cardBorder}`,
          }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{
              fontWeight: 700, fontSize: 18, color: colors.text, marginBottom: 16,
              paddingBottom: 12, borderBottom: `2px solid ${colors.accent}`,
            }}>
              Disclaimer Acknowledgement
            </div>
            <div style={{ fontSize: 14, color: colors.textDim, lineHeight: 1.7, marginBottom: 20 }}>
              This report is prepared using <strong style={{ color: colors.text }}>IRS-recognized methodology (RCNLD)</strong> and MACRS classification standards in accordance with Federal tax guidelines. The accuracy of this analysis is based on the property information you provided — it is your responsibility to ensure these inputs are correct and complete.
              <br /><br />
              It is the responsibility of you and your tax professional to determine the applicability of this report at the individual state level and to your specific tax situation. For questions or sample reports, contact us at{' '}
              <a href="mailto:costsegplanning@gmail.com" style={{ color: colors.accent, fontWeight: 600 }}>
                costsegplanning@gmail.com
              </a>.
            </div>
            <label style={{
              display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
              padding: '12px 14px', borderRadius: 10, background: disclaimerAgreed ? colors.accentLight : `${colors.cardBorder}44`,
              border: `1.5px solid ${disclaimerAgreed ? colors.accent + '44' : colors.cardBorder}`,
              marginBottom: 20, transition: 'all 0.15s',
            }}>
              <input
                type="checkbox"
                checked={disclaimerAgreed}
                onChange={e => setDisclaimerAgreed(e.target.checked)}
                style={{ width: 18, height: 18, accentColor: colors.accent, cursor: 'pointer' }}
              />
              <span style={{ fontSize: 14, fontWeight: 600, color: colors.text }}>I understand.</span>
            </label>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => { setShowDisclaimer(false); setDisclaimerAgreed(false); }}
                style={{ ...btnSecondary, flex: 1, padding: '12px 0', fontSize: 14 }}
              >
                Cancel
              </button>
              <button
                onClick={handleDisclaimerConfirm}
                disabled={!disclaimerAgreed}
                style={{
                  ...btnPrimary, flex: 1, padding: '12px 0', fontSize: 14,
                  opacity: disclaimerAgreed ? 1 : 0.45, cursor: disclaimerAgreed ? 'pointer' : 'not-allowed',
                }}
              >
                Confirm & Run Analysis
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
