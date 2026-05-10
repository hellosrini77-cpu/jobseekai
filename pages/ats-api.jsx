import Link from 'next/link';

export default function ATSApi() {
  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@300;400;500;600&display=swap');
        :root {
          --ink: #0f0f0e; --cream: #f5f0e8; --gold: #c9a84c; --gold-light: #e8c97a;
          --muted: #6b6559; --border: #e0d8c8; --white: #ffffff;
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'DM Sans', sans-serif; background: var(--cream); color: var(--ink); }

        .ats-hero { background: var(--ink); color: var(--cream); padding: 100px 64px; }
        .ats-hero-inner { max-width: 1100px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; }
        .eyebrow { font-size: 11px; letter-spacing: 2.5px; text-transform: uppercase; color: var(--gold); font-weight: 600; margin-bottom: 20px; }
        .ats-hero h1 { font-family: 'Playfair Display', serif; font-size: 52px; font-weight: 900; letter-spacing: -1.5px; line-height: 1.08; margin-bottom: 24px; }
        .ats-hero h1 em { font-style: italic; color: var(--gold); }
        .ats-hero p { color: #a09a8e; font-size: 17px; font-weight: 300; line-height: 1.7; margin-bottom: 40px; }
        .btn-gold { background: var(--gold); color: var(--ink); padding: 16px 36px; border-radius: 4px; font-size: 15px; font-weight: 600; text-decoration: none; display: inline-block; transition: opacity 0.2s; }
        .btn-gold:hover { opacity: 0.88; }
        .btn-outline { border: 1px solid #444; color: #a09a8e; padding: 16px 36px; border-radius: 4px; font-size: 15px; font-weight: 400; text-decoration: none; display: inline-block; margin-left: 12px; transition: border-color 0.2s; }
        .btn-outline:hover { border-color: #888; color: var(--cream); }

        .code-block { background: #0a0a09; border: 1px solid #2a2a28; border-radius: 12px; padding: 28px; font-family: 'Courier New', monospace; font-size: 12px; line-height: 1.8; color: #a09a8e; overflow: hidden; }
        .code-key { color: #c9a84c; }
        .code-val { color: #7ec8a4; }
        .code-str { color: #e8c97a; }
        .code-comment { color: #555; }

        .section { padding: 100px 64px; }
        .section-inner { max-width: 1100px; margin: 0 auto; }
        .section h2 { font-family: 'Playfair Display', serif; font-size: 44px; font-weight: 700; letter-spacing: -1px; color: var(--ink); margin-bottom: 16px; }
        .section p.lead { color: var(--muted); font-size: 17px; font-weight: 300; max-width: 560px; line-height: 1.6; margin-bottom: 56px; }

        .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; }
        .feature-card { background: var(--white); border: 1px solid var(--border); border-radius: 12px; padding: 32px; }
        .feature-icon { font-size: 28px; margin-bottom: 16px; }
        .feature-card h3 { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 700; color: var(--ink); margin-bottom: 10px; }
        .feature-card p { font-size: 14px; color: var(--muted); line-height: 1.7; font-weight: 300; }

        .pricing-section { background: var(--ink); color: var(--cream); padding: 100px 64px; }
        .pricing-inner { max-width: 900px; margin: 0 auto; text-align: center; }
        .pricing-inner h2 { font-family: 'Playfair Display', serif; font-size: 44px; font-weight: 700; letter-spacing: -1px; margin-bottom: 16px; }
        .pricing-inner p { color: #a09a8e; font-size: 17px; font-weight: 300; margin-bottom: 56px; }
        .pricing-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-bottom: 32px; }
        .pricing-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 36px 28px; text-align: left; }
        .pricing-card.featured { border-color: var(--gold); background: rgba(201,168,76,0.06); }
        .pricing-tier { font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: var(--gold); font-weight: 600; margin-bottom: 12px; }
        .pricing-volume { font-size: 13px; color: #7a7368; margin-bottom: 20px; }
        .pricing-rate { font-family: 'Playfair Display', serif; font-size: 40px; font-weight: 900; color: var(--cream); letter-spacing: -1px; margin-bottom: 4px; }
        .pricing-unit { font-size: 13px; color: #7a7368; margin-bottom: 24px; }
        .pricing-note { font-size: 13px; color: #a09a8e; line-height: 1.6; }

        .response-section { background: var(--cream); padding: 100px 64px; }
        .response-inner { max-width: 1100px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: start; }
        .response-inner h2 { font-family: 'Playfair Display', serif; font-size: 40px; font-weight: 700; letter-spacing: -1px; color: var(--ink); margin-bottom: 16px; }
        .response-inner p { color: var(--muted); font-size: 16px; font-weight: 300; line-height: 1.7; margin-bottom: 24px; }
        .score-pill { display: inline-flex; align-items: center; gap: 8px; background: var(--ink); color: var(--cream); padding: 8px 16px; border-radius: 100px; font-size: 13px; font-weight: 500; margin-bottom: 8px; }
        .score-badge { background: var(--gold); color: var(--ink); font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 100px; }

        .cta-section { background: var(--ink); padding: 100px 64px; text-align: center; }
        .cta-section h2 { font-family: 'Playfair Display', serif; font-size: 44px; font-weight: 700; letter-spacing: -1px; color: var(--cream); margin-bottom: 16px; }
        .cta-section p { color: #a09a8e; font-size: 17px; font-weight: 300; margin-bottom: 40px; max-width: 520px; margin-left: auto; margin-right: auto; }

        nav { background: var(--ink); padding: 20px 64px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #1e1e1c; }
        .nav-logo { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 900; color: var(--cream); text-decoration: none; letter-spacing: -0.5px; }
        .nav-logo span { color: var(--gold); }
        .nav-links { display: flex; gap: 32px; align-items: center; }
        .nav-links a { color: #a09a8e; font-size: 14px; text-decoration: none; transition: color 0.2s; }
        .nav-links a:hover { color: var(--cream); }

        footer { background: var(--ink); border-top: 1px solid #1e1e1c; padding: 32px 64px; display: flex; align-items: center; justify-content: space-between; }
        .footer-logo { font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 900; color: var(--cream); }
        .footer-logo span { color: var(--gold); }
        .footer-note { font-size: 12px; color: #555; }

        @media (max-width: 900px) {
          .ats-hero, .section, .pricing-section, .response-section, .cta-section { padding: 60px 24px; }
          .ats-hero-inner, .response-inner { grid-template-columns: 1fr; gap: 40px; }
          .ats-hero h1, .section h2, .pricing-inner h2, .cta-section h2 { font-size: 36px; }
          .features-grid, .pricing-grid { grid-template-columns: 1fr; }
          nav, footer { padding: 16px 24px; }
        }
      `}</style>

      {/* Nav */}
      <nav>
        <Link href="/" className="nav-logo">JobSeek<span>AI</span></Link>
        <div className="nav-links">
          <a href="/analyzer">Resume Analyzer</a>
          <a href="/tracker">Job Tracker</a>
          <a href="mailto:partnerships@jobseekai.co" style={{ color: 'var(--gold)', fontWeight: 600 }}>Request API Access →</a>
        </div>
      </nav>

      {/* Hero */}
      <div className="ats-hero">
        <div className="ats-hero-inner">
          <div>
            <div className="eyebrow">ATS Scoring API</div>
            <h1>Resume scoring,<br /><em>built into your platform.</em></h1>
            <p>Embed AI-powered resume-to-job match scoring directly into your ATS. One API call returns a score, dimension breakdown, missing skills, and a fit recommendation — ready to surface in your recruiter dashboard.</p>
            <a href="mailto:partnerships@jobseekai.co?subject=ATS API Pilot Request" className="btn-gold">Request Pilot Access</a>
            <a href="#docs" className="btn-outline">View API Spec</a>
          </div>
          <div className="code-block">
            <div><span className="code-comment">// POST /v1/score</span></div>
            <div>&nbsp;</div>
            <div>{'{'}</div>
            <div>&nbsp;&nbsp;<span className="code-key">"resume"</span>: {'{'}</div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;<span className="code-key">"raw_text"</span>: <span className="code-str">"..."</span></div>
            <div>&nbsp;&nbsp;{'}'}</div>
            <div>&nbsp;&nbsp;<span className="code-key">"job"</span>: {'{'}</div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;<span className="code-key">"title"</span>: <span className="code-str">"Senior Engineer"</span>,</div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;<span className="code-key">"required_skills"</span>: <span className="code-str">["Python", "AWS"]</span></div>
            <div>&nbsp;&nbsp;{'}'}</div>
            <div>{'}'}</div>
            <div>&nbsp;</div>
            <div><span className="code-comment">// Response</span></div>
            <div>{'{'}</div>
            <div>&nbsp;&nbsp;<span className="code-key">"score"</span>: <span className="code-val">82</span>,</div>
            <div>&nbsp;&nbsp;<span className="code-key">"recommendation"</span>: {'{'}</div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;<span className="code-key">"label"</span>: <span className="code-str">"possible_fit"</span>,</div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;<span className="code-key">"reason"</span>: <span className="code-str">"Strong match,</span></div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="code-str">one missing skill."</span></div>
            <div>&nbsp;&nbsp;{'}'}</div>
            <div>{'}'}</div>
          </div>
        </div>
      </div>

      {/* Features */}
      <section className="section" style={{ background: 'var(--cream)' }}>
        <div className="section-inner">
          <div className="eyebrow" style={{ color: 'var(--gold)' }}>What You Get</div>
          <h2>Everything your recruiters need in one response.</h2>
          <p className="lead">One API call. No model management. No infrastructure. Just scoring data your platform can surface instantly.</p>
          <div className="features-grid">
            {[
              { icon: '⚡', title: 'Match Score', desc: 'A single 0-100 score indicating how well the candidate matches the job requirements. Fast to display, easy to sort and filter.' },
              { icon: '📊', title: 'Dimension Breakdown', desc: 'Scores across skills match, experience match, education match, and keyword density — so recruiters understand why a score landed where it did.' },
              { icon: '🚩', title: 'Gap Flags', desc: 'Missing required skills, missing preferred skills, and red flags surfaced explicitly — no need for recruiters to cross-reference manually.' },
              { icon: '✅', title: 'Fit Recommendation', desc: 'Strong fit, possible fit, or not a fit — with a one-sentence reason. Gives recruiters a starting point without replacing their judgment.' },
              { icon: '📦', title: 'Batch Scoring', desc: 'Score up to 50 resumes against one job in a single API call. Ideal for bulk processing when a posting closes or a pipeline needs ranking.' },
              { icon: '🔒', title: 'Secure by Design', desc: 'API key authentication, no resume data retained after scoring, and response times under 500ms for single calls.' },
            ].map(f => (
              <div key={f.title} className="feature-card">
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Response preview */}
      <section className="response-section">
        <div className="response-inner">
          <div>
            <div className="eyebrow" style={{ color: 'var(--gold)' }}>Sample Output</div>
            <h2>Data your dashboard can use immediately.</h2>
            <p>The API response is structured for direct rendering. No post-processing required — score, breakdown, flags, and recommendation arrive ready to display.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div className="score-pill">Overall Score <span className="score-badge">82 / 100</span></div>
              <div className="score-pill" style={{ background: '#f5f0e8', color: 'var(--ink)' }}>Skills Match <span className="score-badge">88</span></div>
              <div className="score-pill" style={{ background: '#f5f0e8', color: 'var(--ink)' }}>Experience Match <span className="score-badge">79</span></div>
              <div className="score-pill" style={{ background: '#f5f0e8', color: 'var(--ink)' }}>Education Match <span className="score-badge">100</span></div>
              <div className="score-pill" style={{ background: '#fff3cd', color: '#856404' }}>Missing Skill <span style={{ fontSize: 12, fontWeight: 600 }}>AWS</span></div>
              <div className="score-pill" style={{ background: '#d4edda', color: '#155724' }}>Recommendation <span style={{ fontSize: 12, fontWeight: 600 }}>Possible Fit</span></div>
            </div>
          </div>
          <div className="code-block" style={{ background: '#0a0a09', border: '1px solid #2a2a28' }}>
            <div>{'{'}</div>
            <div>&nbsp;&nbsp;<span className="code-key">"score"</span>: <span className="code-val">82</span>,</div>
            <div>&nbsp;&nbsp;<span className="code-key">"breakdown"</span>: {'{'}</div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;<span className="code-key">"skills_match"</span>: <span className="code-val">88</span>,</div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;<span className="code-key">"experience_match"</span>: <span className="code-val">79</span>,</div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;<span className="code-key">"education_match"</span>: <span className="code-val">100</span>,</div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;<span className="code-key">"keyword_density"</span>: <span className="code-val">74</span></div>
            <div>&nbsp;&nbsp;{'}'},</div>
            <div>&nbsp;&nbsp;<span className="code-key">"flags"</span>: {'{'}</div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;<span className="code-key">"missing_required_skills"</span>: [<span className="code-str">"AWS"</span>],</div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;<span className="code-key">"gaps"</span>: [<span className="code-str">"No system design exp."</span>],</div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;<span className="code-key">"red_flags"</span>: []</div>
            <div>&nbsp;&nbsp;{'}'},</div>
            <div>&nbsp;&nbsp;<span className="code-key">"recommendation"</span>: {'{'}</div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;<span className="code-key">"label"</span>: <span className="code-str">"possible_fit"</span>,</div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;<span className="code-key">"reason"</span>: <span className="code-str">"Strong match,</span></div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="code-str">one missing skill."</span></div>
            <div>&nbsp;&nbsp;{'}'}</div>
            <div>{'}'}</div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="pricing-section" id="docs">
        <div className="pricing-inner">
          <div className="eyebrow">Pricing</div>
          <h2>Pay per call. No base fee.</h2>
          <p>Start a pilot at no cost. Pay only for what you use once you go live.</p>
          <div className="pricing-grid">
            <div className="pricing-card">
              <div className="pricing-tier">Starter</div>
              <div className="pricing-volume">0 – 10,000 calls/month</div>
              <div className="pricing-rate">$0.05</div>
              <div className="pricing-unit">per call</div>
              <div className="pricing-note">Perfect for pilot integrations and smaller ATS platforms processing under 10K applications monthly.</div>
            </div>
            <div className="pricing-card featured">
              <div className="pricing-tier">Growth</div>
              <div className="pricing-volume">10,001 – 100,000 calls/month</div>
              <div className="pricing-rate">$0.03</div>
              <div className="pricing-unit">per call</div>
              <div className="pricing-note">For mid-market ATS platforms with active job boards. Volume discount applied automatically.</div>
            </div>
            <div className="pricing-card">
              <div className="pricing-tier">Enterprise</div>
              <div className="pricing-volume">100,000+ calls/month</div>
              <div className="pricing-rate">Custom</div>
              <div className="pricing-unit">contact us</div>
              <div className="pricing-note">SLA guarantees, dedicated support, and procurement-friendly contracts for large-scale deployments.</div>
            </div>
          </div>
          <p style={{ fontSize: 13, color: '#555', marginBottom: 0 }}>Free pilot available. No commitment required to test the API with your data.</p>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="eyebrow">Get Started</div>
        <h2>Ready to add scoring<br />to your platform?</h2>
        <p>We work directly with ATS product teams on pilot integrations. Reach out and we will get you API credentials and a sandbox environment within 48 hours.</p>
        <a href="mailto:partnerships@jobseekai.co?subject=ATS API Pilot Request" className="btn-gold">Request Pilot Access →</a>
      </section>

      {/* Footer */}
      <footer>
        <div className="footer-logo">JobSeek<span>AI</span></div>
        <div className="footer-note">© 2026 JobSeekAI · partnerships@jobseekai.co</div>
      </footer>
    </>
  );
}
