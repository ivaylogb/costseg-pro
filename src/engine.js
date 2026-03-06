// ─── ALLOCATION PROFILES BY PROPERTY TYPE ─────────────────────────────────────
export const ALLOCATION_PROFILES = {
  "single_family": { pp5: 0.15, li15: 0.08, label: "Single Family Rental" },
  "condo": { pp5: 0.12, li15: 0.05, label: "Condo / Townhome" },
  "multifamily": { pp5: 0.18, li15: 0.10, label: "Multifamily (2-4 units)" },
  "apartment": { pp5: 0.20, li15: 0.12, label: "Apartment Complex (5+)" },
  "office": { pp5: 0.15, li15: 0.10, label: "Office Building" },
  "retail": { pp5: 0.20, li15: 0.12, label: "Retail / Strip Mall" },
  "restaurant": { pp5: 0.35, li15: 0.10, label: "Restaurant" },
  "industrial": { pp5: 0.12, li15: 0.15, label: "Industrial / Warehouse" },
  "hotel": { pp5: 0.22, li15: 0.08, label: "Hotel / Motel" },
  "mixed_use": { pp5: 0.18, li15: 0.10, label: "Mixed Use" },
};

// ─── ADJUSTMENT FACTORS ──────────────────────────────────────────────────────
function getAgeMultiplier(yearBuilt) {
  const age = new Date().getFullYear() - yearBuilt;
  if (age <= 5) return 0.85;
  if (age <= 15) return 0.95;
  if (age <= 30) return 1.05;
  if (age <= 50) return 1.10;
  return 1.15;
}

function getGradeMultiplier(grade) {
  const grades = { "economy": 0.80, "standard": 1.0, "custom": 1.15, "luxury": 1.30 };
  return grades[grade] || 1.0;
}

// ─── COMPONENT BREAKDOWNS ────────────────────────────────────────────────────
const RESIDENTIAL_5YR_COMPONENTS = [
  { name: "Carpeting & Padding", pct: 0.06 },
  { name: "Removable Floor Coverings (LVP/Laminate)", pct: 0.10 },
  { name: "Kitchen Cabinetry", pct: 0.08 },
  { name: "Kitchen Countertops", pct: 0.05 },
  { name: "Decorative Lighting", pct: 0.04 },
  { name: "Task Lighting", pct: 0.02 },
  { name: "Ceiling Fans", pct: 0.02 },
  { name: "Window Coverings", pct: 0.03 },
  { name: "Appliances (Residential)", pct: 0.06 },
  { name: "Special Purpose Electrical", pct: 0.04 },
  { name: "Special Purpose Plumbing", pct: 0.03 },
  { name: "Decorative Trim & Moldings", pct: 0.02 },
  { name: "Mirrors & Shelving", pct: 0.01 },
  { name: "Telephone & Data Systems", pct: 0.01 },
];

const COMMERCIAL_5YR_COMPONENTS = [
  { name: "Carpeting & Padding", pct: 0.08 },
  { name: "Removable Floor Coverings", pct: 0.08 },
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

const LAND_IMPROVEMENT_COMPONENTS = [
  { name: "Landscaping & Irrigation", pct: 0.25, condition: () => true },
  { name: "Concrete Paving / Sidewalks", pct: 0.15, condition: () => true },
  { name: "Fencing", pct: 0.10, condition: () => true },
  { name: "Exterior Lighting", pct: 0.05, condition: () => true },
  { name: "Parking Lot / Paving", pct: 0.20, condition: (d) => !["single_family", "condo"].includes(d.propertyType) },
  { name: "Swimming Pool", pct: 0.30, condition: (d) => d.hasPool },
  { name: "Retaining Walls", pct: 0.05, condition: () => true },
  { name: "Drainage Systems", pct: 0.05, condition: () => true },
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
  const buildingLife = isResidential ? 27.5 : 39;

  const profile = ALLOCATION_PROFILES[data.propertyType] || ALLOCATION_PROFILES["single_family"];
  const ageMult = getAgeMultiplier(yearBuilt);
  const gradeMult = getGradeMultiplier(data.buildingGrade);

  // Calculate adjusted percentages
  let pp5Pct = Math.min(profile.pp5 * ageMult * gradeMult, 0.45);
  let li15Pct = Math.min(profile.li15 * ageMult * (data.hasPool ? 1.4 : 1.0), 0.35);

  // Allocations
  const pp5Total = Math.round(depreciableBasis * pp5Pct);
  const li15Total = Math.round(depreciableBasis * li15Pct);
  const buildingTotal = depreciableBasis - pp5Total - li15Total;
  const segregatedTotal = pp5Total + li15Total;
  const segregatedPct = ((segregatedTotal / depreciableBasis) * 100).toFixed(1);

  // Component breakdowns
  const componentList = isResidential ? RESIDENTIAL_5YR_COMPONENTS : COMMERCIAL_5YR_COMPONENTS;
  const totalPctSum = componentList.reduce((s, c) => s + c.pct, 0);
  const pp5Components = componentList.map(c => ({
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
    yearPurchased,
  };
}
