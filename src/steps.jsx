import { useState } from 'react';
import { ALLOCATION_PROFILES } from './engine';
import { colors, cardStyle, headingStyle, subStyle } from './theme';
import { Input, Select } from './components';

export function StepPropertyType({ formData, update }) {
  const types = Object.entries(ALLOCATION_PROFILES);
  return (
    <div>
      <h2 style={headingStyle}>What type of property is this?</h2>
      <p style={subStyle}>Select the property type that best matches your investment.</p>
      <div className="csp-property-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10, marginTop: 24 }}>
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

export function StepPropertyDetails({ formData, update, errors = {} }) {
  return (
    <div>
      <h2 style={headingStyle}>Property & Purchase Details</h2>
      <p style={subStyle}>Enter the financial details of your property acquisition.</p>
      <div style={{ display: "grid", gap: 16, marginTop: 24 }}>
        <Input label="Property Name (optional)" value={formData.propertyName} onChange={v => update("propertyName", v)} placeholder="e.g. Oak Street Rental" />
        <Input label="Property Address" value={formData.address} onChange={v => update("address", v)} placeholder="123 Main St" />
        <div className="csp-form-grid-3" style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 12 }}>
          <Input label="City" value={formData.city} onChange={v => update("city", v)} placeholder="San Diego" />
          <Input label="State" value={formData.state} onChange={v => update("state", v)} placeholder="CA" />
          <Input label="ZIP" value={formData.zip} onChange={v => update("zip", v)} placeholder="92024" />
        </div>
        <div className="csp-form-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Input label="Purchase Price ($)" value={formData.purchasePrice} onChange={v => update("purchasePrice", v)} placeholder="590000" type="number" error={errors.purchasePrice} />
          <Input label="Land Value ($)" value={formData.landValue} onChange={v => update("landValue", v)} placeholder="100000" type="number" helper="County assessor or appraisal" error={errors.landValue} />
        </div>
        <div className="csp-form-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Input label="Year Built" value={formData.yearBuilt} onChange={v => update("yearBuilt", v)} placeholder="1990" type="number" error={errors.yearBuilt} />
          <Input label="Year Purchased / Placed in Service" value={formData.yearPurchased} onChange={v => update("yearPurchased", v)} placeholder="2024" type="number" error={errors.yearPurchased} />
        </div>
      </div>
    </div>
  );
}

export function StepBuildingInfo({ formData, update, errors = {} }) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const isResidential = ["single_family", "condo", "multifamily", "apartment"].includes(formData.propertyType);

  return (
    <div>
      <h2 style={headingStyle}>Building Characteristics</h2>
      <p style={subStyle}>These details help us estimate your component allocations more accurately.</p>
      <div style={{ display: "grid", gap: 16, marginTop: 24 }}>
        <div className="csp-form-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Input label="Square Footage" value={formData.sqft} onChange={v => update("sqft", v)} placeholder="1500" type="number" error={errors.sqft} />
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
        <div className="csp-form-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Input label="Bedrooms" value={formData.bedrooms} onChange={v => update("bedrooms", v)} type="number" />
          <Input label="Bathrooms" value={formData.bathrooms} onChange={v => update("bathrooms", v)} type="number" />
        </div>

        {/* Property Features Section */}
        <div style={{ marginTop: 8 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: colors.textDim, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.06em" }}>Property Features</div>
          <div style={{ fontSize: 12, color: colors.textMuted, marginBottom: 16 }}>These significantly impact your cost segregation results. Furnished properties and those with specialty amenities typically qualify for higher accelerated depreciation.</div>

          <div style={{ display: "grid", gap: 10 }}>
            {isResidential && (
              <Toggle label="Short-term rental (avg. stay under 30 days)" sub="Airbnb, VRBO, or vacation rental — affects building recovery period (27.5 vs. 39 years)" checked={formData.isShortTermRental} onChange={() => update("isShortTermRental", !formData.isShortTermRental)} />
            )}
            {isResidential && <Toggle label="Property is furnished" sub="Furnished rentals / STRs have significantly more 5-year personal property (furniture, TVs, decor)" checked={formData.isFurnished} onChange={() => update("isFurnished", !formData.isFurnished)} />}
            <Toggle label="Has a swimming pool" sub="Pools qualify as 15-year land improvements — significant tax benefit" checked={formData.hasPool} onChange={() => update("hasPool", !formData.hasPool)} />
            {formData.hasPool && (
              <div style={{ marginLeft: 34 }}>
                <Select label="Pool Type" value={formData.poolType} onChange={v => update("poolType", v)} options={[
                  { value: "inground_concrete", label: "In-Ground (Concrete / Gunite)" },
                  { value: "inground_vinyl", label: "In-Ground (Vinyl Liner)" },
                  { value: "above_ground", label: "Above Ground" },
                ]} />
              </div>
            )}
            <Toggle label="Has a hot tub or jacuzzi" sub="Hot tubs and related plumbing/electrical qualify as 5-year property" checked={formData.hasHotTub} onChange={() => update("hasHotTub", !formData.hasHotTub)} />
            <Toggle label="Has fireplace insert(s)" sub="Prefabricated fireplace inserts qualify as 5-year personal property" checked={formData.hasFireplace} onChange={() => update("hasFireplace", !formData.hasFireplace)} />
            {formData.hasFireplace && (
              <div style={{ marginLeft: 34 }}>
                <Select label="Number of Fireplaces" value={formData.numFireplaces} onChange={v => update("numFireplaces", v)} options={[
                  { value: "1", label: "1" }, { value: "2", label: "2" }, { value: "3", label: "3" }, { value: "4", label: "4+" },
                ]} />
              </div>
            )}
            <Toggle label="Has game room or theater room" sub="Pool tables, arcade equipment, theater seating, and specialty AV equipment" checked={formData.hasGameRoom} onChange={() => update("hasGameRoom", !formData.hasGameRoom)} />
          </div>
        </div>

        <Input label="Your Marginal Tax Rate (%)" value={formData.taxRate} onChange={v => update("taxRate", v)} placeholder="37" type="number" helper="Federal + state combined rate" error={errors.taxRate} />

        {/* ─── Advanced Details Toggle ─── */}
        <div
          onClick={() => setShowAdvanced(!showAdvanced)}
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "16px 20px", borderRadius: 12, cursor: "pointer",
            background: showAdvanced ? `${colors.blue}15` : colors.card,
            border: `1.5px solid ${showAdvanced ? colors.blue + "55" : colors.inputBorder}`,
            transition: "all 0.2s",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8,
              background: showAdvanced ? `${colors.blue}30` : `${colors.blue}15`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14, color: colors.blue,
            }}>&#9881;</div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, color: showAdvanced ? colors.blue : colors.text }}>
                Advanced Details
              </div>
              <div style={{ fontSize: 12, color: colors.textMuted, marginTop: 1 }}>
                Flooring type, renovation status, deck/porch — improves estimate accuracy
              </div>
            </div>
          </div>
          <div style={{
            fontSize: 18, color: showAdvanced ? colors.blue : colors.textMuted,
            transition: "transform 0.2s",
            transform: showAdvanced ? "rotate(180deg)" : "rotate(0deg)",
          }}>&#9662;</div>
        </div>

        {showAdvanced && (
          <div style={{
            display: "grid", gap: 14, padding: 20, borderRadius: 12,
            background: `${colors.blue}08`,
            border: `1px solid ${colors.blue}22`,
          }}>
            <div style={{ fontSize: 12, color: colors.blue, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>
              Advanced Property Details
            </div>
            <div style={{ fontSize: 12, color: colors.textMuted, marginBottom: 4 }}>
              These inputs calibrate the estimate against real engineering-based cost segregation studies. Leaving defaults still produces a solid estimate.
            </div>

            <Select
              label="Primary Flooring Type"
              value={formData.flooringType}
              onChange={v => update("flooringType", v)}
              options={[
                { value: "default", label: "Not Sure / Mixed" },
                { value: "mostly_removable", label: "Mostly LVT, Laminate, Hardwood, or Carpet (75%+)" },
                { value: "mixed", label: "Mix of Removable & Tile/Stone" },
                { value: "mostly_tile", label: "Mostly Tile or Stone (75%+)" },
              ]}
            />

            <Toggle
              label="Recently renovated (within last 5 years)"
              sub="Renovated properties have newer 5-year components (cabinets, flooring, appliances) inside an older structure"
              checked={formData.recentlyRenovated}
              onChange={() => update("recentlyRenovated", !formData.recentlyRenovated)}
            />

            <Toggle
              label="Has a deck or porch"
              sub="Decks and porches qualify as 15-year land improvements"
              checked={formData.hasDeck}
              onChange={() => update("hasDeck", !formData.hasDeck)}
            />
            {formData.hasDeck && (
              <div style={{ marginLeft: 34 }}>
                <Select label="Deck / Porch Size" value={formData.deckSize} onChange={v => update("deckSize", v)} options={[
                  { value: "small", label: "Small (under 300 SF)" },
                  { value: "medium", label: "Medium (300–700 SF)" },
                  { value: "large", label: "Large (700+ SF)" },
                ]} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Toggle({ label, sub, checked, onChange }) {
  return (
    <div
      style={{
        display: "flex", alignItems: "center", gap: 12, padding: "14px 18px",
        borderRadius: 12, background: colors.card, border: `1px solid ${checked ? colors.accent + "66" : colors.inputBorder}`, cursor: "pointer",
        transition: "all 0.15s",
      }}
      onClick={onChange}
    >
      <div style={{
        width: 22, height: 22, borderRadius: 6, flexShrink: 0,
        border: `2px solid ${checked ? colors.accent : colors.inputBorder}`,
        background: checked ? colors.accent : "transparent",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.15s", fontSize: 13, color: colors.bg,
      }}>{checked ? "\u2713" : ""}</div>
      <div>
        <div style={{ fontWeight: 600, fontSize: 14 }}>{label}</div>
        {sub && <div style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );
}

export function StepReview({ formData, warnings = [] }) {
  const profile = ALLOCATION_PROFILES[formData.propertyType];
  const poolLabels = { inground_concrete: "In-Ground Concrete", inground_vinyl: "In-Ground Vinyl", above_ground: "Above Ground" };
  const deckLabels = { small: "Small", medium: "Medium", large: "Large" };
  const features = [
    formData.isShortTermRental && "Short-Term Rental",
    formData.isFurnished && "Furnished",
    formData.hasPool && `Pool (${poolLabels[formData.poolType] || "Pool"})`,
    formData.hasHotTub && "Hot Tub",
    formData.hasFireplace && `Fireplace(s): ${formData.numFireplaces || 1}`,
    formData.hasGameRoom && "Game Room / Theater",
    formData.hasDeck && `Deck (${deckLabels[formData.deckSize] || formData.deckSize})`,
    formData.recentlyRenovated && "Recently Renovated",
  ].filter(Boolean).join(", ") || "None";

  const flooringLabels = {
    "default": "Not specified",
    "mostly_removable": "Mostly removable (LVT, laminate, hardwood, carpet)",
    "mixed": "Mix of removable & tile/stone",
    "mostly_tile": "Mostly tile or stone",
  };

  const items = [
    ["Property Type", profile?.label],
    ["Address", [formData.address, formData.city, formData.state, formData.zip].filter(Boolean).join(", ") || "\u2014"],
    ["Purchase Price", formData.purchasePrice ? "$" + parseFloat(formData.purchasePrice).toLocaleString("en-US") : "\u2014"],
    ["Land Value", formData.landValue ? "$" + parseFloat(formData.landValue).toLocaleString("en-US") : "\u2014"],
    ["Year Built", formData.yearBuilt || "\u2014"],
    ["Year Purchased", formData.yearPurchased || "\u2014"],
    ["Square Footage", formData.sqft ? `${parseInt(formData.sqft).toLocaleString()} SF` : "\u2014"],
    ["Building Grade", formData.buildingGrade?.charAt(0).toUpperCase() + formData.buildingGrade?.slice(1)],
    ["Property Features", features],
    ["Primary Flooring", flooringLabels[formData.flooringType] || "Not specified"],
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
            <span style={{ fontWeight: 600, fontSize: 14, textAlign: "right", maxWidth: "60%" }}>{val}</span>
          </div>
        ))}
      </div>

      {/* Warnings */}
      {warnings.length > 0 && (
        <div style={{
          marginTop: 16, padding: "14px 18px", borderRadius: 12,
          background: `${colors.gold}12`, border: `1px solid ${colors.gold}33`,
        }}>
          {warnings.map((w, i) => (
            <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginTop: i > 0 ? 8 : 0 }}>
              <div style={{ fontSize: 14, flexShrink: 0 }}>{"\u26A0\uFE0F"}</div>
              <div style={{ fontSize: 12, color: colors.textDim, lineHeight: 1.5 }}>{w}</div>
            </div>
          ))}
        </div>
      )}

      {/* STR / 39-year notice */}
      {formData.isShortTermRental && ["single_family", "condo", "multifamily", "apartment"].includes(formData.propertyType) && (
        <div style={{
          marginTop: 16, padding: "14px 18px", borderRadius: 12,
          background: `${colors.blue}12`, border: `1px solid ${colors.blue}33`,
          display: "flex", gap: 10, alignItems: "flex-start",
        }}>
          <div style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>&#8505;&#65039;</div>
          <div style={{ fontSize: 13, color: colors.textDim, lineHeight: 1.6 }}>
            <strong style={{ color: colors.blue }}>Short-Term Rental Detected:</strong> Properties rented on a transient basis (average stay under 30 days) are classified as <strong style={{ color: colors.text }}>nonresidential real property</strong> and depreciated over <strong style={{ color: colors.text }}>39 years</strong> instead of 27.5 years per IRC \u00A7168(e)(2)(A)(ii). This typically increases the benefit of cost segregation.
          </div>
        </div>
      )}
    </div>
  );
}
