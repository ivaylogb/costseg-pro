import { useState } from 'react';
import { runCostSegAnalysis } from './engine';
import { colors, btnPrimary, btnSecondary } from './theme';
import { StepPropertyType, StepPropertyDetails, StepBuildingInfo, StepReview } from './steps';
import { ResultsDashboard } from './Results';

export default function App() {
  const [step, setStep] = useState(0);
  const [results, setResults] = useState(null);
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
    hasHotTub: false,
    hasFireplace: false,
    numFireplaces: "1",
    hasGameRoom: false,
    bedrooms: "3",
    bathrooms: "2",
    taxRate: "37",
  });

  const update = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const handleSubmit = () => {
    const r = runCostSegAnalysis(formData);
    setResults(r);
    setStep(4);
  };

  if (step === 4 && results) {
    return <ResultsDashboard results={results} formData={formData} onBack={() => { setStep(0); setResults(null); }} />;
  }

  const steps = [
    { title: "Property Type", icon: "🏠" },
    { title: "Property Details", icon: "📋" },
    { title: "Building Info", icon: "🔨" },
    { title: "Review & Run", icon: "⚡" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(180deg, ${colors.bg} 0%, #0F172A 100%)`, color: colors.text, fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
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
              <div style={{ fontSize: 11, color: i <= step ? colors.textDim : colors.textMuted, display: "flex", alignItems: "center", gap: 4 }}>
                <span>{s.icon}</span> {s.title}
              </div>
            </div>
          ))}
        </div>

        {/* Step Content */}
        {step === 0 && <StepPropertyType formData={formData} update={update} />}
        {step === 1 && <StepPropertyDetails formData={formData} update={update} />}
        {step === 2 && <StepBuildingInfo formData={formData} update={update} />}
        {step === 3 && <StepReview formData={formData} />}

        {/* Navigation */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 32 }}>
          {step > 0 ? (
            <button onClick={() => setStep(step - 1)} style={btnSecondary}>← Back</button>
          ) : <div />}
          {step < 3 ? (
            <button onClick={() => setStep(step + 1)} style={btnPrimary}>Continue →</button>
          ) : (
            <button onClick={handleSubmit} style={{
              ...btnPrimary,
              background: `linear-gradient(135deg, ${colors.accent}, ${colors.accentDim})`,
              fontSize: 16, padding: "14px 32px",
              boxShadow: `0 0 30px ${colors.accentGlow}`,
            }}>
              ⚡ Run Cost Segregation Analysis
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
