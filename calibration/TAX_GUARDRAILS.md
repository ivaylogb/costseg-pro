# CostSegPro — Tax Engine Guardrails

These rules are **non-negotiable** for the cost segregation engine. Any code change that touches depreciation calculations, bonus rates, asset classification, or tax output must comply with every rule below. When in doubt, be conservative — understating a benefit is acceptable, overstating one is not.

---

## 1. OBBBA (One Big Beautiful Bill Act) — Signed July 4, 2025

The OBBBA **permanently** restored 100% bonus depreciation. This is the single most important change to our engine.

### Bonus Depreciation Rates (Updated)

| Acquired & Placed in Service | Bonus Rate |
|---|---|
| 2017–2022 | 100% |
| 2023 | 80% |
| 2024 | 60% |
| Jan 1–Jan 19, 2025 | 40% |
| **After Jan 19, 2025** | **100% (permanent)** |

**Critical rules:**
- Property must be **both acquired AND placed in service** after Jan 19, 2025 to get 100%.
- If a binding contract was signed on or before Jan 19, 2025, the property is treated as acquired on the contract date — meaning it does NOT qualify for 100% even if placed in service later.
- Property placed in service between Jan 1–Jan 19, 2025 gets 40% (pre-OBBBA rate).
- Taxpayers may **elect** 40% instead of 100% for the first tax year ending after Jan 19, 2025.

### Engine Implementation
- Default to 100% for `yearPurchased >= 2025` (assuming acquisition after Jan 19)
- For properties placed in service Jan 1–19, 2025: apply 40%
- The engine should ask for placed-in-service date, not just year, when it matters (2025 specifically)
- Prior years remain unchanged: 2024=60%, 2023=80%, 2022 and earlier=100%

### Section 179 (Updated)
- Deduction limit: **$2,500,000** (up from $1,160,000)
- Phase-out threshold: **$4,000,000** (up from $2,890,000)
- We do NOT currently model Section 179 in the engine — this is a future feature
- When we add it: Section 179 must be manually elected, cannot exceed business income, and has different rules than bonus depreciation

---

## 2. "Placed in Service" Rules

Tax benefits are tied to when an asset is **ready and available for its intended use**, NOT the purchase date.

**Engine must respect:**
- "Placed in service" ≠ "purchased" — a property bought in 2024 but not move-in ready until Feb 2025 could qualify for 100% bonus
- For renovations: placed-in-service date = when the renovation work is complete and the property is available for use
- For new construction: placed-in-service date = when certificate of occupancy is issued or equivalent

**How we handle this:**
- We ask for "Year Purchased / Placed in Service" — this is the placed-in-service year
- We should add a note or tooltip clarifying the distinction
- For 2025 properties specifically, we should prompt for the month (before/after Jan 19)

---

## 3. Look-Back / Catch-Up Strategy (Form 3115)

Properties purchased in prior years (2020–2024) that didn't maximize depreciation can catch up.

**How it works:**
- A cost segregation study reclassifies 39-yr/27.5-yr components into 5, 7, or 15-yr assets
- Form 3115 (Change in Accounting Method) lets the taxpayer claim ALL missed depreciation as a single lump-sum deduction on the current year's return
- This is called a "§481(a) adjustment" — it's a cumulative catch-up, not amended returns

**Engine guardrails:**
- When `yearPurchased < currentYear`, we should flag that Form 3115 may be needed
- We already show a warning for this — keep it
- The catch-up deduction = what depreciation SHOULD have been (with cost seg) minus what WAS taken (without cost seg), cumulative from placed-in-service year through prior year
- We do NOT currently calculate the 3115 catch-up amount — this is a future feature
- When we add it: the math is (cumulative cost-seg depreciation) - (cumulative straight-line depreciation taken) = §481(a) adjustment

---

## 4. Core MACRS Rules (Unchanged by OBBBA)

These are foundational IRS rules that the engine must always follow.

### Recovery Periods
| Property Type | Recovery Period | Method | Convention |
|---|---|---|---|
| 5-Year (§1245 personal property) | 5 years | 200% DB | Half-year |
| 7-Year (§1245 personal property) | 7 years | 200% DB | Half-year |
| 15-Year (land improvements) | 15 years | 150% DB | Half-year |
| 27.5-Year (residential rental) | 27.5 years | Straight-line | Mid-month |
| 39-Year (nonresidential real) | 39 years | Straight-line | Mid-month |

### Residential vs. Nonresidential Classification
- **Residential rental** (27.5 yr): 80%+ of gross rental income is from dwelling units
- **Nonresidential** (39 yr): everything else, including offices, retail, industrial
- **STR/transient use** (39 yr): residential property where average stay < 30 days is classified as nonresidential per IRC §168(e)(2)(A)(ii) — hotels, Airbnbs, vacation rentals

### Land Is Never Depreciable
- Land value must always be separated from purchase price
- Depreciable basis = Purchase price - Land value
- Our FHFA-based land estimator helps, but the user's county assessor split is the IRS-accepted method

### Safety Caps
- Total accelerated property (5-yr + 15-yr) should generally not exceed 50% of depreciable basis for residential
- If our engine produces allocations above this, something is wrong — apply a safety cap and flag it

---

## 5. What We Must NEVER Do

- **Never claim this is a formal cost segregation study** — it's an estimate/preliminary analysis
- **Never produce a number we can't defend** with reference to RSMeans, Marshall & Swift, or comparable construction cost data
- **Never apply bonus depreciation to the 27.5-yr or 39-yr building component** — only 5, 7, and 15-yr property qualifies
- **Never depreciate land**
- **Never ignore the STR classification** — if average stay < 30 days, it's 39-yr not 27.5-yr
- **Never retroactively apply OBBBA rates** — properties acquired before Jan 20, 2025 use the old phasedown schedule
- **Never present the estimate without disclaimers** — every output must include language that this is for planning purposes only and should be reviewed by a tax professional

---

## 6. Disclaimers (Required on All Output)

The following language (or substantive equivalent) must appear on:
- The results dashboard
- The PDF report
- Any email/share output

> "This estimate is for preliminary planning purposes only and does not constitute a formal cost segregation study, tax advice, or legal advice. Actual results may vary based on property-specific characteristics, construction details, and applicable tax law. Consult a qualified tax professional before filing. This tool uses the RCNLD methodology and MACRS classification standards consistent with IRS guidance, but has not been reviewed by a licensed engineer or CPA for your specific property."
