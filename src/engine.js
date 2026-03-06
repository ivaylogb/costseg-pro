// ─── ALLOCATION PROFILES BY PROPERTY TYPE ─────────────────────────────────────
// Base profiles calibrated against completed engineering-based cost segregation studies.
// pp5 = 5-year personal property base %, pp5_furnished = furnished variant
// li15 = 15-year land improvement base %
export const ALLOCATION_PROFILES = {
  "single_family": { pp5: 0.15, pp5_furnished: 0.22, li15: 0.012, label: "Single Family Rental" },
  "condo":         { pp5: 0.13, pp5_furnished: 0.20, li15: 0.01, label: "Condo / Townhome" },
  "multifamily":   { pp5: 0.16, pp5_furnished: 0.24, li15: 0.04, label: "Multifamily (2-4 units)" },
  "apartment":     { pp5: 0.18, pp5_furnished: 0.26, li15: 0.06, label: "Apartment Complex (5+)" },
  "office":        { pp5: 0.15, pp5_furnished: 0.18, li15: 0.08, label: "Office Building" },
  "retail":        { pp5: 0.20, pp5_furnished: 0.23, li15: 0.10, label: "Retail / Strip Mall" },
  "restaurant":    { pp5: 0.35, pp5_furnished: 0.40, li15: 0.08, label: "Restaurant" },
  "industrial":    { pp5: 0.12, pp5_furnished: 0.14, li15: 0.12, label: "Industrial / Warehouse" },
  "hotel":         { pp5: 0.22, pp5_furnished: 0.30, li15: 0.06, label: "Hotel / Motel" },
  "mixed_use":     { pp5: 0.16, pp5_furnished: 0.22, li15: 0.06, label: "Mixed Use" },
};

// ─── ADJUSTMENT FACTORS ──────────────────────────────────────────────────────
function getAgeMultiplier(yearBuilt) {
  const age = new Date().getFullYear() - yearBuilt;
  if (age <= 5) return 0.88;
  if (age <= 10) return 0.94;
  if (age <= 20) return 1.00;
  if (age <= 30) return 1.06;
  if (age <= 40) return 1.12;
  if (age <= 50) return 1.18;
  return 1.22;
}

function getGradeMultiplier(grade) {
  const grades = { "economy": 0.85, "standard": 1.0, "custom": 1.12, "luxury": 1.25 };
  return grades[grade] || 1.0;
}

// ─── FLOORING ADJUSTMENT ────────────────────────────────────────────────────
// Real studies show removable flooring (LVT, laminate, carpet, floating hardwood)
// is 30-46% of the 5-year bucket. Tile/stone is structural (39-year).
// This adjusts the base 5-year rate based on flooring composition.
function getFlooringMultiplier(flooringType) {
  const multipliers = {
    "mostly_removable": 1.20,  // 75%+ LVT, laminate, floating hardwood, carpet
    "mixed":            1.08,  // Mix of removable and structural
    "mostly_tile":      0.92,  // 75%+ tile, stone, structural
    "default":          1.00,  // Not specified — use base rate
  };
  return multipliers[flooringType] || 1.0;
}

// ─── RENOVATION ADJUSTMENT ──────────────────────────────────────────────────
// Older buildings with recent renovations have near-new 5-year components
// (new cabinets, flooring, appliances) inside an old structural shell.
// This produces higher segregated percentages than age alone would suggest.
function getRenovationMultiplier(recentlyRenovated) {
  return recentlyRenovated ? 1.18 : 1.0;
}

// ─── FEATURE-BASED ADJUSTMENTS ──────────────────────────────────────────────
// Adds fixed-percentage boosts based on specific property features,
// calibrated against real engineering-based study line items.
function getFeatureAdjustments(data, depreciableBasis) {
  let pp5Boost = 0;
  let li15Boost = 0;

  // Hot tub / jacuzzi — real study: $7,300 base + indirect/premium → ~2% of basis
  if (data.hasHotTub) {
    pp5Boost += Math.round(depreciableBasis * 0.02);
  }

  // Fireplace inserts — real study: $5,499 for 2 units on $483K basis (~0.8% each after base)
  if (data.hasFireplace) {
    const numFireplaces = parseInt(data.numFireplaces) || 1;
    pp5Boost += Math.round(depreciableBasis * 0.008 * Math.min(numFireplaces, 4));
  }

  // Game room / theater — pool table, arcade, extra AV, specialty furniture (~2%)
  if (data.hasGameRoom) {
    pp5Boost += Math.round(depreciableBasis * 0.02);
  }

  // Pool — scaled by pool type. Real study: $131K pool on $957K basis (13.7%)
  // In-ground concrete ~10-14%, in-ground vinyl ~5-8%, above-ground ~1-2%
  if (data.hasPool) {
    const poolRates = {
      "inground_concrete": 0.10,
      "inground_vinyl": 0.06,
      "above_ground": 0.015,
      "default": 0.06,
    };
    const poolRate = poolRates[data.poolType] || poolRates["default"];
    li15Boost += Math.round(depreciableBasis * poolRate);
  }

  // Deck / porch — real study: 960 SF deck = $32,994 (~$34/SF → ~4.3% on $771K basis)
  // Scale by approximate size: small (~200sf → 1%), medium (~500sf → 2.5%), large (~1000sf → 4.5%)
  if (data.hasDeck) {
    const deckRates = { "small": 0.01, "medium": 0.025, "large": 0.045 };
    const deckRate = deckRates[data.deckSize] || 0.02;
    li15Boost += Math.round(depreciableBasis * deckRate);
  }

  return { pp5Boost, li15Boost };
}

// ─── COMPONENT BREAKDOWNS ────────────────────────────────────────────────────
// Rebalanced against 6 real cost segregation studies.
// Removable floor coverings raised to match real data (30-46% of 5-year bucket).

// Unfurnished residential — structural-adjacent personal property only
const RESIDENTIAL_5YR_UNFURNISHED = [
  { name: "Removable Floor Coverings", pct: 0.30 },
  { name: "Kitchen Cabinetry", pct: 0.12 },
  { name: "Kitchen Countertops", pct: 0.08 },
  { name: "Appliances (Residential)", pct: 0.07 },
  { name: "Special Purpose Electrical", pct: 0.08 },
  { name: "Special Purpose Plumbing", pct: 0.06 },
  { name: "Decorative Lighting", pct: 0.04 },
  { name: "Ceiling Fans", pct: 0.04 },
  { name: "Window Coverings", pct: 0.05 },
  { name: "Sink & Rough-in", pct: 0.04 },
  { name: "Laundry Equipment & Connections", pct: 0.04 },
  { name: "Decorative Trim & Moldings", pct: 0.03 },
  { name: "Closet Rod / Shelving", pct: 0.02 },
  { name: "Wood Base Moldings", pct: 0.02 },
  { name: "Telephone & Data Systems", pct: 0.01 },
];

// Furnished residential — furniture dominates at ~35% of 5-year total
// Calibrated: Madison SPECS study showed furniture = 47% of 5-year for a fully furnished STR
const RESIDENTIAL_5YR_FURNISHED = [
  { name: "Furniture (Beds, Sofas, Tables, Chairs)", pct: 0.32 },
  { name: "Removable Floor Coverings", pct: 0.12 },
  { name: "Window Treatments (Drapes, Blinds)", pct: 0.08 },
  { name: "Kitchen Cabinetry", pct: 0.05 },
  { name: "Kitchen Countertops", pct: 0.03 },
  { name: "Appliances (Residential)", pct: 0.05 },
  { name: "Special Purpose Electrical", pct: 0.06 },
  { name: "Special Purpose Plumbing", pct: 0.07 },
  { name: "Ceiling Fans", pct: 0.02 },
  { name: "Decorative Lighting (Chandeliers, Sconces)", pct: 0.03 },
  { name: "Sink & Rough-in", pct: 0.03 },
  { name: "Laundry Equipment & Connections", pct: 0.03 },
  { name: "Millwork & Bar", pct: 0.02 },
  { name: "Electronics (TVs, Sound Systems)", pct: 0.04 },
  { name: "Closet Rod / Shelving", pct: 0.01 },
  { name: "Decorative Trim & Moldings", pct: 0.01 },
  { name: "Art & Decorative Items", pct: 0.02 },
  { name: "Small Appliances & Accessories", pct: 0.01 },
];

const COMMERCIAL_5YR_COMPONENTS = [
  { name: "Removable Floor Coverings", pct: 0.14 },
  { name: "Carpeting & Padding", pct: 0.08 },
  { name: "Cabinetry & Millwork", pct: 0.06 },
  { name: "Countertops", pct: 0.04 },
  { name: "Decorative Lighting", pct: 0.06 },
  { name: "Window Treatments", pct: 0.03 },
  { name: "Special Purpose Electrical", pct: 0.08 },
  { name: "Special Purpose Plumbing", pct: 0.05 },
  { name: "Telephone & Data Systems", pct: 0.04 },
  { name: "Security Systems", pct: 0.03 },
  { name: "Signage (Interior)", pct: 0.02 },
  { name: "Furniture & Fixtures", pct: 0.03 },
];

// Land improvements — reduced base weights for residential, conditional on features
const LAND_IMPROVEMENT_COMPONENTS = [
  { name: "Asphalt Paving / Driveway", pct: 0.25, condition: () => true },
  { name: "Fencing", pct: 0.12, condition: () => true },
  { name: "Site FF&E (Grills, Outdoor Equipment)", pct: 0.08, condition: () => true },
  { name: "Landscaping & Irrigation", pct: 0.12, condition: (d) => !["single_family", "condo"].includes(d.propertyType) || d.hasPool },
  { name: "Concrete Paving / Sidewalks", pct: 0.08, condition: (d) => !["single_family", "condo"].includes(d.propertyType) },
  { name: "Exterior Lighting", pct: 0.05, condition: () => true },
  { name: "Parking Lot / Paving", pct: 0.15, condition: (d) => !["single_family", "condo"].includes(d.propertyType) },
  { name: "Swimming Pool", pct: 0.30, condition: (d) => d.hasPool },
  { name: "Deck / Porch", pct: 0.25, condition: (d) => d.hasDeck },
  { name: "Retaining Walls", pct: 0.05, condition: (d) => !["single_family", "condo"].includes(d.propertyType) },
  { name: "Drainage Systems", pct: 0.05, condition: (d) => !["single_family", "condo"].includes(d.propertyType) },
];

// ─── BONUS DEPRECIATION SCHEDULE ─────────────────────────────────────────────
const BONUS_RATES = {
  2020: 1.00, 2021: 1.00, 2022: 1.00,
  2023: 0.80, 2024: 0.60, 2025: 0.40, 2026: 0.20, 2027: 0.00,
};

// ─── MAIN ENGINE ─────────────────────────────────────────────────────────────
export function runCostSegAnalysis(data) {
  const purchasePrice = parseFloat(data.purchasePrice) || 0;
  const landValue = parseFloat(data.landValue) || 0;
  const depreciableBasis = purchasePrice - landValue;
  const yearBuilt = parseInt(data.yearBuilt) || 2000;
  const yearPurchased = parseInt(data.yearPurchased) || new Date().getFullYear();
  const taxRate = parseFloat(data.taxRate) || 37;
  const isResidential = ["single_family", "condo", "multifamily", "apartment"].includes(data.propertyType);
  const isFurnished = data.isFurnished || false;

  // STR / transient basis detection: if residential but rented short-term (avg stay < 30 days),
  // IRS classifies as nonresidential real property → 39-year life per IRC §168(e)(2)(A)(ii)
  const isSTR = data.isShortTermRental || false;
  const buildingLife = isResidential ? (isSTR ? 39 : 27.5) : 39;

  const profile = ALLOCATION_PROFILES[data.propertyType] || ALLOCATION_PROFILES["single_family"];
  const ageMult = getAgeMultiplier(yearBuilt);
  const gradeMult = getGradeMultiplier(data.buildingGrade);
  const flooringMult = getFlooringMultiplier(data.flooringType);
  const renoMult = getRenovationMultiplier(data.recentlyRenovated || false);

  // Select base 5-year rate based on furnished status
  const basePP5 = isFurnished ? profile.pp5_furnished : profile.pp5;

  // Calculate adjusted percentages — flooring and renovation now factor in
  let pp5Pct = Math.min(basePP5 * ageMult * gradeMult * flooringMult * renoMult, 0.50);
  let li15Pct = Math.min(profile.li15 * ageMult, 0.35);

  // Base allocations
  let pp5Total = Math.round(depreciableBasis * pp5Pct);
  let li15Total = Math.round(depreciableBasis * li15Pct);

  // Add feature-based adjustments
  const features = getFeatureAdjustments(data, depreciableBasis);
  pp5Total += features.pp5Boost;
  li15Total += features.li15Boost;

  // Cap total segregated at 50% of depreciable basis (safety rail)
  const maxSegregated = Math.round(depreciableBasis * 0.50);
  if (pp5Total + li15Total > maxSegregated) {
    const ratio = maxSegregated / (pp5Total + li15Total);
    pp5Total = Math.round(pp5Total * ratio);
    li15Total = Math.round(li15Total * ratio);
  }

  const buildingTotal = depreciableBasis - pp5Total - li15Total;
  const segregatedTotal = pp5Total + li15Total;
  const segregatedPct = ((segregatedTotal / depreciableBasis) * 100).toFixed(1);

  // Component breakdowns — select list based on property type and furnished status
  let componentList;
  if (isResidential) {
    componentList = isFurnished ? RESIDENTIAL_5YR_FURNISHED : RESIDENTIAL_5YR_UNFURNISHED;
  } else {
    componentList = COMMERCIAL_5YR_COMPONENTS;
  }

  // Add conditional components for features
  const dynamicComponents = [...componentList];
  if (data.hasHotTub) {
    dynamicComponents.push({ name: "Hot Tub / Jacuzzi (Plumbing & Electrical)", pct: 0.08 });
  }
  if (data.hasFireplace) {
    const numFp = Math.min(parseInt(data.numFireplaces) || 1, 4);
    dynamicComponents.push({ name: `Fireplace Inserts (${numFp})`, pct: 0.04 * numFp });
  }
  if (data.hasGameRoom) {
    dynamicComponents.push({ name: "Game Room / Theater Equipment", pct: 0.06 });
  }

  const totalPctSum = dynamicComponents.reduce((s, c) => s + c.pct, 0);
  const pp5Components = dynamicComponents.map(c => ({
    name: c.name,
    value: Math.round(pp5Total * (c.pct / totalPctSum)),
    life: 5,
    method: "200% DB",
  }));

  const applicableLI = LAND_IMPROVEMENT_COMPONENTS.filter(c => c.condition(data));
  const liPctSum = applicableLI.reduce((s, c) => s + c.pct, 0);
  const li15Components = applicableLI.map(c => ({
    name: c.name,
    value: Math.round(li15Total * (c.pct / liPctSum)),
    life: 15,
    method: "150% DB",
  }));

  // Bonus depreciation
  const bonusRate = BONUS_RATES[yearPurchased] ?? (yearPurchased >= 2028 ? 0 : 0.40);
  const bonusAmount = Math.round(segregatedTotal * bonusRate);

  // Year 1 depreciation comparison
  const csYear1Dep = bonusAmount + Math.round(buildingTotal / buildingLife * 0.5);
  const noCsYear1Dep = Math.round(depreciableBasis / buildingLife * 0.5);
  const year1Benefit = csYear1Dep - noCsYear1Dep;
  const year1TaxSavings = Math.round(year1Benefit * (taxRate / 100));

  // 5-year NPV benefit
  const discountRate = 0.05;
  let npvCS = 0, npvNoCS = 0;
  for (let y = 0; y < 6; y++) {
    let csDep = 0;
    if (y === 0) {
      csDep = bonusAmount + Math.round(buildingTotal / buildingLife * 0.5);
      if (bonusRate < 1) {
        const remaining5 = pp5Total - Math.round(pp5Total * bonusRate);
        const remaining15 = li15Total - Math.round(li15Total * bonusRate);
        csDep += Math.round(remaining5 * 0.20) + Math.round(remaining15 * 0.05);
      }
    } else if (y <= 5) {
      const annualBuilding = Math.round(buildingTotal / buildingLife);
      let annual5 = 0, annual15 = 0;
      if (bonusRate < 1) {
        const remaining5 = pp5Total - Math.round(pp5Total * bonusRate);
        const remaining15 = li15Total - Math.round(li15Total * bonusRate);
        const rates5 = [0.32, 0.192, 0.1152, 0.1152, 0.0576];
        const rates15 = [0.095, 0.0855, 0.077, 0.0693, 0.0623];
        annual5 = Math.round(remaining5 * (rates5[y - 1] || 0));
        annual15 = Math.round(remaining15 * (rates15[y - 1] || 0));
      }
      csDep = annualBuilding + annual5 + annual15;
    }
    const noCsDep = y === 0
      ? Math.round(depreciableBasis / buildingLife * 0.5)
      : Math.round(depreciableBasis / buildingLife);
    npvCS += (csDep * (taxRate / 100)) / Math.pow(1 + discountRate, y);
    npvNoCS += (noCsDep * (taxRate / 100)) / Math.pow(1 + discountRate, y);
  }
  const npvBenefit = Math.round(npvCS - npvNoCS);

  return {
    purchasePrice, landValue, depreciableBasis, buildingLife,
    landPct: ((landValue / purchasePrice) * 100).toFixed(1),
    pp5Total, pp5Pct: ((pp5Total / depreciableBasis) * 100).toFixed(1),
    li15Total, li15Pct: ((li15Total / depreciableBasis) * 100).toFixed(1),
    buildingTotal, buildingPct: ((buildingTotal / depreciableBasis) * 100).toFixed(1),
    segregatedTotal, segregatedPct,
    pp5Components, li15Components,
    bonusRate: (bonusRate * 100).toFixed(0),
    bonusAmount,
    csYear1Dep, noCsYear1Dep, year1Benefit, year1TaxSavings,
    npvBenefit,
    taxRate,
    propertyType: profile.label,
    isResidential,
    isSTR,
    isFurnished,
    yearPurchased,
  };
}
