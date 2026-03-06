# CostSegPro — Cost Segregation Estimator

A self-service cost segregation analysis tool that lets property owners get an instant depreciation acceleration estimate.

## Quick Start (Local)

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Deploy to Vercel (Free)

### Option A: GitHub + Vercel (recommended)

1. Push this repo to GitHub:
   ```bash
   git init
   git add .
   git commit -m "initial commit"
   gh repo create costseg-pro --public --push
   ```
   (Or create the repo on github.com and push manually)

2. Go to [vercel.com](https://vercel.com), sign in with GitHub

3. Click **"Add New Project"** → Import your `costseg-pro` repo

4. Vercel auto-detects Vite. Just click **Deploy**.

5. You'll get a URL like `costseg-pro.vercel.app` — share it with anyone.

### Option B: Vercel CLI (one command)

```bash
npx vercel
```

Follow the prompts. Done.

## Project Structure

```
costseg-pro/
├── index.html          # Entry HTML
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx        # React mount
    ├── App.jsx         # Main app with form wizard
    ├── engine.js       # Cost seg allocation engine
    ├── theme.js        # Colors, shared styles, formatters
    ├── components.jsx  # Reusable UI components
    ├── steps.jsx       # Form step components
    └── Results.jsx     # Results dashboard
```

## How the Allocation Engine Works

The engine uses a **template-based approach** with property-type-specific base allocation percentages, adjusted for:

- **Building age** — older buildings tend to have more reclassifiable components
- **Construction quality/grade** — higher-end finishes increase 5-year personal property
- **Property features** — pools, fencing, landscaping increase 15-year land improvements
- **Bonus depreciation** — applies the correct phase-down rate based on year placed in service

Base allocation profiles are calibrated against industry benchmarks and real cost segregation studies.

## Disclaimer

This tool provides **preliminary estimates for planning purposes only**. It is not a formal cost segregation study and should not be used for tax filing without professional review.

## Next Steps

- [ ] Add Stripe payment gate before results
- [ ] Generate downloadable PDF report
- [ ] Add lookback / Form 3115 mode
- [ ] CPA partnership review add-on
