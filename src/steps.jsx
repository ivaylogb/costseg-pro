import { ALLOCATION_PROFILES } from './engine';
import { colors, cardStyle, headingStyle, subStyle } from './theme';
import { Input, Select } from './components';

export function StepPropertyType({ formData, update }) {
  const types = Object.entries(ALLOCATION_PROFILES);
  return (
    <div>
      <h2 style={headingStyle}>What type of property is this?</h2>
      <p style={subStyle}>Select the property type that best matches your investment.</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10, marginTop: 24 }}>
        {types.map(([key, val]) => {
          const sel = formData.propertyType === key;
          return (
            <div key={key} onClick={() => update("propertyType", key)} style={{
              padding: "16px 18px", borderRadius: 12, cursor: "pointer",
              border: `1.5px solid ${sel ? colors.accent : colors.inputBorder}`,
              background: sel ? colors.accentGlow : colors.card,
              transition: "all 0.15s",
            }}>
              <div style={{ fontWeight: 600, fontSize: 14, color: sel ? colors.accent : colors.text }}>{val.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function StepPropertyDetails({ formData, update }) {
  return (
    <div>
      <h2 style={headingStyle}>Property & Purchase Details</h2>
      <p style={subStyle}>Enter the financial details of your property acquisition.</p>
      <div style={{ display: "grid", gap: 16, marginTop: 24 }}>
        <Input label="Property Name (optional)" value={formData.propertyName} onChange={v => update("propertyName", v)} placeholder="e.g. Oak Street Rental" />
        <Input label="Property Address" value={formData.address} onChange={v => update("address", v)} placeholder="123 Main St" />
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 12 }}>
          <Input label="City" value={formData.city} onChange={v => update("city", v)} placeholder="San Diego" />
          <Input label="State" value={formData.state} onChange={v => update("state", v)} placeholder="CA" />
          <Input label="ZIP" value={formData.zip} onChange={v => update("zip", v)} placeholder="92024" />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Input label="Purchase Price ($)" value={formData.purchasePrice} onChange={v => update("purchasePrice", v)} placeholder="590000" type="number" />
          <Input label="Land Value ($)" value={formData.landValue} onChange={v => update("landValue", v)} placeholder="100000" type="number" helper="County assessor or appraisal" />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Input label="Year Built" value={formData.yearBuilt} onChange={v => update("yearBuilt", v)} placeholder="1990" type="number" />
          <Input label="Year Purchased / Placed in Service" value={formData.yearPurchased} onChange={v => update("yearPurchased", v)} placeholder="2024" type="number" />
        </div>
      </div>
    </div>
  );
}

export function StepBuildingInfo({ formData, update }) {
  return (
    <div>
      <h2 style={headingStyle}>Building Characteristics</h2>
      <p style={subStyle}>These details help us estimate your component allocations more accurately.</p>
      <div style={{ display: "grid", gap: 16, marginTop: 24 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Input label="Square Footage" value={formData.sqft} onChange={v => update("sqft", v)} placeholder="1500" type="number" />
          <Select label="Number of Stories" value={formData.stories} onChange={v => update("stories", v)} options={[
            { value: "1", label: "1 Story" }, { value: "2", label: "2 Stories" }, { value: "3", label: "3+ Stories" },
          ]} />
        </div>
        <Select label="Building Grade / Quality" value={formData.buildingGrade} onChange={v => update("buildingGrade", v)} options={[
          { value: "economy", label: "Economy / Builder Grade" },
          { value: "standard", label: "Standard" },
          { value: "custom", label: "Custom / Above Average" },
          { value: "luxury", label: "Luxury / High-End" },
        ]} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Input label="Bedrooms" value={formData.bedrooms} onChange={v => update("bedrooms", v)} type="number" />
          <Input label="Bathrooms" value={formData.bathrooms} onChange={v => update("bathrooms", v)} type="number" />
        </div>
        <div
          style={{
            display: "flex", alignItems: "center", gap: 12, padding: "14px 18px",
            borderRadius: 12, background: colors.card, border: `1px solid ${colors.inputBorder}`, cursor: "pointer",
          }}
          onClick={() => update("hasPool", !formData.hasPool)}
        >
          <div style={{
            width: 22, height: 22, borderRadius: 6,
            border: `2px solid ${formData.hasPool ? colors.accent : colors.inputBorder}`,
            background: formData.hasPool ? colors.accent : "transparent",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.15s", fontSize: 13, color: colors.bg,
          }}>{formData.hasPool ? "✓" : ""}</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>Property has a swimming pool</div>
            <div style={{ fontSize: 12, color: colors.textMuted }}>Pools qualify as 15-year land improvements</div>
          </div>
        </div>
        <Input label="Your Marginal Tax Rate (%)" value={formData.taxRate} onChange={v => update("taxRate", v)} placeholder="37" type="number" helper="Federal + state combined rate" />
      </div>
    </div>
  );
}

export function StepReview({ formData }) {
  const profile = ALLOCATION_PROFILES[formData.propertyType];
  const items = [
    ["Property Type", profile?.label],
    ["Address", [formData.address, formData.city, formData.state, formData.zip].filter(Boolean).join(", ") || "—"],
    ["Purchase Price", formData.purchasePrice ? "$" + parseFloat(formData.purchasePrice).toLocaleString("en-US") : "—"],
    ["Land Value", formData.landValue ? "$" + parseFloat(formData.landValue).toLocaleString("en-US") : "—"],
    ["Year Built", formData.yearBuilt || "—"],
    ["Year Purchased", formData.yearPurchased || "—"],
    ["Square Footage", formData.sqft ? `${parseInt(formData.sqft).toLocaleString()} SF` : "—"],
    ["Building Grade", formData.buildingGrade?.charAt(0).toUpperCase() + formData.buildingGrade?.slice(1)],
    ["Pool", formData.hasPool ? "Yes" : "No"],
    ["Tax Rate", formData.taxRate + "%"],
  ];
  return (
    <div>
      <h2 style={headingStyle}>Review Your Information</h2>
      <p style={subStyle}>Confirm everything looks correct before we run the analysis.</p>
      <div style={{ background: colors.card, border: `1px solid ${colors.cardBorder}`, borderRadius: 16, overflow: "hidden", marginTop: 24 }}>
        {items.map(([label, val], i) => (
          <div key={i} style={{
            display: "flex", justifyContent: "space-between", padding: "14px 20px",
            borderBottom: i < items.length - 1 ? `1px solid ${colors.cardBorder}` : "none",
          }}>
            <span style={{ color: colors.textDim, fontSize: 14 }}>{label}</span>
            <span style={{ fontWeight: 600, fontSize: 14 }}>{val}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
