import { useState, useEffect } from 'react';
import { ALLOCATION_PROFILES } from '../engine/engine';
import { RENO_CATEGORIES, INDIRECT_COST_OPTIONS } from '../engine/renovation';
import { estimateLandValue } from '../engine/landEstimator';
import { colors, cardStyle, headingStyle, subStyle } from '../theme';
import { Input, Select } from '../components/components';

// ─── ALLOWED PROPERTY TYPES (residential only for now) ──────────────────────
const ALLOWED_TYPES = [
  { key: "single_family", label: "Single Family Rental", sub: "Houses, duplexes, vacation rentals" },
  { key: "condo", label: "Condo / Townhome", sub: "Condos, townhouses, co-ops" },
];

// ─── COMBINED STEP: Address → Type → Price + Land ───────────────────────────
export function StepProperty({ formData, update, errors = {} }) {
  const [landEstimate, setLandEstimate] = useState(null);
  // Track the last value WE auto-set, so we know if user changed it
  const [lastAutoValue, setLastAutoValue] = useState(null);

  const price = parseFloat((formData.purchasePrice || "").replace(/[$,\s]/g, "")) || 0;
  const hasPrice = price > 0;
  const isCondo = formData.propertyType === "condo";
  const CONDO_LAND_PCT = 5;
  const condoLandValue = Math.round(price * CONDO_LAND_PCT / 100);

  // Auto-estimate land value when price + location are available
  useEffect(() => {
    if (price > 0) {
      if (isCondo) {
        // Condos: small fixed percentage for shared land
        const condoLand = Math.round(price * CONDO_LAND_PCT / 100);
        const currentLand = formData.landValue;
        const isUntouched = !currentLand || currentLand === "" || currentLand === "0"
          || currentLand === String(lastAutoValue);
        if (isUntouched) {
          update("landValue", String(condoLand));
          setLastAutoValue(condoLand);
        }
        setLandEstimate({ landValue: condoLand, landSharePct: CONDO_LAND_PCT, source: "Condo standard (shared land)" });
      } else if (formData.state || formData.zip) {
        const est = estimateLandValue(price, formData.state, formData.zip);
        setLandEstimate(est);
        if (est) {
          const currentLand = formData.landValue;
          const isUntouched = !currentLand || currentLand === "" || currentLand === "0"
            || currentLand === String(lastAutoValue);
          if (isUntouched) {
            update("landValue", String(est.landValue));
            setLastAutoValue(est.landValue);
          }
        }
      }
    } else {
      setLandEstimate(null);
    }
  }, [formData.purchasePrice, formData.state, formData.zip, formData.propertyType]);

  const userOverrodeLand = landEstimate && formData.landValue
    && formData.landValue !== "" && formData.landValue !== "0"
    && formData.landValue !== String(lastAutoValue)
    && formData.landValue !== String(landEstimate.landValue);

  const handleLandChange = (v) => {
    update("landValue", v);
  };

  const applyEstimate = () => {
    if (landEstimate) {
      update("landValue", String(landEstimate.landValue));
      setLastAutoValue(landEstimate.landValue);
    }
  };

  const sectionLabel = (text) => (
    <div style={{ fontSize: 12, fontWeight: 700, color: colors.textDim, textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 28, marginBottom: 12, paddingBottom: 8, borderBottom: `1px solid ${colors.cardBorder}` }}>
      {text}
    </div>
  );

  return (
    <div>
      <h2 style={headingStyle}>Your Property</h2>
      <p style={subStyle}>Tell us about your property and we'll estimate your cost segregation benefit.</p>

      {/* ── Address ── */}
      {sectionLabel("Property Address")}
      <div style={{ display: "grid", gap: 12 }}>
        <Input label="Street Address" value={formData.address} onChange={v => update("address", v)} placeholder="123 Main St" error={errors.address} />
        <div className="csp-form-grid-3" style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 12 }}>
          <Input label="City" value={formData.city} onChange={v => update("city", v)} placeholder="San Diego" />
          <Input label="State" value={formData.state} onChange={v => update("state", v)} placeholder="CA" />
          <Input label="ZIP" value={formData.zip} onChange={v => update("zip", v)} placeholder="92024" />
        </div>
      </div>

      {/* ── Property Type ── */}
      {sectionLabel("Property Type")}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {ALLOWED_TYPES.map(({ key, label, sub }) => {
          const sel = formData.propertyType === key;
          return (
            <div key={key} onClick={() => update("propertyType", key)} style={{
              padding: "16px 18px", borderRadius: 12, cursor: "pointer",
              border: `1.5px solid ${sel ? colors.accent : colors.inputBorder}`,
              background: sel ? colors.accentGlow : colors.card,
              transition: "all 0.15s",
            }}>
              <div style={{ fontWeight: 600, fontSize: 14, color: sel ? colors.accent : colors.text }}>{label}</div>
              <div style={{ fontSize: 12, color: colors.textMuted, marginTop: 3 }}>{sub}</div>
            </div>
          );
        })}
      </div>

      {/* ── Purchase & Land Value ── */}
      {sectionLabel("Purchase Details")}
      <div style={{ display: "grid", gap: 14 }}>

        {/* 1031 Exchange Toggle */}
        <label style={{
          display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
          padding: '10px 14px', borderRadius: 10,
          background: formData.is1031Exchange ? colors.accentLight : `${colors.cardBorder}33`,
          border: `1.5px solid ${formData.is1031Exchange ? colors.accent + '44' : colors.cardBorder}`,
          transition: 'all 0.15s',
        }}>
          <input
            type="checkbox"
            checked={formData.is1031Exchange || false}
            onChange={e => update("is1031Exchange", e.target.checked)}
            style={{ width: 16, height: 16, accentColor: colors.accent, cursor: 'pointer' }}
          />
          <span style={{ fontSize: 13, fontWeight: 600, color: colors.text }}>This purchase was part of a 1031 exchange</span>
        </label>
        {formData.is1031Exchange && (
          <div style={{
            padding: '10px 14px', borderRadius: 10, fontSize: 12, color: colors.textDim, lineHeight: 1.6,
            background: `${colors.gold}08`, border: `1px solid ${colors.gold}22`,
          }}>
            Enter your <strong style={{ color: colors.text }}>new depreciable basis</strong> as the purchase price below and set land value to zero (or your allocated land value from closing docs).
          </div>
        )}

        <div className="csp-form-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Input label={formData.is1031Exchange ? "New Depreciable Basis" : "Purchase Price"} value={formData.purchasePrice} onChange={v => update("purchasePrice", v)} placeholder={formData.is1031Exchange ? "$425,000" : "$590,000"} currency error={errors.purchasePrice} />
          <Input label="Year Purchased" value={formData.yearPurchased} onChange={v => update("yearPurchased", v)} placeholder="2025" numeric error={errors.yearPurchased} />
        </div>

        {/* Land Value — condos get simplified treatment */}
        {isCondo ? (
          hasPrice ? (
            <div style={{
              padding: "14px 18px", borderRadius: 12,
              background: colors.accentGlow, border: `1px solid ${colors.accent}22`,
            }}>
              <div style={{ fontSize: 12, color: colors.textDim, lineHeight: 1.6 }}>
                <strong>Land value for condos:</strong> Condo owners have a proportional share of the building's land, but it's typically very small (3–5%). We've estimated <strong>${condoLandValue.toLocaleString()}</strong> ({CONDO_LAND_PCT}% of price). You can adjust this if your tax assessment shows a different split.
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10 }}>
                <input
                  type="text" inputMode="decimal" name="land-value-estimate" autoComplete="off"
                  value={formData.landValue ? '$' + String(formData.landValue).replace(/[^0-9]/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''}
                  onChange={(e) => handleLandChange(e.target.value.replace(/[$,\s]/g, ""))}
                  placeholder={`$${condoLandValue.toLocaleString()}`}
                  style={{
                    width: 160, padding: "8px 12px", borderRadius: 8, fontSize: 14, fontWeight: 600,
                    border: `1.5px solid ${colors.inputBorder}`, background: colors.inputBg || colors.bg,
                    color: colors.text, fontFamily: "inherit", outline: "none",
                  }}
                />
                <span style={{ fontSize: 11, color: colors.textMuted }}>or leave as estimated</span>
              </div>
            </div>
          ) : null
        ) : (
          /* SFR land value card — full estimator */
          !hasPrice ? (
            <div style={{
              padding: "16px 18px", borderRadius: 12, textAlign: "center",
              border: `1px dashed ${colors.inputBorder}`, color: colors.textMuted, fontSize: 13,
            }}>
              Enter your purchase price to get a land value estimate
            </div>
          ) : (
          <div style={{
            padding: "18px 20px", borderRadius: 14,
            background: landEstimate ? `${colors.blue || "#3B82F6"}08` : colors.card,
            border: `1.5px solid ${landEstimate ? (colors.blue || "#3B82F6") + "33" : colors.inputBorder}`,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: colors.textDim }}>Land Value</div>
                {landEstimate && !userOverrodeLand && (
                  <div style={{ fontSize: 11, color: colors.blue || "#3B82F6", marginTop: 2 }}>
                    Auto-estimated from {landEstimate.source}
                  </div>
                )}
              </div>
              {landEstimate && (
                <div style={{
                  padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600,
                  background: `${colors.blue || "#3B82F6"}15`, color: colors.blue || "#3B82F6",
                }}>
                  {landEstimate.landSharePct}% of price
                </div>
              )}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ flex: 1 }}>
                <input
                  type="text" inputMode="decimal"
                  name="land-value-estimate"
                  autoComplete="off"
                  value={formData.landValue ? '$' + String(formData.landValue).replace(/[^0-9]/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''}
                  onChange={(e) => handleLandChange(e.target.value.replace(/[$,\s]/g, ""))}
                  placeholder={landEstimate ? `$${landEstimate.landValue.toLocaleString()}` : "$100,000"}
                  style={{
                    width: "100%", padding: "12px 14px", borderRadius: 10, fontSize: 18, fontWeight: 700,
                    border: `1.5px solid ${errors.landValue ? (colors.red || "#EF4444") : colors.inputBorder}`,
                    background: colors.inputBg || colors.bg, color: colors.text,
                    fontFamily: "inherit", outline: "none",
                  }}
                />
                {errors.landValue && (
                  <div style={{ fontSize: 11, color: colors.red || "#EF4444", marginTop: 4 }}>{errors.landValue}</div>
                )}
              </div>
              {landEstimate && userOverrodeLand && formData.landValue !== String(landEstimate.landValue) && (
                <button onClick={applyEstimate} style={{
                  padding: "10px 16px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                  background: `${colors.blue || "#3B82F6"}15`, border: `1px solid ${colors.blue || "#3B82F6"}44`,
                  color: colors.blue || "#3B82F6", cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap",
                }}>
                  Use estimate
                </button>
              )}
            </div>

            <div style={{ fontSize: 11, color: colors.textMuted, marginTop: 8, lineHeight: 1.5 }}>
              {landEstimate
                ? "Based on FHFA residential land data. For the most accurate value, check your county tax assessor's land/improvement split on your property tax bill."
                : "Enter your state or ZIP above for an automatic estimate, or enter the value from your county tax assessor."
              }
            </div>
          </div>
          )
        )}
      </div>

      {/* ── Live Quick Estimate ── */}
      <QuickEstimate formData={formData} />
    </div>
  );
}

// ─── QUICK ESTIMATE (live preview on Step 0) ────────────────────────────────
function QuickEstimate({ formData }) {
  const price = parseFloat((formData.purchasePrice || "").replace(/[$,\s]/g, "")) || 0;
  const land = parseFloat((formData.landValue || "").replace(/[$,\s]/g, "")) || 0;
  const yearPurchased = parseInt(formData.yearPurchased) || new Date().getFullYear();
  const yearBuilt = parseInt(formData.yearBuilt) || 2000;
  const taxRate = 37; // assume default for quick estimate

  if (price <= 0 || land <= 0 || land >= price) return null;

  const basis = price - land;
  if (basis < 30000) return null;

  // Quick allocation using base profile + age multiplier only
  const profile = ALLOCATION_PROFILES[formData.propertyType] || ALLOCATION_PROFILES["single_family"];
  const age = new Date().getFullYear() - yearBuilt;
  const ageMult = age <= 5 ? 0.88 : age <= 10 ? 0.94 : age <= 20 ? 1.0 : age <= 30 ? 1.06 : age <= 40 ? 1.12 : 1.18;
  
  const pp5Pct = Math.min(profile.pp5 * ageMult, 0.45);
  const li15Pct = Math.min(profile.li15 * ageMult, 0.30);
  const segregated = Math.round(basis * (pp5Pct + li15Pct));
  const buildingTotal = basis - segregated;

  // Bonus depreciation
  // OBBBA: 100% bonus permanent for property acquired after Jan 19, 2025
  const bonusRates = { 2022: 1.0, 2023: 0.8, 2024: 0.6, 2025: 1.0 };
  const bonusRate = bonusRates[yearPurchased] ?? (yearPurchased >= 2025 ? 1.0 : yearPurchased <= 2021 ? 1.0 : 0);
  const bonusAmount = Math.round(segregated * bonusRate);
  const buildingLife = 27.5;

  // Year 1 depreciation with cost seg
  const csYear1 = bonusAmount + Math.round(buildingTotal / buildingLife * 0.5);
  // Year 1 without cost seg
  const nocsYear1 = Math.round(basis / buildingLife * 0.5);
  const benefit = csYear1 - nocsYear1;
  const taxSavings = Math.round(benefit * (taxRate / 100));

  if (segregated <= 0) return null;

  return (
    <div style={{
      marginTop: 28, padding: "24px 22px", borderRadius: 16,
      background: colors.accentGlow, border: `1.5px solid ${colors.accent}22`,
    }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: colors.accent, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
        Estimated Accelerated Depreciation
      </div>
      <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 38, color: colors.accent, letterSpacing: "-0.02em", lineHeight: 1.1 }}>
        ~${segregated.toLocaleString()}
      </div>
      <div style={{ fontSize: 12, color: colors.textMuted, marginTop: 6 }}>
        {Math.round((pp5Pct + li15Pct) * 100)}% of ${(basis / 1000).toFixed(0)}K depreciable basis · {Math.round(bonusRate * 100)}% bonus depreciation
      </div>
      <div style={{ fontSize: 12, color: colors.textDim, marginTop: 14, lineHeight: 1.6 }}>
        Continue to generate a full component-level report with IRS-accepted MACRS classifications and depreciation schedules.
      </div>
    </div>
  );
}

// Backward-compatible exports (App.jsx may still reference these)
export const StepPropertyType = StepProperty;
export const StepPropertyDetails = StepProperty;

export function StepBuildingInfo({ formData, update, errors = {} }) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const isResidential = ["single_family", "condo", "multifamily", "apartment"].includes(formData.propertyType);

  return (
    <div>
      <h2 style={headingStyle}>Building Characteristics</h2>
      <p style={subStyle}>These details help us estimate your component allocations more accurately.</p>
      <div style={{ display: "grid", gap: 16, marginTop: 24 }}>
        <div className="csp-form-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Input label="Square Footage" value={formData.sqft} onChange={v => update("sqft", v)} placeholder="1500" numeric error={errors.sqft} />
          <Input label="Year Built" value={formData.yearBuilt} onChange={v => update("yearBuilt", v)} placeholder="1990" numeric error={errors.yearBuilt} />
        </div>
        <div className="csp-form-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Select label="Number of Stories" value={formData.stories} onChange={v => update("stories", v)} options={[
            { value: "1", label: "1 Story" }, { value: "2", label: "2 Stories" }, { value: "3", label: "3+ Stories" },
          ]} />
          <Select label="Building Grade / Quality" value={formData.buildingGrade} onChange={v => update("buildingGrade", v)} options={[
            { value: "economy", label: "Economy / Builder Grade" },
            { value: "standard", label: "Standard" },
            { value: "custom", label: "Custom / Above Average" },
            { value: "luxury", label: "Luxury / High-End" },
          ]} />
        </div>
        <div className="csp-form-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Input label="Bedrooms" value={formData.bedrooms} onChange={v => update("bedrooms", v)} numeric />
          <Input label="Bathrooms" value={formData.bathrooms} onChange={v => update("bathrooms", v)} numeric />
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

        <Input label="Your Marginal Tax Rate (%)" value={formData.taxRate} onChange={v => update("taxRate", v)} placeholder="37" numeric helper="Federal + state combined rate" error={errors.taxRate} />

        {/* ─── Renovation Section ─── */}
        <RenovationSection formData={formData} update={update} />

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

            {/* ─── Extra Accuracy Fields ─── */}
            <ExtraAccuracySection formData={formData} update={update} />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── EXTRA ACCURACY SECTION (nested inside Advanced Details) ─────────────────
function ExtraAccuracySection({ formData, update }) {
  const [open, setOpen] = useState(false);

  const cabinetryLabels = {
    standard: "Stock / Builder Grade",
    semi_custom: "Semi-Custom",
    custom_wood: "Custom Built Wood Cabinets",
  };
  const countertopLabels = {
    standard: "Laminate / Formica",
    granite: "Granite",
    quartz: "Quartz",
    marble: "Marble / Stone",
    butcher_block: "Butcher Block",
    tile: "Tile",
  };

  return (
    <div>
      <div
        onClick={() => setOpen(!open)}
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "12px 16px", borderRadius: 10, cursor: "pointer",
          background: open ? `${colors.accent}12` : colors.card,
          border: `1.5px solid ${open ? colors.accent + "44" : colors.inputBorder}`,
          transition: "all 0.2s",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 24, height: 24, borderRadius: 6,
            background: open ? `${colors.accent}25` : `${colors.accent}10`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, color: colors.accent,
          }}>&#10024;</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13, color: open ? colors.accent : colors.text }}>
              Want more accuracy? Add details
            </div>
            <div style={{ fontSize: 11, color: colors.textMuted, marginTop: 1 }}>
              Kitchen cabinets, countertops, window coverings
            </div>
          </div>
        </div>
        <div style={{
          fontSize: 16, color: open ? colors.accent : colors.textMuted,
          transition: "transform 0.2s",
          transform: open ? "rotate(180deg)" : "rotate(0deg)",
        }}>&#9662;</div>
      </div>

      {open && (
        <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
          <Select
            label="Kitchen Cabinetry Grade"
            value={formData.kitchenCabinetryGrade}
            onChange={v => update("kitchenCabinetryGrade", v)}
            options={Object.entries(cabinetryLabels).map(([value, label]) => ({ value, label }))}
          />
          <Select
            label="Countertop Material"
            value={formData.countertopMaterial}
            onChange={v => update("countertopMaterial", v)}
            options={Object.entries(countertopLabels).map(([value, label]) => ({ value, label }))}
          />
          <Toggle
            label="Has window coverings (blinds, shutters, drapes)"
            sub="Window coverings qualify as 5-year personal property"
            checked={formData.hasWindowCoverings}
            onChange={() => update("hasWindowCoverings", !formData.hasWindowCoverings)}
          />
          {formData.hasWindowCoverings && (
            <div style={{ marginLeft: 34 }}>
              <Input
                label="Approximate Number of Windows with Coverings"
                value={formData.windowCoveringsCount}
                onChange={v => update("windowCoveringsCount", v)}
                placeholder="e.g. 12"
                numeric
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── RENOVATION SECTION (inline in Building Info step) ──────────────────────
function RenovationSection({ formData, update }) {
  const hasReno = formData.hasRenovation;
  const mode = formData.renoMode || "total";

  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: colors.textDim, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.06em" }}>
        Renovations
      </div>

      <Toggle
        label="Did you do renovations on this property?"
        sub="Kitchen remodel, new flooring, updated bathrooms, etc."
        checked={hasReno}
        onChange={() => update("hasRenovation", !hasReno)}
      />

      {hasReno && (
        <div style={{
          marginTop: 14, padding: 18, borderRadius: 12,
          background: `${colors.accent}08`, border: `1px solid ${colors.accent}22`,
        }}>
          <div style={{ fontSize: 12, color: colors.accent, fontWeight: 600, marginBottom: 10 }}>
            How would you like to enter your renovation costs?
          </div>

          {/* Mode selector */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
            {[
              { key: "total", label: "Enter Total", sub: "Quick — we estimate the breakdown" },
              { key: "detailed", label: "Upload / Enter Budget", sub: "More accurate — you classify items" },
            ].map(opt => {
              const sel = mode === opt.key;
              return (
                <div
                  key={opt.key}
                  onClick={() => update("renoMode", opt.key)}
                  style={{
                    padding: "12px 14px", borderRadius: 10, cursor: "pointer",
                    border: `1.5px solid ${sel ? colors.accent : colors.inputBorder}`,
                    background: sel ? colors.accentGlow : colors.card,
                    transition: "all 0.15s",
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: 13, color: sel ? colors.accent : colors.text }}>{opt.label}</div>
                  <div style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>{opt.sub}</div>
                </div>
              );
            })}
          </div>

          {mode === "total" ? (
            <div>
              <Input
                label="Total Renovation Cost"
                value={formData.renoTotalAmount}
                onChange={v => update("renoTotalAmount", v)}
                placeholder="$75,000"
                currency
                helper="We'll estimate how much qualifies for accelerated depreciation based on typical renovation breakdowns"
              />
            </div>
          ) : (
            <RenoBudgetDetail formData={formData} update={update} />
          )}

          {/* Indirect cost selector */}
          <div style={{ marginTop: 14 }}>
            <Select
              label="How was the renovation managed?"
              value={formData.renoIndirectType || "gc"}
              onChange={v => update("renoIndirectType", v)}
              options={INDIRECT_COST_OPTIONS.map(o => ({ value: o.value, label: o.label }))}
            />
            {formData.renoIndirectType === "custom" && (
              <div style={{ marginTop: 8 }}>
                <Input label="Custom Indirect Rate (%)" value={formData.renoIndirectCustomRate || ""} onChange={v => update("renoIndirectCustomRate", v)} placeholder="15" numeric />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── DETAILED BUDGET ENTRY ──────────────────────────────────────────────────
function RenoBudgetDetail({ formData, update }) {
  const items = formData.renovationItems || [];
  const [activeTab, setActiveTab] = useState("pp5");
  const [dragOver, setDragOver] = useState(false);

  const addItem = (categoryId, label) => {
    if (items.find(i => i.categoryId === categoryId)) return;
    update("renovationItems", [...items, { categoryId, label, amount: "" }]);
  };

  const updateItem = (categoryId, amount) => {
    update("renovationItems", items.map(i => i.categoryId === categoryId ? { ...i, amount } : i));
  };

  const removeItem = (categoryId) => {
    update("renovationItems", items.filter(i => i.categoryId !== categoryId));
  };

  const getSectionTotal = (section) => {
    const ids = new Set(section.map(c => c.id));
    return items.filter(i => ids.has(i.categoryId)).reduce((s, i) => s + (parseFloat(i.amount) || 0), 0);
  };

  const grandTotal = items.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0);
  const pp5Total = getSectionTotal(RENO_CATEGORIES.pp5);
  const li15Total = getSectionTotal(RENO_CATEGORIES.li15);
  const rpTotal = getSectionTotal(RENO_CATEGORIES.rp);

  // File upload handler
  const handleFileUpload = async (file) => {
    if (!file) return;
    const ext = file.name.split('.').pop().toLowerCase();

    if (ext === 'csv') {
      const text = await file.text();
      const parsed = parseCSV(text);
      if (parsed.length > 0) {
        update("renovationItems", [...items, ...parsed]);
      }
    } else if (ext === 'xlsx' || ext === 'xls') {
      // SheetJS import for Excel
      try {
        const XLSX = await import('https://cdn.sheetjs.com/xlsx-0.20.1/package/xlsx.mjs');
        const data = await file.arrayBuffer();
        const wb = XLSX.read(data);
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });
        const parsed = parseSpreadsheetRows(rows);
        if (parsed.length > 0) {
          update("renovationItems", [...items, ...parsed]);
        }
      } catch (e) {
        console.error("Excel parse error:", e);
        alert("Could not parse Excel file. Try saving as CSV instead.");
      }
    } else if (ext === 'pdf') {
      alert("PDF budget parsing coming soon! For now, please enter items manually or use CSV/Excel.");
    } else {
      alert("Supported formats: CSV, Excel (.xlsx/.xls), PDF (coming soon)");
    }
  };

  const sections = [
    { key: "pp5", label: "5-Year", color: colors.accent, cats: RENO_CATEGORIES.pp5, total: pp5Total },
    { key: "li15", label: "15-Year", color: colors.blue || "#3B82F6", cats: RENO_CATEGORIES.li15, total: li15Total },
    { key: "rp", label: "Building", color: colors.textMuted, cats: RENO_CATEGORIES.rp, total: rpTotal },
  ];

  const activeSec = sections.find(s => s.key === activeTab);

  return (
    <div>
      {/* Upload zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFileUpload(e.dataTransfer.files[0]); }}
        onClick={() => { const input = document.createElement('input'); input.type = 'file'; input.accept = '.csv,.xlsx,.xls,.pdf'; input.onchange = (e) => handleFileUpload(e.target.files[0]); input.click(); }}
        style={{
          padding: "16px", borderRadius: 10, textAlign: "center", cursor: "pointer",
          border: `2px dashed ${dragOver ? colors.accent : colors.inputBorder}`,
          background: dragOver ? `${colors.accent}10` : "transparent",
          transition: "all 0.2s", marginBottom: 14,
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 600, color: dragOver ? colors.accent : colors.textDim }}>
          Drop a file or click to upload
        </div>
        <div style={{ fontSize: 11, color: colors.textMuted, marginTop: 3 }}>
          CSV, Excel (.xlsx), or PDF — we'll classify items automatically
        </div>
      </div>

      <div style={{ fontSize: 11, color: colors.textMuted, textAlign: "center", marginBottom: 14 }}>
        — or add items manually below —
      </div>

      {/* Grand total */}
      {grandTotal > 0 && (
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "10px 14px", borderRadius: 8, marginBottom: 10,
          background: `${colors.accent}10`, border: `1px solid ${colors.accent}22`,
        }}>
          <span style={{ fontSize: 12, color: colors.textDim }}>Budget Total</span>
          <span style={{ fontSize: 16, fontWeight: 700, color: colors.accent }}>
            ${grandTotal.toLocaleString()}
          </span>
        </div>
      )}

      {/* Allocation bar */}
      {grandTotal > 0 && (
        <div style={{ display: "flex", height: 5, borderRadius: 3, overflow: "hidden", gap: 2, marginBottom: 12 }}>
          {pp5Total > 0 && <div style={{ width: `${(pp5Total / grandTotal) * 100}%`, background: colors.accent, borderRadius: 3 }} />}
          {li15Total > 0 && <div style={{ width: `${(li15Total / grandTotal) * 100}%`, background: colors.blue || "#3B82F6", borderRadius: 3 }} />}
          {rpTotal > 0 && <div style={{ width: `${(rpTotal / grandTotal) * 100}%`, background: colors.textMuted, borderRadius: 3, opacity: 0.4 }} />}
        </div>
      )}

      {/* Section tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 12 }}>
        {sections.map(s => {
          const active = activeTab === s.key;
          return (
            <button key={s.key} onClick={() => setActiveTab(s.key)} style={{
              flex: 1, padding: "8px 6px", borderRadius: 8, cursor: "pointer",
              border: `1px solid ${active ? s.color + "66" : colors.inputBorder}`,
              background: active ? s.color + "12" : "transparent",
              color: active ? s.color : colors.textMuted,
              fontWeight: active ? 700 : 500, fontSize: 11,
              fontFamily: "inherit", transition: "all 0.15s", textAlign: "center",
            }}>
              {s.label}
              {s.total > 0 && <div style={{ fontSize: 10, opacity: 0.8 }}>${s.total.toLocaleString()}</div>}
            </button>
          );
        })}
      </div>

      {/* Available categories */}
      {activeSec && (() => {
        const addedIds = new Set(items.map(i => i.categoryId));
        const available = activeSec.cats.filter(c => !addedIds.has(c.id));
        return available.length > 0 ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 10 }}>
            {available.map(cat => (
              <button key={cat.id} onClick={() => addItem(cat.id, cat.label)} title={cat.help} style={{
                padding: "5px 10px", borderRadius: 6, cursor: "pointer",
                border: `1px dashed ${activeSec.color}44`,
                background: "transparent", color: activeSec.color,
                fontSize: 11, fontWeight: 500, fontFamily: "inherit",
              }}>
                + {cat.label}
              </button>
            ))}
          </div>
        ) : null;
      })()}

      {/* Added items */}
      {activeSec && (
        <div style={{ display: "grid", gap: 6 }}>
          {items.filter(i => activeSec.cats.some(c => c.id === i.categoryId)).map(item => (
            <div key={item.categoryId} style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "8px 10px", borderRadius: 8,
              background: colors.card, border: `1px solid ${colors.cardBorder}`,
            }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: activeSec.color, flexShrink: 0 }} />
              <div style={{ flex: 1, fontSize: 12, fontWeight: 600, color: colors.text, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {item.label}
              </div>
              <input
                type="text" inputMode="decimal" placeholder="$0"
                value={item.amount}
                onChange={(e) => updateItem(item.categoryId, e.target.value.replace(/[$,\s]/g, ""))}
                style={{
                  width: 110, padding: "6px 8px", borderRadius: 6, flexShrink: 0,
                  border: `1px solid ${colors.inputBorder}`, background: colors.bg,
                  color: colors.text, fontSize: 13, fontWeight: 600,
                  fontFamily: "inherit", textAlign: "right", outline: "none",
                }}
              />
              <button onClick={() => removeItem(item.categoryId)} style={{
                width: 24, height: 24, borderRadius: 4, flexShrink: 0,
                border: `1px solid ${colors.inputBorder}`, background: "transparent",
                color: colors.textMuted, cursor: "pointer", fontSize: 13, fontFamily: "inherit",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>×</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── CSV PARSER ─────────────────────────────────────────────────────────────
function parseCSV(text) {
  const lines = text.trim().split('\n').map(l => l.split(',').map(c => c.trim().replace(/^["']|["']$/g, '')));
  if (lines.length < 2) return [];

  // Try to find description and amount columns
  const header = lines[0].map(h => h.toLowerCase());
  const descIdx = header.findIndex(h => /desc|item|category|name|work/i.test(h));
  const amtIdx = header.findIndex(h => /amount|cost|total|price|value/i.test(h));

  if (descIdx === -1 || amtIdx === -1) {
    // Fallback: assume col 0 = description, col 1 = amount
    return lines.slice(1).map(row => ({
      categoryId: classifyDescription(row[0] || ""),
      label: row[0] || "Unknown",
      amount: parseFloat((row[1] || "").replace(/[$,]/g, "")) || "",
    })).filter(i => i.categoryId && i.amount);
  }

  return lines.slice(1).map(row => ({
    categoryId: classifyDescription(row[descIdx] || ""),
    label: row[descIdx] || "Unknown",
    amount: parseFloat((row[amtIdx] || "").replace(/[$,]/g, "")) || "",
  })).filter(i => i.categoryId && i.amount);
}

function parseSpreadsheetRows(rows) {
  if (rows.length < 2) return [];
  const header = (rows[0] || []).map(h => String(h).toLowerCase());
  const descIdx = header.findIndex(h => /desc|item|category|name|work/i.test(h));
  const amtIdx = header.findIndex(h => /amount|cost|total|price|value/i.test(h));

  const di = descIdx >= 0 ? descIdx : 0;
  const ai = amtIdx >= 0 ? amtIdx : 1;

  return rows.slice(1).map(row => ({
    categoryId: classifyDescription(String(row[di] || "")),
    label: String(row[di] || "Unknown"),
    amount: parseFloat(String(row[ai] || "").replace(/[$,]/g, "")) || "",
  })).filter(i => i.categoryId && i.amount);
}

// ─── AUTO-CLASSIFIER ────────────────────────────────────────────────────────
// Maps a budget description to the best renovation category ID
function classifyDescription(desc) {
  const d = desc.toLowerCase();
  // 5-year
  if (/applia|fridge|refriger|oven|range|dishwash|microwave|washer|dryer|disposal/i.test(d)) return "appliances";
  if (/cabinet|vanity(?!.*count)/i.test(d)) return "cabinetry";
  if (/counter|granite|quartz|marble|laminate.*top/i.test(d)) return "countertops";
  if (/floor|carpet|lvt|vinyl.*plank|hardwood|tile.*floor|laminate(?!.*top)/i.test(d)) return "flooring";
  if (/light|fixture|fan|ceiling.*fan|sconce|pendant|chandel/i.test(d)) return "lighting";
  if (/blind|shade|curtain|drape|window.*treat/i.test(d)) return "window_treat";
  if (/mirror/i.test(d)) return "mirrors";
  if (/furni|desk|chair|table|tv|sofa|bed|couch/i.test(d)) return "ffe";
  if (/secur|camera|alarm|cctv/i.test(d)) return "security";
  // 15-year
  if (/landscap|sod|tree|shrub|mulch|irriga/i.test(d)) return "landscaping";
  if (/pav|asphalt|sidewalk|driveway|parking|curb|concrete.*walk/i.test(d)) return "paving";
  if (/fence|fencing|gate/i.test(d)) return "fencing";
  if (/sign/i.test(d)) return "signage";
  if (/pool|deck|patio|outdoor.*kit|pergola|gazebo/i.test(d)) return "pool_outdoor";
  // 27.5-year
  if (/paint|stain/i.test(d)) return "painting";
  if (/hvac|furnace|air.*cond|duct|thermostat|heat.*pump/i.test(d)) return "hvac";
  if (/plumb|pipe|water.*heat|toilet|tub|shower|drain|faucet/i.test(d)) return "plumbing";
  if (/electr|panel|wiring|outlet|circuit/i.test(d)) return "electrical";
  if (/roof|shingle|flash|gutter/i.test(d)) return "roofing";
  if (/frame|framing|drywall|door|window|stair|siding|stucco|exterior/i.test(d)) return "general";
  // Fallback
  return "general";
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
    formData.is1031Exchange && ["1031 Exchange", "Yes"],
    [formData.is1031Exchange ? "New Depreciable Basis" : "Purchase Price", formData.purchasePrice ? "$" + parseFloat(formData.purchasePrice).toLocaleString("en-US") : "\u2014"],
    ["Land Value", formData.landValue ? "$" + parseFloat(formData.landValue).toLocaleString("en-US") : "\u2014"],
    ["Year Built", formData.yearBuilt || "\u2014"],
    ["Year Purchased", formData.yearPurchased || "\u2014"],
    ["Square Footage", formData.sqft ? `${parseInt(formData.sqft).toLocaleString()} SF` : "\u2014"],
    ["Building Grade", formData.buildingGrade?.charAt(0).toUpperCase() + formData.buildingGrade?.slice(1)],
    ["Property Features", features],
    ["Primary Flooring", flooringLabels[formData.flooringType] || "Not specified"],
    formData.kitchenCabinetryGrade && formData.kitchenCabinetryGrade !== "standard" && ["Kitchen Cabinetry", { standard: "Stock / Builder Grade", semi_custom: "Semi-Custom", custom_wood: "Custom Built Wood Cabinets" }[formData.kitchenCabinetryGrade]],
    formData.countertopMaterial && formData.countertopMaterial !== "standard" && ["Countertop Material", { standard: "Laminate / Formica", granite: "Granite", quartz: "Quartz", marble: "Marble / Stone", butcher_block: "Butcher Block", tile: "Tile" }[formData.countertopMaterial]],
    formData.hasWindowCoverings && ["Window Coverings", formData.windowCoveringsCount ? `Yes (${formData.windowCoveringsCount} windows)` : "Yes"],
    ["Tax Rate", formData.taxRate + "%"],
  ].filter(Boolean);

  // Add renovation info to review if present
  if (formData.hasRenovation) {
    const renoItems = formData.renovationItems || [];
    if (formData.renoMode === "detailed" && renoItems.length > 0) {
      const renoTotal = renoItems.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0);
      items.push(["Renovation (Detailed)", `$${renoTotal.toLocaleString()} across ${renoItems.filter(i => parseFloat(i.amount) > 0).length} categories`]);
    } else if (formData.renoTotalAmount) {
      items.push(["Renovation (Total)", "$" + parseFloat(formData.renoTotalAmount).toLocaleString()]);
    }
    const indirectLabels = { gc: "General Contractor", self_sub: "Self-managed", diy: "DIY", custom: "Custom" };
    items.push(["Reno Management", indirectLabels[formData.renoIndirectType] || "General Contractor"]);
  }
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
