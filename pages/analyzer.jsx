import { useState, useRef } from 'react';

const scoreColor = (score) => {
  if (score >= 75) return '#2d6a4f';
  if (score >= 50) return '#856404';
  return '#c0392b';
};

const scoreBg = (score) => {
  if (score >= 75) return '#d1e7dd';
  if (score >= 50) return '#fff3cd';
  return '#fde8e8';
};

const scoreLabel = (score) => {
  if (score >= 75) return 'Strong Match';
  if (score >= 50) return 'Needs Work';
  return 'At Risk';
};

export default function Analyzer() {
  const [resumeFile, setResumeFile] = useState(null);
  const [jd, setJd] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState('keywords');
  const [expandedBullet, setExpandedBullet] = useState(null);
  const [expandedMissing, setExpandedMissing] = useState(null);
  const [copiedBullet, setCopiedBullet] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setResumeFile(file);
      setError(null);
    } else {
      setError('Please upload a PDF file.');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      setResumeFile(file);
      setError(null);
    } else {
      setError('Please upload a PDF file.');
    }
  };

  const handleAnalyze = async () => {
    if (!resumeFile) { setError('Please upload your resume PDF.'); return; }
    if (!jd.trim()) { setError('Please paste the job description.'); return; }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('resume', resumeFile);
      formData.append('jd', jd);

      const res = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Analysis failed');

      setResult(data);
      setActiveSection('keywords');
      setExpandedBullet(null);
      setExpandedMissing(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyBullet = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedBullet(id);
    setTimeout(() => setCopiedBullet(null), 2000);
  };

  const SECTIONS = ['keywords', 'rewrites', 'formatting', 'title'];
  const sectionLabels = {
    keywords: 'Keywords',
    rewrites: 'Bullet Rewrites',
    formatting: 'Formatting',
    title: 'Title & Summary'
  };

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@300;400;500;600&display=swap');

        :root {
          --ink: #0f0f0e;
          --cream: #f5f0e8;
          --gold: #c9a84c;
          --gold-light: #e8c97a;
          --muted: #6b6559;
          --border: #e0d8c8;
          --white: #ffffff;
          --red: #c0392b;
          --green: #2d6a4f;
          --amber: #856404;
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'DM Sans', sans-serif; background: var(--cream); color: var(--ink); min-height: 100vh; }

        nav {
          display: flex; justify-content: space-between; align-items: center;
          padding: 18px 48px; border-bottom: 1px solid var(--border);
          background: var(--cream); position: sticky; top: 0; z-index: 100;
        }
        .logo { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 700; text-decoration: none; color: var(--ink); letter-spacing: -0.5px; }
        .logo span { color: var(--gold); }
        .nav-tag { font-size: 11px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; color: var(--muted); }

        .page { max-width: 1100px; margin: 0 auto; padding: 48px 48px 80px; }

        .page-header { margin-bottom: 40px; }
        .page-eyebrow { font-size: 11px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; color: var(--gold); margin-bottom: 10px; }
        .page-title { font-family: 'Playfair Display', serif; font-size: 40px; font-weight: 900; letter-spacing: -1px; margin-bottom: 10px; }
        .page-sub { color: var(--muted); font-size: 16px; font-weight: 300; max-width: 560px; line-height: 1.6; }

        /* INPUT SECTION */
        .input-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 28px; }

        .input-card {
          background: var(--white);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 28px;
        }
        .input-label { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px; color: var(--muted); margin-bottom: 14px; display: block; }

        .drop-zone {
          border: 2px dashed var(--border);
          border-radius: 8px;
          padding: 40px 24px;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s;
          background: #faf7f2;
        }
        .drop-zone:hover, .drop-zone.dragover { border-color: var(--gold); background: #fdf8ee; }
        .drop-zone.has-file { border-color: var(--green); background: #f0f7ef; border-style: solid; }
        .drop-icon { font-size: 32px; margin-bottom: 12px; }
        .drop-text { font-size: 14px; color: var(--muted); font-weight: 300; line-height: 1.5; }
        .drop-text strong { color: var(--ink); font-weight: 600; display: block; margin-bottom: 4px; font-size: 15px; }
        .drop-text.success strong { color: var(--green); }
        .drop-hint { font-size: 11px; color: var(--muted); margin-top: 8px; }

        .jd-textarea {
          width: 100%;
          height: 200px;
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 14px 16px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          line-height: 1.6;
          color: var(--ink);
          background: #faf7f2;
          resize: vertical;
          transition: border-color 0.2s;
          outline: none;
        }
        .jd-textarea:focus { border-color: var(--gold); background: var(--white); }
        .jd-textarea::placeholder { color: #b0a898; }
        .jd-count { font-size: 11px; color: var(--muted); margin-top: 6px; text-align: right; }

        .analyze-btn {
          width: 100%;
          background: var(--ink);
          color: var(--cream);
          border: none;
          border-radius: 8px;
          padding: 18px;
          font-size: 16px;
          font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }
        .analyze-btn:hover:not(:disabled) { background: #2a2a28; }
        .analyze-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .error-box {
          background: #fde8e8;
          border: 1px solid #f5c6c6;
          border-radius: 8px;
          padding: 14px 18px;
          font-size: 14px;
          color: var(--red);
          margin-bottom: 20px;
          font-weight: 500;
        }

        /* LOADING */
        .loading-state {
          text-align: center;
          padding: 60px 40px;
          background: var(--white);
          border: 1px solid var(--border);
          border-radius: 12px;
        }
        .loading-spinner {
          width: 48px; height: 48px;
          border: 3px solid var(--border);
          border-top-color: var(--gold);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin: 0 auto 20px;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .loading-text { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 700; margin-bottom: 8px; }
        .loading-sub { color: var(--muted); font-size: 14px; font-weight: 300; }

        /* RESULTS */
        .results { animation: fadeUp 0.5s ease both; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }

        .score-banner {
          background: var(--white);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 36px 40px;
          margin-bottom: 24px;
          display: grid;
          grid-template-columns: auto 1fr auto;
          gap: 40px;
          align-items: center;
        }
        .score-circle {
          width: 110px; height: 110px;
          border-radius: 50%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border: 4px solid;
          flex-shrink: 0;
        }
        .score-num { font-family: 'Playfair Display', serif; font-size: 38px; font-weight: 900; line-height: 1; }
        .score-pct { font-size: 13px; font-weight: 600; margin-top: 2px; }
        .score-label-badge { font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 20px; display: inline-block; margin-bottom: 10px; }
        .verdict-text { font-size: 16px; line-height: 1.6; color: var(--ink); font-weight: 300; margin-bottom: 16px; }
        .priorities { display: flex; flex-direction: column; gap: 8px; }
        .priority-item {
          display: flex; align-items: flex-start; gap: 10px;
          font-size: 13px; color: var(--ink); line-height: 1.5;
        }
        .priority-num {
          width: 22px; height: 22px; border-radius: 50%;
          background: var(--gold); color: var(--ink);
          font-size: 11px; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; margin-top: 1px;
        }

        /* SCORE BREAKDOWN */
        .breakdown-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 24px;
        }
        .breakdown-card {
          background: var(--white);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 16px 18px;
        }
        .bd-label { font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: var(--muted); font-weight: 500; margin-bottom: 8px; }
        .bd-score { font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 700; line-height: 1; margin-bottom: 4px; }
        .bd-max { font-size: 11px; color: var(--muted); }
        .bd-bar-track { height: 4px; background: var(--border); border-radius: 2px; overflow: hidden; margin-top: 8px; }
        .bd-bar-fill { height: 100%; border-radius: 2px; background: linear-gradient(90deg, var(--gold), var(--gold-light)); }

        /* SECTION TABS */
        .section-tabs {
          display: flex;
          gap: 0;
          background: var(--white);
          border: 1px solid var(--border);
          border-radius: 10px;
          overflow: hidden;
          margin-bottom: 20px;
        }
        .section-tab {
          flex: 1;
          padding: 14px 10px;
          font-size: 13px;
          font-weight: 500;
          color: var(--muted);
          background: none;
          border: none;
          border-right: 1px solid var(--border);
          cursor: pointer;
          transition: all 0.15s;
          font-family: 'DM Sans', sans-serif;
          text-align: center;
        }
        .section-tab:last-child { border-right: none; }
        .section-tab:hover { background: #faf7f2; color: var(--ink); }
        .section-tab.active { background: var(--ink); color: var(--cream); font-weight: 600; }

        /* CONTENT CARDS */
        .content-card {
          background: var(--white);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 32px;
          animation: fadeUp 0.3s ease both;
        }
        .content-title { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 700; margin-bottom: 20px; letter-spacing: -0.3px; }

        /* KEYWORDS */
        .keyword-section { margin-bottom: 28px; }
        .kw-section-label { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px; color: var(--muted); margin-bottom: 12px; }
        .keyword-chips { display: flex; flex-wrap: wrap; gap: 8px; }
        .kw-chip {
          font-size: 12px; font-weight: 600;
          padding: 5px 12px; border-radius: 20px;
        }
        .kw-chip.present { background: #d1e7dd; color: var(--green); }
        .kw-chip.missing-required { background: #fde8e8; color: var(--red); }
        .kw-chip.missing-preferred { background: #fff3cd; color: var(--amber); }

        .missing-list { display: flex; flex-direction: column; gap: 10px; margin-top: 12px; }
        .missing-item {
          border: 1px solid var(--border);
          border-radius: 8px;
          overflow: hidden;
          cursor: pointer;
          transition: box-shadow 0.15s;
        }
        .missing-item:hover { box-shadow: 0 3px 12px rgba(0,0,0,0.07); }
        .missing-header {
          padding: 12px 16px;
          display: flex; justify-content: space-between; align-items: center;
        }
        .missing-keyword { font-size: 14px; font-weight: 600; }
        .missing-body {
          padding: 12px 16px;
          border-top: 1px solid var(--border);
          background: #fdfaf5;
          font-size: 13px;
          line-height: 1.6;
          color: #3a3530;
        }
        .imp-badge {
          font-size: 11px; font-weight: 700;
          padding: 3px 10px; border-radius: 20px;
          text-transform: uppercase; letter-spacing: 0.5px;
        }

        /* BULLET REWRITES */
        .bullet-list { display: flex; flex-direction: column; gap: 14px; }
        .bullet-item {
          border: 1px solid var(--border);
          border-radius: 8px;
          overflow: hidden;
          cursor: pointer;
          transition: box-shadow 0.15s;
        }
        .bullet-item:hover { box-shadow: 0 3px 12px rgba(0,0,0,0.07); }
        .bullet-header {
          padding: 14px 16px;
          background: #faf7f2;
          font-size: 13px;
          color: var(--muted);
          line-height: 1.5;
          font-style: italic;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
        }
        .bullet-toggle { font-size: 16px; flex-shrink: 0; color: var(--muted); }
        .bullet-body { padding: 16px; border-top: 1px solid var(--border); }
        .bullet-sec-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px; color: var(--muted); margin-bottom: 8px; }
        .bullet-rewrite {
          background: #f0f7ef;
          border: 1px solid #c3dfc0;
          border-radius: 6px;
          padding: 12px 14px;
          font-size: 13px;
          line-height: 1.6;
          color: #2d5a29;
          font-family: 'Georgia', serif;
          margin-bottom: 10px;
        }
        .bullet-reason {
          font-size: 12px;
          color: var(--muted);
          font-style: italic;
          margin-bottom: 10px;
          line-height: 1.5;
        }
        .copy-btn {
          background: none; border: none; cursor: pointer;
          font-size: 12px; color: #1a6ba0; font-family: 'DM Sans', sans-serif;
          font-weight: 500; padding: 3px 0; transition: color 0.15s;
        }
        .copy-btn:hover { color: var(--ink); }
        .copy-btn.copied { color: var(--green); }

        /* FORMATTING */
        .format-list { display: flex; flex-direction: column; gap: 12px; }
        .format-item {
          background: #faf7f2;
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 16px 18px;
        }
        .format-issue { font-size: 14px; font-weight: 600; color: var(--red); margin-bottom: 6px; }
        .format-fix { font-size: 13px; color: #3a3530; line-height: 1.6; }
        .no-issues { text-align: center; padding: 40px; color: var(--muted); }
        .no-issues-icon { font-size: 40px; margin-bottom: 12px; }
        .no-issues p { font-size: 15px; font-weight: 300; }

        /* TITLE */
        .title-compare { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
        .title-card { background: #faf7f2; border: 1px solid var(--border); border-radius: 8px; padding: 20px; }
        .title-card-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px; color: var(--muted); margin-bottom: 8px; }
        .title-card-value { font-size: 16px; font-weight: 600; color: var(--ink); line-height: 1.4; }
        .title-card.suggested .title-card-value { color: var(--green); }
        .title-reason { font-size: 13px; color: var(--muted); line-height: 1.6; margin-bottom: 24px; font-style: italic; }
        .summary-box {
          background: #faf7f2;
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 20px 22px;
          font-size: 14px;
          line-height: 1.7;
          color: #3a3530;
        }

        /* RESET BTN */
        .reset-btn {
          margin-top: 32px;
          background: none;
          border: 1px solid var(--border);
          border-radius: 6px;
          padding: 10px 24px;
          font-size: 13px;
          font-weight: 500;
          color: var(--muted);
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.15s;
        }
        .reset-btn:hover { border-color: var(--ink); color: var(--ink); }

        @media (max-width: 768px) {
          nav { padding: 16px 20px; }
          .page { padding: 32px 20px 60px; }
          .input-grid { grid-template-columns: 1fr; }
          .score-banner { grid-template-columns: 1fr; gap: 20px; }
          .breakdown-grid { grid-template-columns: 1fr 1fr; }
          .title-compare { grid-template-columns: 1fr; }
          .section-tab { font-size: 12px; padding: 12px 6px; }
        }
      `}</style>

      <nav>
        <a href="/" className="logo">JobSeek<span>AI</span></a>
        <div className="nav-tag">ATS Resume Analyzer</div>
      </nav>

      <div className="page">
        <div className="page-header">
          <div className="page-eyebrow">Beat the ATS</div>
          <h1 className="page-title">Get more interviews.</h1>
          <p className="page-sub">Upload your resume and paste the job description. We'll score your ATS compatibility and tell you exactly what to fix.</p>
        </div>

        {/* INPUT */}
        {!result && !loading && (
          <>
            {error && <div className="error-box">⚠ {error}</div>}
            <div className="input-grid">
              <div className="input-card">
                <label className="input-label">Your Resume</label>
                <div
                  className={`drop-zone ${resumeFile ? 'has-file' : ''}`}
                  onClick={() => fileInputRef.current.click()}
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                >
                  <div className="drop-icon">{resumeFile ? '✅' : '📄'}</div>
                  {resumeFile ? (
                    <div className="drop-text success">
                      <strong>{resumeFile.name}</strong>
                      {(resumeFile.size / 1024).toFixed(0)} KB — Click to replace
                    </div>
                  ) : (
                    <div className="drop-text">
                      <strong>Drop your PDF here</strong>
                      or click to browse
                    </div>
                  )}
                  <div className="drop-hint">PDF only · Max 5MB</div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  style={{display:'none'}}
                  onChange={handleFileChange}
                />
              </div>

              <div className="input-card">
                <label className="input-label">Job Description</label>
                <textarea
                  className="jd-textarea"
                  placeholder="Paste the full job description here — include requirements, responsibilities, and preferred qualifications for best results..."
                  value={jd}
                  onChange={(e) => setJd(e.target.value)}
                />
                <div className="jd-count">{jd.length} characters</div>
              </div>
            </div>

            <button
              className="analyze-btn"
              onClick={handleAnalyze}
              disabled={!resumeFile || !jd.trim()}
            >
              {!resumeFile || !jd.trim() ? (
                <span>Upload resume and paste JD to analyze</span>
              ) : (
                <span>⚡ Analyze My Resume</span>
              )}
            </button>
          </>
        )}

        {/* LOADING */}
        {loading && (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <div className="loading-text">Analyzing your resume...</div>
            <div className="loading-sub">Simulating ATS scoring, identifying gaps, drafting rewrites. Takes about 15 seconds.</div>
          </div>
        )}

        {/* RESULTS */}
        {result && (
          <div className="results">
            {/* SCORE BANNER */}
            <div className="score-banner">
              <div className="score-circle" style={{
                borderColor: scoreColor(result.atsScore),
                background: scoreBg(result.atsScore)
              }}>
                <div className="score-num" style={{color: scoreColor(result.atsScore)}}>{result.atsScore}</div>
                <div className="score-pct" style={{color: scoreColor(result.atsScore)}}>/ 100</div>
              </div>

              <div>
                <span className="score-label-badge" style={{
                  background: scoreBg(result.atsScore),
                  color: scoreColor(result.atsScore)
                }}>{scoreLabel(result.atsScore)}</span>
                <div className="verdict-text">{result.verdict}</div>
                <div className="priorities">
                  {result.topPriorities?.map((p, i) => (
                    <div key={i} className="priority-item">
                      <div className="priority-num">{i + 1}</div>
                      <span>{p}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{textAlign:'right', flexShrink:0}}>
                <div style={{fontSize:11, textTransform:'uppercase', letterSpacing:'1.5px', color:'var(--muted)', marginBottom:8, fontWeight:600}}>Score Breakdown</div>
                {result.scoreBreakdown && Object.entries({
                  'Required KW': [result.scoreBreakdown.requiredKeywords, 30],
                  'Preferred KW': [result.scoreBreakdown.preferredKeywords, 15],
                  'Title Align': [result.scoreBreakdown.titleAlignment, 20],
                  'Quantified': [result.scoreBreakdown.quantifiedAchievements, 15],
                  'Formatting': [result.scoreBreakdown.formatting, 10],
                  'Narrative': [result.scoreBreakdown.narrativeFit, 10],
                }).map(([label, [score, max]]) => (
                  <div key={label} style={{display:'flex', justifyContent:'space-between', alignItems:'center', gap:12, marginBottom:6}}>
                    <span style={{fontSize:12, color:'var(--muted)', minWidth:80}}>{label}</span>
                    <div style={{width:80, height:4, background:'var(--border)', borderRadius:2, overflow:'hidden'}}>
                      <div style={{width:`${(score/max)*100}%`, height:'100%', background:'var(--gold)', borderRadius:2}}></div>
                    </div>
                    <span style={{fontSize:12, fontWeight:600, minWidth:32, textAlign:'right'}}>{score}/{max}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION TABS */}
            <div className="section-tabs">
              {SECTIONS.map(s => (
                <button key={s} className={`section-tab ${activeSection === s ? 'active' : ''}`} onClick={() => setActiveSection(s)}>
                  {sectionLabels[s]}
                  {s === 'rewrites' && result.bulletRewrites?.length > 0 && (
                    <span style={{marginLeft:6, background: activeSection === s ? 'rgba(255,255,255,0.2)' : 'var(--gold)', color: activeSection === s ? 'var(--cream)' : 'var(--ink)', fontSize:10, fontWeight:700, padding:'1px 6px', borderRadius:10}}>{result.bulletRewrites.length}</span>
                  )}
                  {s === 'keywords' && result.keywordAnalysis?.missing?.length > 0 && (
                    <span style={{marginLeft:6, background: activeSection === s ? 'rgba(255,255,255,0.2)' : '#fde8e8', color: activeSection === s ? 'var(--cream)' : 'var(--red)', fontSize:10, fontWeight:700, padding:'1px 6px', borderRadius:10}}>{result.keywordAnalysis.missing.length}</span>
                  )}
                </button>
              ))}
            </div>

            {/* KEYWORDS */}
            {activeSection === 'keywords' && (
              <div className="content-card">
                <div className="content-title">Keyword Analysis</div>

                {result.keywordAnalysis?.present?.length > 0 && (
                  <div className="keyword-section">
                    <div className="kw-section-label">✓ Present in your resume ({result.keywordAnalysis.present.length})</div>
                    <div className="keyword-chips">
                      {result.keywordAnalysis.present.map((kw, i) => (
                        <span key={i} className="kw-chip present">{kw}</span>
                      ))}
                    </div>
                  </div>
                )}

                {result.keywordAnalysis?.missing?.length > 0 && (
                  <div className="keyword-section">
                    <div className="kw-section-label">✗ Missing from your resume ({result.keywordAnalysis.missing.length})</div>
                    <div className="missing-list">
                      {result.keywordAnalysis.missing.map((item, i) => (
                        <div key={i} className="missing-item" onClick={() => setExpandedMissing(expandedMissing === i ? null : i)}>
                          <div className="missing-header" style={{background: item.importance === 'Required' ? '#fde8e8' : '#fff3cd'}}>
                            <span className="missing-keyword">{item.keyword}</span>
                            <span className="imp-badge" style={{
                              background: item.importance === 'Required' ? '#fde8e8' : '#fff3cd',
                              color: item.importance === 'Required' ? 'var(--red)' : 'var(--amber)',
                              border: `1px solid ${item.importance === 'Required' ? '#f5c6c6' : '#ffeaa7'}`
                            }}>{item.importance}</span>
                          </div>
                          {expandedMissing === i && (
                            <div className="missing-body">{item.context}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* BULLET REWRITES */}
            {activeSection === 'rewrites' && (
              <div className="content-card">
                <div className="content-title">Bullet Rewrites</div>
                {result.bulletRewrites?.length > 0 ? (
                  <div className="bullet-list">
                    {result.bulletRewrites.map((b, i) => (
                      <div key={i} className="bullet-item" onClick={() => setExpandedBullet(expandedBullet === i ? null : i)}>
                        <div className="bullet-header">
                          <span>{b.original}</span>
                          <span className="bullet-toggle">{expandedBullet === i ? '▲' : '▼'}</span>
                        </div>
                        {expandedBullet === i && (
                          <div className="bullet-body" onClick={e => e.stopPropagation()}>
                            <div className="bullet-sec-label">Rewritten Bullet</div>
                            <div className="bullet-rewrite">{b.rewritten}</div>
                            <div className="bullet-reason">Why: {b.reason}</div>
                            <button
                              className={`copy-btn ${copiedBullet === i ? 'copied' : ''}`}
                              onClick={() => copyBullet(b.rewritten, i)}
                            >
                              {copiedBullet === i ? '✓ Copied' : '📋 Copy rewritten bullet'}
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-issues">
                    <div className="no-issues-icon">✨</div>
                    <p>Your bullets are already well-optimized for this role.</p>
                  </div>
                )}
              </div>
            )}

            {/* FORMATTING */}
            {activeSection === 'formatting' && (
              <div className="content-card">
                <div className="content-title">Formatting Issues</div>
                {result.formattingIssues?.length > 0 ? (
                  <div className="format-list">
                    {result.formattingIssues.map((f, i) => (
                      <div key={i} className="format-item">
                        <div className="format-issue">⚠ {f.issue}</div>
                        <div className="format-fix">{f.fix}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-issues">
                    <div className="no-issues-icon">✅</div>
                    <p>No formatting issues detected. Your resume should parse correctly.</p>
                  </div>
                )}
              </div>
            )}

            {/* TITLE & SUMMARY */}
            {activeSection === 'title' && (
              <div className="content-card">
                <div className="content-title">Title & Overall Assessment</div>
                {result.titleRecommendation && (
                  <>
                    <div className="title-compare">
                      <div className="title-card">
                        <div className="title-card-label">Current Title</div>
                        <div className="title-card-value">{result.titleRecommendation.current}</div>
                      </div>
                      <div className="title-card suggested">
                        <div className="title-card-label">Suggested Title</div>
                        <div className="title-card-value">{result.titleRecommendation.suggested}</div>
                      </div>
                    </div>
                    <div className="title-reason">{result.titleRecommendation.reason}</div>
                  </>
                )}
                <div style={{fontSize:12, fontWeight:600, textTransform:'uppercase', letterSpacing:'1.5px', color:'var(--muted)', marginBottom:10}}>Overall Assessment</div>
                <div className="summary-box">{result.summary}</div>
              </div>
            )}

            <button className="reset-btn" onClick={() => { setResult(null); setResumeFile(null); setJd(''); setError(null); }}>
              ← Analyze Another Resume
            </button>
          </div>
        )}
      </div>
    </>
  );
}
