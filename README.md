# CostSegPro — Cost Segregation Analysis Tool

A self-service cost segregation analysis tool that generates professional, defensible depreciation acceleration estimates with downloadable PDF reports backed by unit-cost data.

**Live:** [costseg-pro.vercel.app](https://costseg-pro.vercel.app)

## Features

- **4-step form wizard** — property type, purchase details, building characteristics, review
- **STR / transient basis detection** — automatically applies 39-year building life for short-term rentals per IRC 168(e)(2)(A)(ii)
- **Unit-cost-backed component breakdowns** — every line item shows estimated quantity x unit cost, sourced from RSMeans, Marshall & Swift, and Craftsman cost data
- **Advanced inputs** — flooring type, renovation status, deck/porch, pool type scaling (collapsible panel, not required)
- **Downloadable PDF report** — professional multi-page document with cover page, allocation summary, detailed component schedules, methodology, tax authority references, and disclaimer
- **Input validation** — field-level error messages, range checking, soft warnings for unusual inputs
- **Share with CPA** — one-click email with summary of results
- **Responsive** — works on mobile and desktop

## Allocation Engine

The engine uses property-type-specific base allocation profiles adjusted for:

- **Building age** — wider range (0.88-1.22x) calibrated against 6 real engineering-based studies
- **Construction grade** — economy through luxury multipliers
- **Flooring composition** — removable flooring (LVT, laminate, carpet) vs. structural tile/stone
- **Renovation status** — recently renovated properties get a boost for newer 5-year components
- **Property features** — pools (scaled by type), decks, hot tubs, fireplaces, game rooms
- **Furnished status** — separate component profiles for furnished vs. unfurnished
- **Bonus depreciation** — correct phase-down schedule (100% through 2022, 80%/60%/40%/20%/0%)

Component breakdowns are backed by a unit-cost reference table with quantity heuristics derived from property inputs (bedrooms, bathrooms, square footage) and per-unit costs from published construction cost references.

## Quick Start

```
npm install
npm run dev
```

Open http://localhost:5173

## Deploy to Vercel

Push to GitHub and connect via [vercel.com](https://vercel.com), or:

```
npx vercel --prod
```

## Project Structure

```
costseg-pro/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx           # React mount + hash router
    ├── App.jsx            # Form wizard with validation
    ├── Landing.jsx        # Marketing landing page
    ├── engine.js          # Cost seg allocation engine
    ├── unitCosts.js       # Unit cost reference table & quantity heuristics
    ├── validation.js      # Input validation & warnings
    ├── pdfReport.js       # PDF report generator (jsPDF)
    ├── theme.js           # Colors, shared styles, formatters
    ├── components.jsx     # Reusable UI components
    ├── steps.jsx          # Form step components
    └── Results.jsx        # Results dashboard
```

## Calibration Data

The engine and unit cost table are calibrated against 6 completed engineering-based cost segregation studies spanning:

- Furnished and unfurnished single-family rentals
- Short-term rental condos (39-year nonresidential classification)
- Properties with pools, hot tubs, fireplaces, decks
- Price ranges from $569K to $1.28M
- Studies by Madison SPECS, Cost Seg EZ, and Cost Segregation Specialists

## Tax Authority References

- IRC 1245 / 1250 — Personal property vs. real property classification
- IRC 168(k) — Bonus depreciation
- IRC 168(e)(2)(A)(ii) — Transient basis / STR classification
- Revenue Procedure 87-56 — Asset class lives and recovery periods
- Reg. Sec. 1.48-1(c) and (e) — Tangible personal property tests
- Whiteco Industries v. Commissioner (1975) — Permanency test
- Hospital Corporation of America v. Commissioner (1997) — Functional use test

## Disclaimer

This tool provides **preliminary estimates for planning purposes only**. It is not a formal cost segregation study and should not be used for tax filing without professional review.

## Roadmap

- Stripe payment gate before results / PDF download
- Multi-year depreciation schedule (years 1-5+)
- Form 3115 lookback mode for prior-year properties
- CPA partnership review add-on
- Commercial property calibration (office, retail, industrial)
