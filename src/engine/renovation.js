// ─── RENOVATION COST SEGREGATION MODULE ─────────────────────────────────────
// Handles two input modes:
//   1. Budget upload (detailed): line items classified by category
//   2. Total amount (simple): default allocation percentages applied
//
// Calibrated against Stella Phase II (R1) and Cypress Edge (R2) renovation studies.
// Renovation uses the INVOICE METHOD — actual costs, no RCN.

// ─── BUDGET CATEGORY DEFINITIONS ────────────────────────────────────────────
// Used when user uploads or enters a detailed budget
export const RENO_CATEGORIES = {
  pp5: [
    { id: "appliances",   label: "Kitchen Appliances",         help: "Fridge, oven, dishwasher, disposal, microwave, range hood, washer/dryer" },
    { id: "cabinetry",    label: "Cabinetry",                  help: "Kitchen and bathroom cabinets, built-in shelving" },
    { id: "countertops",  label: "Countertops",                help: "Kitchen & bath — laminate, granite, quartz, marble" },
    { id: "flooring",     label: "Flooring",                   help: "Carpet, LVT, vinyl plank, laminate, hardwood, floor base/trim" },
    { id: "lighting",     label: "Decorative Lighting & Fans", help: "Light fixtures, ceiling fans, pendant lights, sconces" },
    { id: "window_treat", label: "Window Treatments",          help: "Blinds, shades, curtains, curtain rods" },
    { id: "mirrors",      label: "Mirrors",                    help: "Bathroom mirrors, decorative mirrors" },
    { id: "ffe",          label: "Furniture & FF&E",           help: "Furniture, desks, tables, TVs, equipment" },
    { id: "security",     label: "Security Systems",           help: "Cameras, alarm systems, access control" },
  ],
  li15: [
    { id: "landscaping",  label: "Landscaping",                help: "Sod, trees, shrubs, mulch, irrigation, retaining walls" },
    { id: "paving",       label: "Paving & Parking",           help: "Asphalt, concrete sidewalks, driveway, curbing" },
    { id: "fencing",      label: "Fencing & Gates",            help: "Wood, chain link, decorative metal, gates" },
    { id: "signage",      label: "Signage",                    help: "Property signs, address markers" },
    { id: "pool_outdoor", label: "Pool & Outdoor",             help: "Pool resurfacing, equipment, deck, outdoor kitchen" },
  ],
  rp: [
    { id: "painting",     label: "Painting",                   help: "Interior and exterior painting, staining" },
    { id: "hvac",         label: "HVAC",                       help: "HVAC replacement, furnace, AC, ductwork" },
    { id: "plumbing",     label: "Plumbing",                   help: "Pipe replacement, water heater, toilet, tub, shower" },
    { id: "electrical",   label: "Electrical",                 help: "Panel upgrade, rewiring, outlets" },
    { id: "roofing",      label: "Roofing",                    help: "Roof replacement, shingles, flashing, gutters" },
    { id: "general",      label: "General Construction",       help: "Framing, drywall, structural doors/windows, exterior repairs" },
  ],
};

// Flat lookup: category id → class life
const CATEGORY_LIFE = {};
RENO_CATEGORIES.pp5.forEach(c => { CATEGORY_LIFE[c.id] = 5; });
RENO_CATEGORIES.li15.forEach(c => { CATEGORY_LIFE[c.id] = 15; });
RENO_CATEGORIES.rp.forEach(c => { CATEGORY_LIFE[c.id] = "building"; });

// ─── DEFAULT RENOVATION ALLOCATIONS ─────────────────────────────────────────
// Used when user enters just a total amount (no detailed budget).
// SFR renovations are predominantly interior → higher 5-yr %.
// Calibrated: R1=37%/3%/60%, R2=37%/15%/48%. SFR skews more interior.
const DEFAULT_RENO_ALLOC = {
  single_family:  { pp5: 0.40, li15: 0.05 },
  condo:          { pp5: 0.42, li15: 0.03 },
  multifamily:    { pp5: 0.38, li15: 0.07 },
  apartment:      { pp5: 0.37, li15: 0.09 },
  // Commercial defaults (less relevant now but kept for future)
  office:         { pp5: 0.30, li15: 0.05 },
  retail:         { pp5: 0.35, li15: 0.08 },
  restaurant:     { pp5: 0.45, li15: 0.05 },
  industrial:     { pp5: 0.20, li15: 0.10 },
  hotel:          { pp5: 0.35, li15: 0.05 },
  mixed_use:      { pp5: 0.32, li15: 0.06 },
};

// ─── INDIRECT COST OPTIONS ──────────────────────────────────────────────────
export const INDIRECT_COST_OPTIONS = [
  { value: "gc",       label: "General Contractor (15–20%)", rate: 0.17 },
  { value: "self_sub", label: "Self-managed with subs (8–12%)", rate: 0.10 },
  { value: "diy",      label: "DIY / Materials only (0%)", rate: 0.00 },
  { value: "custom",   label: "Custom rate", rate: null },
];

// ─── COMPUTE RENOVATION ADDITIONS ───────────────────────────────────────────
// Returns { renoPP5, renoLI15, renoRP, renoTotal, renoComponents }
// These get ADDED to the main purchase analysis results.
export function computeRenovationAdditions(data) {
  const hasReno = data.hasRenovation;
  if (!hasReno) return null;

  const isDetailed = data.renoMode === "detailed";
  const renoItems = data.renovationItems || [];
  const renoTotalInput = parseFloat(data.renoTotalAmount) || 0;

  // Determine indirect cost rate
  let indirectRate = 0;
  if (data.renoIndirectType === "custom") {
    indirectRate = (parseFloat(data.renoIndirectCustomRate) || 0) / 100;
  } else {
    const opt = INDIRECT_COST_OPTIONS.find(o => o.value === (data.renoIndirectType || "gc"));
    indirectRate = opt?.rate || 0;
  }

  let directPP5 = 0, directLI15 = 0, directRP = 0;
  let pp5Components = [];
  let li15Components = [];

  if (isDetailed && renoItems.length > 0) {
    // ── Detailed mode: classify each line item ──
    renoItems.forEach(item => {
      const amount = parseFloat(item.amount) || 0;
      if (amount <= 0) return;
      const life = CATEGORY_LIFE[item.categoryId];
      if (life === 5) {
        directPP5 += amount;
        pp5Components.push({ name: item.label, value: amount, life: 5, method: "200% DB" });
      } else if (life === 15) {
        directLI15 += amount;
        li15Components.push({ name: item.label, value: amount, life: 15, method: "150% DB" });
      } else {
        directRP += amount;
      }
    });
  } else if (renoTotalInput >= 10000) {
    // ── Simple mode: apply default allocation percentages ──
    const alloc = DEFAULT_RENO_ALLOC[data.propertyType] || DEFAULT_RENO_ALLOC.single_family;
    directPP5 = Math.round(renoTotalInput * alloc.pp5);
    directLI15 = Math.round(renoTotalInput * alloc.li15);
    directRP = renoTotalInput - directPP5 - directLI15;

    pp5Components = [{ name: "Renovation — Personal Property (estimated)", value: directPP5, life: 5, method: "200% DB" }];
    li15Components = [{ name: "Renovation — Land Improvements (estimated)", value: directLI15, life: 15, method: "150% DB" }];
  } else {
    return null;
  }

  const directTotal = directPP5 + directLI15 + directRP;
  if (directTotal <= 0) return null;

  // Apply indirect cost markup proportionally
  const multiplier = 1 + indirectRate;
  const renoPP5 = Math.round(directPP5 * multiplier);
  const renoLI15 = Math.round(directLI15 * multiplier);
  const renoTotal = Math.round(directTotal * multiplier);
  const renoRP = renoTotal - renoPP5 - renoLI15;

  // Scale component values by indirect multiplier
  pp5Components = pp5Components.map(c => ({ ...c, value: Math.round(c.value * multiplier) }));
  li15Components = li15Components.map(c => ({ ...c, value: Math.round(c.value * multiplier) }));

  return {
    renoPP5,
    renoLI15,
    renoRP,
    renoTotal,
    renoDirectTotal: directTotal,
    renoIndirectTotal: renoTotal - directTotal,
    renoIndirectRate: indirectRate,
    renoPP5Components: pp5Components,
    renoLI15Components: li15Components,
    isDetailed,
  };
}
