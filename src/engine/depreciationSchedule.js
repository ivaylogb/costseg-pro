// ─── MACRS DEPRECIATION SCHEDULE ────────────────────────────────────────────
// Full IRS MACRS percentage tables per Rev. Proc. 87-57.
// Half-year convention for 5-year and 15-year property.
// Mid-month convention for 27.5-year and 39-year real property.
// ────────────────────────────────────────────────────────────────────────────

// 5-Year 200% DB, Half-Year Convention (Table A-1)
const MACRS_5YR = [0.2000, 0.3200, 0.1920, 0.1152, 0.1152, 0.0576];

// 15-Year 150% DB, Half-Year Convention (Table A-1)
const MACRS_15YR = [
  0.0500, 0.0950, 0.0855, 0.0770, 0.0693, 0.0623,
  0.0590, 0.0590, 0.0591, 0.0590, 0.0591, 0.0590,
  0.0591, 0.0590, 0.0591, 0.0295,
];

// 27.5-Year SL, Mid-Month Convention (Table A-6)
// Index 0 = month 1 (January), etc. Value = Year 1 percentage.
// Subsequent years = 3.636% except final year.
const MACRS_275_MONTH1 = [
  0.03485, 0.03182, 0.02879, 0.02576, 0.02273, 0.01970,
  0.01667, 0.01364, 0.01061, 0.00758, 0.00455, 0.00152,
];
const MACRS_275_ANNUAL = 0.03636;

// 39-Year SL, Mid-Month Convention (Table A-7a)
// Index 0 = month 1 (January), etc. Value = Year 1 percentage.
// Subsequent years = 2.5641% except final year.
const MACRS_39_MONTH1 = [
  0.02461, 0.02247, 0.02033, 0.01819, 0.01605, 0.01391,
  0.01177, 0.00963, 0.00749, 0.00535, 0.00321, 0.00107,
];
const MACRS_39_ANNUAL = 0.02564;

// ─── GENERATE FULL DEPRECIATION SCHEDULE ────────────────────────────────────
// Returns an array of year objects with depreciation for each asset class,
// both with and without cost segregation.
export function generateDepreciationSchedule(results, formData) {
  const r = results;
  const yearPurchased = parseInt(formData.yearPurchased) || new Date().getFullYear();
  // Default to mid-year (July) if no month specified
  const monthPlaced = parseInt(formData.monthPurchased) || 7;
  const monthIndex = Math.max(0, Math.min(11, monthPlaced - 1));

  const bonusRate = parseFloat(r.bonusRate) / 100;
  const taxRate = r.taxRate / 100;

  // Amounts after bonus
  const bonus5 = Math.round(r.pp5Total * bonusRate);
  const bonus15 = Math.round(r.li15Total * bonusRate);
  const remaining5 = r.pp5Total - bonus5;
  const remaining15 = r.li15Total - bonus15;
  const buildingTotal = r.buildingTotal;
  const buildingLife = r.buildingLife;

  // Determine how many years to show
  const maxYears = Math.max(Math.ceil(buildingLife) + 1, 16);
  const schedule = [];

  let cumCS = 0;
  let cumNoCS = 0;

  for (let y = 0; y < maxYears; y++) {
    const calendarYear = yearPurchased + y;

    // ── 5-Year property depreciation (on remaining after bonus) ──
    let dep5 = 0;
    if (y === 0) {
      dep5 = bonus5; // Bonus in year 1
    }
    if (y < MACRS_5YR.length) {
      dep5 += Math.round(remaining5 * MACRS_5YR[y]);
    }

    // ── 15-Year property depreciation (on remaining after bonus) ──
    let dep15 = 0;
    if (y === 0) {
      dep15 = bonus15;
    }
    if (y < MACRS_15YR.length) {
      dep15 += Math.round(remaining15 * MACRS_15YR[y]);
    }

    // ── Building depreciation ──
    let depBuilding = 0;
    if (buildingLife === 27.5) {
      if (y === 0) {
        depBuilding = Math.round(buildingTotal * MACRS_275_MONTH1[monthIndex]);
      } else if (y < 28) {
        depBuilding = Math.round(buildingTotal * MACRS_275_ANNUAL);
      } else if (y === 28) {
        // Final partial year — remainder
        const priorDep = Math.round(buildingTotal * MACRS_275_MONTH1[monthIndex])
          + Math.round(buildingTotal * MACRS_275_ANNUAL) * 27;
        depBuilding = Math.max(0, buildingTotal - priorDep);
      }
    } else {
      // 39-year
      if (y === 0) {
        depBuilding = Math.round(buildingTotal * MACRS_39_MONTH1[monthIndex]);
      } else if (y < 39) {
        depBuilding = Math.round(buildingTotal * MACRS_39_ANNUAL);
      } else if (y === 39) {
        const priorDep = Math.round(buildingTotal * MACRS_39_MONTH1[monthIndex])
          + Math.round(buildingTotal * MACRS_39_ANNUAL) * 38;
        depBuilding = Math.max(0, buildingTotal - priorDep);
      }
    }

    // ── Total with cost seg ──
    const totalCS = dep5 + dep15 + depBuilding;

    // ── Without cost seg (everything at building life, SL) ──
    let totalNoCS = 0;
    const depBasis = r.depreciableBasis;
    if (buildingLife === 27.5) {
      if (y === 0) {
        totalNoCS = Math.round(depBasis * MACRS_275_MONTH1[monthIndex]);
      } else if (y < 28) {
        totalNoCS = Math.round(depBasis * MACRS_275_ANNUAL);
      } else if (y === 28) {
        const priorNCS = Math.round(depBasis * MACRS_275_MONTH1[monthIndex])
          + Math.round(depBasis * MACRS_275_ANNUAL) * 27;
        totalNoCS = Math.max(0, depBasis - priorNCS);
      }
    } else {
      if (y === 0) {
        totalNoCS = Math.round(depBasis * MACRS_39_MONTH1[monthIndex]);
      } else if (y < 39) {
        totalNoCS = Math.round(depBasis * MACRS_39_ANNUAL);
      } else if (y === 39) {
        const priorNCS = Math.round(depBasis * MACRS_39_MONTH1[monthIndex])
          + Math.round(depBasis * MACRS_39_ANNUAL) * 38;
        totalNoCS = Math.max(0, depBasis - priorNCS);
      }
    }

    cumCS += totalCS;
    cumNoCS += totalNoCS;

    const benefit = totalCS - totalNoCS;
    const taxSavings = Math.round(benefit * taxRate);

    // Only include years where something is depreciating
    if (totalCS > 0 || totalNoCS > 0) {
      schedule.push({
        year: y + 1,
        calendarYear,
        dep5yr: dep5,
        dep15yr: dep15,
        depBuilding,
        totalCS,
        totalNoCS,
        benefit,
        taxSavings,
        cumCS,
        cumNoCS,
        cumBenefit: cumCS - cumNoCS,
      });
    }
  }

  return schedule;
}

// ─── SUMMARY STATS FROM SCHEDULE ────────────────────────────────────────────
export function getScheduleSummary(schedule, taxRate) {
  const rate = taxRate / 100;
  const year1 = schedule[0] || {};
  const first5 = schedule.slice(0, 5);
  const first10 = schedule.slice(0, 10);

  return {
    year1Benefit: year1.benefit || 0,
    year1TaxSavings: year1.taxSavings || 0,
    fiveYearCumCS: first5.reduce((s, r) => s + r.totalCS, 0),
    fiveYearCumNoCS: first5.reduce((s, r) => s + r.totalNoCS, 0),
    fiveYearBenefit: first5.reduce((s, r) => s + r.benefit, 0),
    fiveYearTaxSavings: first5.reduce((s, r) => s + r.taxSavings, 0),
    tenYearCumCS: first10.reduce((s, r) => s + r.totalCS, 0),
    tenYearCumNoCS: first10.reduce((s, r) => s + r.totalNoCS, 0),
    tenYearBenefit: first10.reduce((s, r) => s + r.benefit, 0),
    tenYearTaxSavings: first10.reduce((s, r) => s + r.taxSavings, 0),
    totalYears: schedule.length,
  };
}
