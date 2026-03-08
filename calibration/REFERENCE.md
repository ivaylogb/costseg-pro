# CostSegPro — Calibration Data Reference

This folder contains real cost segregation studies used to calibrate and validate the CostSegPro engine. Claude Code should reference this file when working on engine logic, allocation profiles, unit costs, or renovation module features.

## Folder Structure

```
calibration/
├── REFERENCE.md              ← This file (start here)
├── studies/                  ← Original PDF reports (gitignored)
│   ├── purchase/             ← Full-property purchase studies
│   │   ├── stella_8222_calmont_purchase_2022.pdf
│   │   ├── cypress_edge_1565_ih35_purchase_2023.pdf
│   │   ├── queen_dr_3404_cedar_rapids_2024.pdf
│   │   ├── osprey_cove_south_2019.pdf
│   │   ├── 703_ridgewood_way_2021.pdf
│   │   ├── 56_cindy_ln_lot75_2023.pdf
│   │   ├── 121_frontier_way_2023.pdf
│   │   ├── 66_shellie_ln_2025.pdf
│   │   └── 235_countryhaven_rd.pdf
│   ├── renovation/           ← Renovation/improvement studies
│   │   ├── stella_8222_calmont_reno_2024.pdf
│   │   └── cypress_edge_1565_ih35_reno_2023.pdf
│   └── supplemental/         ← Excel, asset lists, supporting docs
│       ├── osprey_cove_south_asset_mgt_summary.xls
│       └── caleb_schroeder_2022.pdf
├── benchmarks/               ← Extracted structured data (tracked in git)
│   ├── allocation_profiles.json
│   ├── renovation_profiles.json
│   ├── unit_costs.json
│   └── component_mappings.json
└── reference/                ← Additional reference material
    └── irs_class_life_guide.md
```

## Study Inventory

### Purchase Studies (Engineering/RCN Method)

| ID | Property | Type | Location | Units | Basis | 5-Yr % | 7-Yr % | 15-Yr % | 27.5/39-Yr % | Firm | Year |
|----|----------|------|----------|-------|-------|--------|--------|---------|--------------|------|------|
| P1 | Stella (8222 Calmont Ave) | Apartment | Fort Worth, TX | 200 | $13,026,250 | 19.6% | — | 6.2% | 74.3% | Madison SPECS | 2022 |
| P2 | Cypress Edge (1565 N IH 35) | Apartment | New Braunfels, TX | 148 | $19,550,000 | 20.3% | — | 5.3% | 74.4% | Madison SPECS | 2023 |
| P3 | 3404 Queen Dr SW | Apartment | Cedar Rapids, IA | 96 | $5,206,904 | 24.3% | 0.6% | 4.7% | 70.5% | 1245 Consulting | 2024 |
| P4 | Osprey Cove South | Mixed (1BR/2BR + Church) | — | ~230 | $5,655,000 | 20.3% | — | 11.2% | 66.0%+2.2% | — | 2019 |
| P5 | 703 Ridgewood Way | SFR | — | 1 | TBD | TBD | TBD | TBD | TBD | — | 2021 |
| P6 | 56 Cindy Ln (Lot 75) | SFR | — | 1 | TBD | TBD | TBD | TBD | TBD | — | 2023 |
| P7 | 121 Frontier Way | SFR | — | 1 | TBD | TBD | TBD | TBD | TBD | — | 2023 |
| P8 | 66 Shellie Ln (Black Sheep Lodge) | SFR/STR | Wimberley, TX | 1 | TBD | TBD | TBD | TBD | TBD | — | 2025 |
| P9 | 235 Countryhaven Rd | SFR | — | 1 | TBD | TBD | TBD | TBD | TBD | — | — |

### Renovation Studies (Invoice/Actual Cost Method)

| ID | Property | Type | Location | Reno Basis | 5-Yr % | 15-Yr % | 27.5-Yr % | Firm | Year |
|----|----------|------|----------|-----------|--------|---------|-----------|------|------|
| R1 | Stella Phase II (8222 Calmont) | Apartment Reno | Fort Worth, TX | $1,395,459 | 36.7% | 2.8% | 60.5% | Madison SPECS | 2024 |
| R2 | Cypress Edge (1565 N IH 35) | Apartment Reno | New Braunfels, TX | $496,679 | 36.9% | 15.1% | 48.1% | Madison SPECS | 2023 |

## Key Calibration Findings

### Apartment Purchase Profiles (from P1, P2, P3, P4)

Median allocations for apartment complexes:
- **5-Year Personal Property: 20–24%**
- **15-Year Land Improvements: 5–11%**
- **27.5-Year Building: 66–74%**

The 5-yr allocation increases slightly for older buildings (P3 at 24.3% is a 1994 building) and properties with more extensive interior finishes. The 15-yr allocation varies significantly based on site improvements — Osprey Cove at 11.2% has pools, wells, wastewater treatment; Cypress Edge at 5.3% has simpler site work.

### Renovation Profiles (from R1, R2)

Renovation studies show dramatically different allocations because renovations are predominantly interior work:
- **5-Year Personal Property: 37%** (appliances, cabinets, countertops, flooring, lighting)
- **15-Year Land Improvements: 3–15%** (landscaping, signage; wide range depending on scope)
- **27.5-Year Building: 48–61%** (painting, HVAC, electrical, plumbing, roofing, general)

**Critical difference:** Renovation studies use the **invoice method** — actual costs are classified directly. No RCN, no historical multiplier, no obsolescence adjustment. Indirect costs (overhead) are still applied (R1 used 19%).

### Common 5-Year Components (Personal Property)

These items consistently appear across all studies as 5-year property:

| Component | Typical % of 5-Yr Bucket | RSMeans Reference Pattern |
|-----------|-------------------------|--------------------------|
| Appliances (residential) | 15–20% | 113013 series |
| Cabinetry | 15–20% | 123223 series |
| Flooring (carpet, LVT, vinyl, laminate) | 20–30% | 096xxx series |
| Countertops | 3–8% | 123623/123640 series |
| Decorative Lighting | 3–5% | 265113 series |
| Sink & Rough-in | 8–12% | 224116 series |
| Special Purpose Electrical | 8–10% | 260590 series |
| Ceiling Fans | 2–4% | 260590108362 |
| Wood Base/Moldings | 3–5% | 062213 series |
| Window Treatments | 1–3% | 122113 series |
| Closet Rod/Shelving | 2–3% | 105723 series |
| Cable/Telephone Systems | 1–2% | 260590104910/4920 |
| Mailboxes | <1% | 105523 series |
| Security/CCTV | <1% | 282313 series |
| Mirrors | 1–5% | 125413 series |
| Dryer Vent Kit | <1% | 113013257450 |
| FF&E/Furniture | <1% | 125xxx series |

### Common 15-Year Components (Land Improvements)

| Component | Typical % of 15-Yr Bucket | Notes |
|-----------|--------------------------|-------|
| Asphalt Paving | 25–40% | RSMeans 321216 |
| Landscaping | 15–30% | Seeding, sod, trees |
| Concrete Paving (sidewalks) | 8–15% | RSMeans 320610 |
| Fencing | 8–15% | Wood, chain link, decorative metal |
| Pool/Splash Pad | 2–8% | Gunite shell + equipment |
| Signage (monument) | 1–5% | Site signage only |
| Storm/Sanitary Sewer | 3–8% | Site-only piping |
| Parking Barriers/Markings | <2% | |
| Playground Equipment | <2% | |
| Retaining Walls | <2% | |
| Wheel Stops | <1% | |
| Site Lighting (poles/fixtures) | 2–5% | |
| Flagpoles | <1% | |

### Indirect Cost Rates Observed

| Study | Indirect Rate | Components |
|-------|--------------|------------|
| Stella Purchase (P1) | 25% | General Conditions 20% + A&E Fees 5% |
| Cypress Edge Purchase (P2) | 25% | General Conditions 20% + A&E Fees 5% |
| Stella Renovation (R1) | 19% | Combined |
| Queen Dr (P3) | ~1.4% | Minimal (allocation factor method) |

### Premium/Discount Factors Observed

This is the factor that reconciles RCN to actual depreciable basis:
- **Stella Purchase:** 90% (property depreciated — remaining useful life < total useful life)
- **Cypress Edge Purchase:** 115% (property value exceeds RCN — premium market)
- **Queen Dr:** ~101.4% (near parity)

### 7-Year Property

Rarely used. Only Queen Dr (P3) had 7-year items:
- Building-mounted lighting: $8,300
- Mailboxes: $20,687
- Total: 0.56% of basis

Most studies classify mailboxes and building lighting as 5-year. This is a firm-by-firm judgment call. Our engine should default to 5-year for these.

## Renovation Module Design Notes

### How Professional Renovation Studies Work

1. Client provides invoices/budget for all renovation work
2. Engineer classifies each invoice line item by MACRS class life
3. Indirect costs (contractor overhead, permits) are added as a percentage
4. No RCN calculation needed — actual costs are the basis
5. No obsolescence or premium/discount adjustments

### Renovation Categories for User Input

Based on R1 and R2, the standard renovation categories users should map their budget to:

**5-Year Personal Property:**
- Kitchen Appliances (fridge, oven, dishwasher, disposal, microwave, range hood)
- Cabinetry (kitchen and bath)
- Countertops
- Flooring (carpet, LVT, vinyl, laminate, wood)
- Decorative Lighting (fixtures, ceiling fans)
- Window Treatments (blinds, curtains)
- Mirrors
- FF&E / Furniture
- Washer/Dryer installations

**15-Year Land Improvements:**
- Landscaping
- Signage
- Paving / Parking lot work
- Fencing
- Pool / Outdoor amenities

**27.5-Year Building (residential) / 39-Year (commercial):**
- Interior/Exterior Painting
- HVAC replacement
- Electrical work
- Plumbing
- Roofing
- General construction / Framing
- Doors / Windows (structural)
- Exterior repairs

### Indirect Cost Rate for Renovations

Use **15–20%** as default for renovations with a general contractor. For self-managed renovations with subcontractors only, use **8–12%**. For DIY with materials only, use **0%**.

### Minimum Threshold

We set $10,000 as the minimum renovation cost to offer cost seg analysis. Below this, the tax savings don't justify the complexity.

## Engine Validation Targets

When testing the engine against these studies, target these accuracy ranges:

| Metric | Acceptable | Good | Excellent |
|--------|-----------|------|-----------|
| 5-Yr allocation % | ±5% | ±3% | ±2% |
| 15-Yr allocation % | ±4% | ±2% | ±1% |
| Total accelerated (5+15) | ±5% | ±3% | ±2% |
| Year 1 deduction | ±10% | ±5% | ±3% |

## Files That Could Not Be Parsed

The following PDFs could not be read by pdfplumber (likely scanned/image PDFs or corrupted):
- `MS412899_01_Madison_SPECS_Cost_Segregation_Study_Caleb_Schroeder_Final_Report_5_2022.pdf`
- `Osprey_Cove_South.pdf`
- `235_Countryhaven_Rd_Update1.pdf`

These may need OCR processing or manual data entry. The Osprey Cove XLS file was readable and data is included above.

## SFR Studies Still Need Extraction

Studies P5–P9 (Ridgewood Way, Cindy Ln, Frontier Way, Shellie Ln, Countryhaven Rd) are SFR properties that need their allocation data extracted and added to this reference. Some may be in the unparseable PDFs above.
