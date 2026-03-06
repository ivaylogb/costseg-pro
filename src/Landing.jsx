import { useState } from 'react';

export default function Landing() {
  return (
    <div style={{ fontFamily: "'DM Sans', -apple-system, sans-serif", color: '#1A1917', background: '#FAFAF8', WebkitFontSmoothing: 'antialiased' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Instrument+Serif:ital@0;1&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { line-height: 1.6; }
        .csp-container { max-width: 1120px; margin: 0 auto; padding: 0 28px; }
        .csp-btn {
          display: inline-flex; align-items: center; justify-content: center;
          padding: 12px 24px; border-radius: 10px; font-weight: 700;
          font-size: 14px; text-decoration: none; cursor: pointer;
          border: none; font-family: inherit; transition: all 0.2s;
        }
        .csp-btn-primary { background: #1A7F5A; color: white; box-shadow: 0 2px 12px rgba(26,127,90,0.25); }
        .csp-btn-primary:hover { background: #145F44; box-shadow: 0 4px 20px rgba(26,127,90,0.35); transform: translateY(-1px); }
        .csp-btn-outline { background: transparent; color: #1A1917; border: 1.5px solid #E4E2DD; }
        .csp-btn-outline:hover { border-color: #1A1917; }
        .csp-btn-large { padding: 16px 36px; font-size: 16px; border-radius: 12px; }
        .csp-section-label { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #1A7F5A; margin-bottom: 16px; }
        @keyframes cspPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes cspFadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        .csp-animate { opacity: 0; animation: cspFadeUp 0.6s ease forwards; }
        .csp-d1 { animation-delay: 0.1s; } .csp-d2 { animation-delay: 0.2s; }
        .csp-d3 { animation-delay: 0.3s; } .csp-d4 { animation-delay: 0.4s; } .csp-d5 { animation-delay: 0.5s; }
        @media (max-width: 768px) {
          .csp-hero-h1 { font-size: 36px !important; }
          .csp-hero-stats { flex-direction: column !important; gap: 24px !important; }
          .csp-grid-2, .csp-grid-3 { grid-template-columns: 1fr !important; }
          .csp-nav-link-text { display: none !important; }
          .csp-hero-ctas { flex-direction: column !important; align-items: stretch !important; }
          .csp-hero-ctas .csp-btn { text-align: center; }
        }
      `}</style>

      {/* NAV */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(250,250,248,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid #EDEBE7', padding: '16px 0' }}>
        <div className="csp-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: '#1A1917' }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: 'linear-gradient(135deg, #1A7F5A, #145F44)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, color: 'white' }}>CS</div>
            <div style={{ fontWeight: 700, fontSize: 17, letterSpacing: '-0.03em' }}>CostSeg<span style={{ color: '#1A7F5A' }}>Pro</span></div>
          </a>
          <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
            <a className="csp-nav-link-text" href="#how" style={{ textDecoration: 'none', color: '#5C5A54', fontSize: 14, fontWeight: 500 }}>How It Works</a>
            <a className="csp-nav-link-text" href="#example" style={{ textDecoration: 'none', color: '#5C5A54', fontSize: 14, fontWeight: 500 }}>Example</a>
            <a className="csp-nav-link-text" href="#faq" style={{ textDecoration: 'none', color: '#5C5A54', fontSize: 14, fontWeight: 500 }}>FAQ</a>
            <a href="#/app" className="csp-btn csp-btn-primary">Get Your Estimate →</a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ padding: '100px 0 80px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -200, right: -200, width: 600, height: 600, background: 'radial-gradient(circle, rgba(26,127,90,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div className="csp-container">
          <div style={{ maxWidth: 720 }}>
            <div className="csp-animate" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px 6px 8px', borderRadius: 100, background: '#E8F5EE', color: '#1A7F5A', fontSize: 13, fontWeight: 600, marginBottom: 28, border: '1px solid rgba(26,127,90,0.15)' }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#1A7F5A', animation: 'cspPulse 2s ease-in-out infinite' }} />
              Takes less than 2 minutes
            </div>
            <h1 className="csp-animate csp-d1 csp-hero-h1" style={{ fontFamily: "'Instrument Serif', serif", fontSize: 'clamp(42px, 6vw, 68px)', lineHeight: 1.08, letterSpacing: '-0.03em', fontWeight: 400, marginBottom: 24 }}>
              Stop overpaying taxes on your <em style={{ fontStyle: 'italic', color: '#1A7F5A' }}>rental property</em>
            </h1>
            <p className="csp-animate csp-d2" style={{ fontSize: 19, lineHeight: 1.65, color: '#5C5A54', maxWidth: 560, marginBottom: 40 }}>
              Cost segregation accelerates your depreciation deductions, putting thousands back in your pocket in year one. Get an instant estimate — no engineers, no site visits, no six-week wait.
            </p>
            <div className="csp-animate csp-d3 csp-hero-ctas" style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
              <a href="#/app" className="csp-btn csp-btn-primary csp-btn-large">Get Your Free Estimate →</a>
              <a href="#how" className="csp-btn csp-btn-outline csp-btn-large">See How It Works</a>
            </div>
            <p className="csp-animate csp-d4" style={{ marginTop: 20, fontSize: 13, color: '#8A877F' }}>No credit card required for your initial estimate</p>
          </div>
          <div className="csp-animate csp-d5 csp-hero-stats" style={{ display: 'flex', gap: 48, marginTop: 72, paddingTop: 40, borderTop: '1px solid #EDEBE7' }}>
            {[['$18,400', 'Average first-year\ntax savings'], ['2 min', 'Time to get\nyour estimate'], ['93%', 'Less expensive than\ntraditional studies']].map(([val, label], i) => (
              <div key={i}>
                <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 36, letterSpacing: '-0.02em' }}>{val}</div>
                <div style={{ fontSize: 13, color: '#8A877F', marginTop: 4, whiteSpace: 'pre-line', lineHeight: 1.4 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROBLEM / SOLUTION */}
      <section style={{ padding: '80px 0', background: '#FFFFFF', borderTop: '1px solid #EDEBE7', borderBottom: '1px solid #EDEBE7' }}>
        <div className="csp-container">
          <div className="csp-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'start' }}>
            <div>
              <div className="csp-section-label">The Problem</div>
              <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 38, letterSpacing: '-0.02em', lineHeight: 1.15, marginBottom: 20, fontWeight: 400 }}>You're depreciating your property too slowly</h2>
              <p style={{ color: '#5C5A54', fontSize: 16, lineHeight: 1.7 }}>When you buy a rental property, the IRS makes you depreciate the entire building over 27.5 or 39 years. But a significant portion — cabinets, flooring, landscaping, appliances, lighting — qualifies for 5 or 15-year accelerated depreciation.</p>
              <p style={{ color: '#5C5A54', fontSize: 16, lineHeight: 1.7, marginTop: 16 }}>A cost segregation study reclassifies these components, front-loading your deductions. The problem? Traditional studies cost $5,000–$15,000 and take weeks.</p>
              <p style={{ color: '#5C5A54', fontSize: 16, lineHeight: 1.7, marginTop: 16 }}><strong style={{ color: '#1A1917' }}>CostSegPro changes that.</strong> Same RCNLD methodology and IRS-accepted framework, delivered instantly at a fraction of the cost.</p>
            </div>
            <div style={{ padding: 32, borderRadius: 16, border: '1px solid #E4E2DD', background: '#FAFAF8' }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20 }}>⚡ Traditional Study vs. CostSegPro</h3>
              {[['Cost', '$5,000–$15,000', '$199'], ['Timeline', '4–8 weeks', '2 minutes'], ['Site visit required', 'Yes', 'No'], ['Engineering firm needed', 'Yes', 'No'], ['Works under $1M', 'Rarely', 'Always']].map(([label, old, nw], i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < 4 ? '1px solid #EDEBE7' : 'none', fontSize: 14 }}>
                  <span style={{ color: '#5C5A54' }}>{label}</span>
                  <span><span style={{ color: '#8A877F', textDecoration: 'line-through' }}>{old}</span>&nbsp;&nbsp;<span style={{ color: '#1A7F5A', fontWeight: 700 }}>{nw}</span></span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" style={{ padding: '100px 0' }}>
        <div className="csp-container">
          <div style={{ textAlign: 'center', maxWidth: 560, margin: '0 auto 64px' }}>
            <div className="csp-section-label">How It Works</div>
            <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 42, letterSpacing: '-0.02em', fontWeight: 400, marginBottom: 12 }}>Three steps to your tax savings estimate</h2>
            <p style={{ fontSize: 17, color: '#5C5A54' }}>No tax expertise required. Just answer a few questions about your property.</p>
          </div>
          <div className="csp-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {[['1', 'Describe your property', 'Property type, purchase price, year built, building grade, and key features like flooring and appliances.', '~60 seconds'],
              ['2', 'We run the analysis', 'Our engine allocates your purchase price across IRS asset classes using construction cost benchmarks and MACRS classification rules.', 'Instant'],
              ['3', 'Get your savings estimate', 'Estimated tax savings, full component breakdown, depreciation comparison, and bonus depreciation analysis.', 'Detailed report']
            ].map(([num, title, desc, time], i) => (
              <div key={i} style={{ padding: '36px 32px', borderRadius: 16, border: '1px solid #E4E2DD', background: '#FFFFFF', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#1A7F5A'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 40px rgba(26,127,90,0.08)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#E4E2DD'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: '#E8F5EE', color: '#1A7F5A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 15, marginBottom: 20 }}>{num}</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>{title}</h3>
                <p style={{ fontSize: 15, color: '#5C5A54', lineHeight: 1.6 }}>{desc}</p>
                <div style={{ marginTop: 16, fontSize: 12, fontWeight: 600, color: '#8A877F', textTransform: 'uppercase', letterSpacing: '0.05em' }}>⏱ {time}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REAL EXAMPLE */}
      <section id="example" style={{ padding: '80px 0', background: '#1B2A4A', color: 'white' }}>
        <div className="csp-container">
          <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.5)', marginBottom: 16 }}>Real Example</div>
          <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 38, letterSpacing: '-0.02em', fontWeight: 400, marginBottom: 48, maxWidth: 500 }}>A $590,000 rental property in Encinitas, CA</h2>
          <div className="csp-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
            <div style={{ padding: 32, borderRadius: 16, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 20, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Without Cost Segregation</h3>
              {[['Depreciable basis', '$565,000'], ['Annual depreciation', '$20,545'], ['Year 1 tax savings', '$7,602'], ['Method', '27.5-year straight line']].map(([l, v], i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.08)' : 'none', fontSize: 15 }}>
                  <span style={{ color: 'rgba(255,255,255,0.6)' }}>{l}</span><span style={{ fontWeight: 600 }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ padding: 32, borderRadius: 16, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 20, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>With Cost Segregation</h3>
              {[['5-year property identified', '$214,701', false], ['Reclassified', '38% of basis', true], ['Year 1 deduction (with bonus)', '$227,442', true]].map(([l, v, green], i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.08)' : 'none', fontSize: 15 }}>
                  <span style={{ color: 'rgba(255,255,255,0.6)' }}>{l}</span><span style={{ fontWeight: 600, color: green ? '#5BDFAA' : 'white' }}>{v}</span>
                </div>
              ))}
              <div style={{ marginTop: 24, padding: 20, borderRadius: 12, background: 'rgba(26,127,90,0.2)', border: '1px solid rgba(26,127,90,0.3)', textAlign: 'center' }}>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Additional Year 1 Tax Savings</div>
                <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 42, color: '#5BDFAA', marginTop: 4 }}>$79,453</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHO IT'S FOR */}
      <section style={{ padding: '100px 0' }}>
        <div className="csp-container">
          <div className="csp-section-label" style={{ textAlign: 'center' }}>Who It's For</div>
          <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 42, letterSpacing: '-0.02em', fontWeight: 400, textAlign: 'center', marginBottom: 48 }}>Built for investors who want to keep more of what they earn</h2>
          <div className="csp-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {[['🏠', 'Rental property owners', "Own a single-family rental, duplex, or small multifamily? Cost seg isn't just for big commercial buildings. Properties as low as $200K can benefit."],
              ['📊', 'Portfolio investors', 'Run cost seg on every acquisition to maximize first-year deductions across your portfolio. Stack savings across multiple properties.'],
              ['🤝', 'CPAs & tax advisors', 'Give your clients a fast, affordable cost seg option. Use our estimates as a screening tool to identify which properties warrant a full study.']
            ].map(([icon, title, desc], i) => (
              <div key={i} style={{ padding: 32, borderRadius: 16, border: '1px solid #E4E2DD', background: '#FFFFFF' }}>
                <div style={{ fontSize: 28, marginBottom: 16 }}>{icon}</div>
                <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>{title}</h3>
                <p style={{ fontSize: 14, color: '#5C5A54', lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <FaqSection />

      {/* FINAL CTA */}
      <section style={{ padding: '100px 0', textAlign: 'center' }}>
        <div className="csp-container">
          <div className="csp-section-label">Ready?</div>
          <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 48, letterSpacing: '-0.02em', fontWeight: 400, marginBottom: 16, maxWidth: 600, marginLeft: 'auto', marginRight: 'auto' }}>
            Find out how much you're <em style={{ fontStyle: 'italic', color: '#1A7F5A' }}>overpaying</em> in taxes
          </h2>
          <p style={{ fontSize: 18, color: '#5C5A54', marginBottom: 36, maxWidth: 480, marginLeft: 'auto', marginRight: 'auto' }}>It takes 2 minutes. No credit card. No commitments. Just answers.</p>
          <a href="#/app" className="csp-btn csp-btn-primary csp-btn-large">Get Your Free Estimate →</a>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: '40px 0', borderTop: '1px solid #EDEBE7', color: '#8A877F', fontSize: 13 }}>
        <div className="csp-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>&copy; 2026 CostSegPro. Not tax advice — consult your CPA.</div>
          <div style={{ display: 'flex', gap: 24 }}>
            <a href="#" style={{ color: '#5C5A54', textDecoration: 'none' }}>Privacy</a>
            <a href="#" style={{ color: '#5C5A54', textDecoration: 'none' }}>Terms</a>
            <a href="mailto:hello@costsegpro.com" style={{ color: '#5C5A54', textDecoration: 'none' }}>Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FaqSection() {
  const [openIndex, setOpenIndex] = useState(0);
  const faqs = [
    ['What is cost segregation?', 'Cost segregation is a tax strategy that reclassifies components of a building from long-life property (27.5 or 39 years) to shorter-life categories (5, 7, or 15 years). This accelerates your depreciation deductions, reducing your taxable income in the early years of ownership.'],
    ['Is this a formal cost segregation study?', "No. CostSegPro provides a preliminary estimate based on industry benchmarks, construction cost data, and IRS classification rules. It's designed for planning and decision-making. Many property owners find our estimate sufficient for their CPA, especially for smaller residential properties."],
    ['What properties qualify?', 'Any depreciable property — residential rentals, commercial buildings, multifamily, retail, industrial, restaurants, and hotels. The property must be used for business or investment purposes (not your primary residence).'],
    ['I already own the property — is it too late?', 'Not at all. You can file a "catch-up" deduction using IRS Form 3115 (Change in Accounting Method). This lets you claim all missed accelerated depreciation in a single year — no need to amend prior returns.'],
    ['What about bonus depreciation phasing down?', 'Bonus depreciation was 100% for 2020–2022 and is phasing down: 80% (2023), 60% (2024), 40% (2025), 20% (2026), 0% (2027). Even without it, cost segregation still accelerates deductions over 5 and 15-year recovery periods.'],
    ['How accurate is the estimate?', 'Our estimates typically fall within 10–15% of a full engineering study for residential properties. The main difference is a full study includes a physical site inspection and component-by-component costing.'],
    ['Will this hold up in an IRS audit?', 'Our estimate is a planning tool and may need supplementation for audit purposes. For properties under $1M, many CPAs find our component breakdown sufficient. For larger properties, use our estimate to determine if a full study is justified.'],
  ];
  return (
    <section id="faq" style={{ padding: '100px 0', background: '#FFFFFF', borderTop: '1px solid #EDEBE7' }}>
      <div className="csp-container">
        <div className="csp-section-label" style={{ textAlign: 'center' }}>Frequently Asked Questions</div>
        <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 42, letterSpacing: '-0.02em', fontWeight: 400, textAlign: 'center', marginBottom: 48 }}>Common questions about cost segregation</h2>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          {faqs.map(([q, a], i) => (
            <div key={i} style={{ borderBottom: '1px solid #EDEBE7', padding: '24px 0' }}>
              <div onClick={() => setOpenIndex(openIndex === i ? -1 : i)} style={{ fontSize: 17, fontWeight: 700, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {q}
                <button style={{ width: 28, height: 28, borderRadius: '50%', border: `1.5px solid ${openIndex === i ? '#1A7F5A' : '#E4E2DD'}`, background: openIndex === i ? '#E8F5EE' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: openIndex === i ? '#1A7F5A' : '#8A877F', cursor: 'pointer', flexShrink: 0, fontFamily: 'inherit' }}>
                  {openIndex === i ? '−' : '+'}
                </button>
              </div>
              {openIndex === i && <div style={{ marginTop: 12, fontSize: 15, color: '#5C5A54', lineHeight: 1.7 }}>{a}</div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
