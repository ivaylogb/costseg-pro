// ─── LAND VALUE ESTIMATOR ───────────────────────────────────────────────────
// Estimates land value as a percentage of purchase price based on location.
// Data derived from FHFA Working Paper 19-01 (Davis, Larson, Oliner, Shui):
//   "The Price of Residential Land for Counties, ZIP Codes, and Census Tracts"
//   Using millions of GSE appraisals from 2012-2022.
//
// Land share = what % of total property value is attributable to land alone.
// Varies enormously: 7% rural Midwest → 55%+ coastal California/NYC.
//
// Method: state-level median land shares, with metro adjustments for
// high-cost and low-cost areas. User can always override.

// State-level median residential land shares (%)
// Source: FHFA pooled cross-section 2012-2022, rounded to nearest %
const STATE_LAND_SHARE = {
  AL: 15, AK: 20, AZ: 22, AR: 13, CA: 40,
  CO: 28, CT: 35, DE: 25, FL: 25, GA: 18,
  HI: 52, ID: 22, IL: 20, IN: 14, IA: 12,
  KS: 14, KY: 14, LA: 15, ME: 25, MD: 30,
  MA: 38, MI: 16, MN: 18, MS: 12, MO: 16,
  MT: 22, NE: 14, NV: 28, NH: 30, NJ: 38,
  NM: 18, NY: 35, NC: 18, ND: 12, OH: 16,
  OK: 14, OR: 30, PA: 22, RI: 35, SC: 18,
  SD: 14, TN: 18, TX: 18, UT: 25, VT: 28,
  VA: 25, WA: 32, WV: 12, WI: 18, WY: 16,
  DC: 45,
};

// Metro-level adjustments: ZIP prefix → land share override
// These capture extreme markets where state average is misleading
// ZIP prefixes (first 3 digits) for high-land-value metros
const ZIP_PREFIX_OVERRIDES = {
  // San Francisco Bay Area (940-949)
  "940": 50, "941": 52, "942": 45, "943": 45, "944": 50, "945": 45,
  "946": 45, "947": 48, "948": 42, "949": 42,
  // Los Angeles (900-908, 910-918, 935)
  "900": 42, "901": 42, "902": 38, "903": 35, "904": 35,
  "905": 35, "906": 38, "907": 38, "908": 35,
  "910": 35, "911": 38, "912": 35, "913": 35, "914": 35,
  "935": 30,
  // San Diego (919-921)
  "919": 35, "920": 35, "921": 32,
  // NYC metro (100-104, 070-079, 105-109)
  "100": 48, "101": 48, "102": 45, "103": 42, "104": 42,
  "105": 38, "106": 38, "107": 38, "108": 35, "109": 35,
  "070": 38, "071": 35, "072": 35, "073": 32, "074": 32,
  "075": 32, "076": 30, "077": 30, "078": 32, "079": 30,
  // Boston (010-024)
  "011": 38, "012": 28, "013": 25, "014": 28, "015": 25,
  "016": 25, "017": 32, "018": 35, "019": 35, "020": 40,
  "021": 42, "022": 38, "023": 35, "024": 35,
  // Washington DC metro (200-205, 220-223)
  "200": 45, "201": 42, "202": 45, "203": 38, "204": 35, "205": 35,
  "220": 32, "221": 32, "222": 32, "223": 30,
  // Seattle (980-984)
  "980": 38, "981": 38, "982": 30, "983": 32, "984": 28,
  // Miami/South FL (330-334)
  "330": 32, "331": 30, "332": 28, "333": 35, "334": 28,
  // Denver (800-803)
  "800": 30, "801": 32, "802": 30, "803": 28,
  // Portland (970-972)
  "970": 32, "971": 35, "972": 30,
  // Austin (786-787)
  "786": 25, "787": 25,
  // Nashville (370-372)
  "370": 22, "371": 22, "372": 20,
  // Cheap land — rural/Midwest
  "570": 10, "571": 10, // SD rural
  "580": 10, "581": 10, // ND rural
  "660": 10, "661": 10, // KS rural
  "687": 10, "688": 10, // NE rural
  "386": 10, "387": 10, // MS rural
  "716": 10, "717": 10, // AR rural
  "247": 10, "248": 10, // WV rural
};

// ─── MAIN ESTIMATOR ─────────────────────────────────────────────────────────
// Returns { landShare, landValue, source, confidence }
export function estimateLandValue(purchasePrice, state, zip) {
  const price = parseFloat(purchasePrice) || 0;
  if (price <= 0) return null;

  const stateCode = (state || "").toUpperCase().trim();
  const zipClean = (zip || "").trim();
  const zipPrefix = zipClean.substring(0, 3);

  let landShare = null;
  let source = "";
  let confidence = "low";

  // Try ZIP prefix first (most specific)
  if (zipPrefix && ZIP_PREFIX_OVERRIDES[zipPrefix] !== undefined) {
    landShare = ZIP_PREFIX_OVERRIDES[zipPrefix] / 100;
    source = "FHFA residential land data for your metro area";
    confidence = "moderate";
  }
  // Fall back to state
  else if (stateCode && STATE_LAND_SHARE[stateCode] !== undefined) {
    landShare = STATE_LAND_SHARE[stateCode] / 100;
    source = "FHFA residential land data for " + stateCode;
    confidence = "moderate";
  }
  // National fallback
  else {
    landShare = 0.20; // national median ~20%
    source = "National median residential land share";
    confidence = "low";
  }

  const landValue = Math.round(price * landShare);

  return {
    landShare,
    landSharePct: Math.round(landShare * 100),
    landValue,
    source,
    confidence,
  };
}

// ─── EXPORTS FOR STEP UI ────────────────────────────────────────────────────
export { STATE_LAND_SHARE, ZIP_PREFIX_OVERRIDES };
