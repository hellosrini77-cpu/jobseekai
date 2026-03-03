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

const ACCEPTED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
];

const isValidFile = (file) => {
  if (!file) return false;
  const name = file.name.toLowerCase();
  return ACCEPTED_TYPES.includes(file.type) || name.endsWith('.pdf') || name.endsWith('.docx') || name.endsWith('.doc');
};

export default function Analyzer() {
  const [resumeFile, setResumeFile] = useState(null);
  const [jd, setJd] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [atsResult, setAtsResult] = useState(null);
  const [atsLoading, setAtsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState('keywords');
  const [expandedBullet, setExpandedBullet] = useState(null);
  const [expandedMissing, setExpandedMissing] = useState(null);
  const [expandedAts, setExpandedAts] = useState(null);
  const [copiedBullet, setCopiedBullet] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && isValidFile(file)) {
      setResumeFile(file);
      setError(null);
    } else {
      setError('Please upload a PDF or DOCX file.');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && isValidFile(file)) {
      setResumeFile(file);
      setError(null);
    } else {
      setError('Please upload a PDF or DOCX file.');
    }
  };

  const handleAnalyze = async () => {
    if (!resumeFile) { setError('Please upload your resume.'); return; }
    if (!jd.trim()) { setError('Please paste the job description.'); return; }

    setLoading(true);
    setAtsLoading(true);
    setError(null);
    setResult(null);
    setAtsResult(null);

    const formData1 = new FormData();
    formData1.append('resume', resumeFile);
    formData1.append('jd', jd);

    const formData2 = new FormData();
    formData2.append('resume', resumeFile);
    formData2.append('jd', jd);

    try {
      const [mainRes, atsRes] = await Promise.allSettled([
        fetch('/api/analyze', { method: 'POST', body: formData1 }),
        fetch('/api/ats-check', { method: 'POST', body: formData2 }),
      ]);

      if (mainRes.status === 'fulfilled') {
        const data = await mainRes.value.json();
        if (!mainRes.value.ok) throw new Error(data.error || 'Analysis failed');
        setResult(data);
        setActiveSection('keywords');
        setExpandedBullet(null);
        setExpandedMissing(null);
      } else {
        throw new Error(mainRes.reason?.message || 'Analysis failed');
      }

      if (atsRes.status === 'fulfilled') {
        const atsData = await atsRes.value.json();
        if (atsRes.value.ok) setAtsResult(atsData);
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setAtsLoading(false);
    }
  };

  const copyBullet = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedBullet(id);
    setTimeout(() => setCopiedBullet(null), 2000);
  };

  const SECTIONS = ['keywords', 'rewrites', 'formatting', 'title', 'ats'];
  const sectionLabels = {
    keywords: 'Keywords',
    rewrites: 'Bullet Rewrites',
    formatting: 'Formatting',
    title: 'Title & Summary',
    ats: 'ATS Compatibility',
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

        .input-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 28px; }

        .input-card { background: var(--white); border: 1px solid var(--border); border-radius: 12px; padding: 28px; }
        .input-label { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px; color: var(--muted); margin-bottom: 14px; display: block; }

        .drop-zone { border: 2px dashed var(--border); border-radius: 8px; padding: 40px 24px; text-align: center; cursor: pointer; transition: all 0.2s; background: #faf7f2; }
        .drop-zone:hover { border-color: var(--gold); background: #fdf8ee; }
        .drop-zone.has-file { border-color: var(--green); background: #f0f7ef; border-style: solid; }
        .drop-icon { font-size: 32px; margin-bottom: 12px; }
        .drop-text { font-size: 14px; color: var(--muted); font-weight: 300; line-height: 1.5; }
        .drop-text strong { color: var(--ink); font-weight: 600; display: block; margin-bottom: 4px; font-size: 15px; }
        .drop-text.success strong { color: var(--green); }
        .drop-hint { font-size: 11px; color: var(--muted); margin-top: 8px; }

        .jd-textarea { width: 100%; height: 200px; border: 1px solid var(--border); border-radius: 8px; padding: 14px 16px; font-family: 'DM Sans', sans-serif; font-size: 13px; line-height: 1.6; color: var(--ink); background: #faf7f2; resize: vertical; transition: border-color 0.2s; outline: none; }
        .jd-textarea:focus { border-color: var(--gold); background: var(--white); }
        .jd-textarea::placeholder { color: #b0a898; }
        .jd-count { font-size: 11px; color: var(--muted); margin-top: 6px; text-align: right; }

        .analyze-btn { width: 100%; background: var(--ink); color: var(--cream); border: none; border-radius: 8px; padding: 18px; font-size: 16px; font-weight: 600; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 10px; }
        .analyze-btn:hover:not(:disabled) { background: #2a2a28; }
        .analyze-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .error-box { background: #fde8e8; border: 1px solid #f5c6c6; border-radius: 8px; padding: 14px 18px; font-size: 14px; color: var(--red); margin-bottom: 20px; font-weight: 500; }

        .loading-state { text-align: center; padding: 60px 40px; background: var(--white); border: 1px solid var(--border); border-radius: 12px; }
        .loading-spinner { width: 48px; height: 48px; border: 3px solid var(--border); border-top-color: var(--gold); border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 20px; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .loading-text { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 700; margin-bottom: 8px; }
        .loading-sub { color: var(--muted); font-size: 14px; font-weight: 300; }

        .results { animation: fadeUp 0.5s ease both; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }

        .score-banner { background: var(--white); border: 1px solid var(--border); border-radius: 12px; padding: 36px 40px; margin-bottom: 24px; display: grid; grid-template-columns: auto 1fr auto; gap: 40px; align-items: center; }
        .score-circle { width: 110px; height: 110px; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; border: 4px solid; flex-shrink: 0; }
        .score-num { font-family: 'Playfair Display', serif; font-size: 38px; font-weight: 900; line-height: 1; }
        .score-pct { font-size: 13px; font-weight: 600; margin-top: 2px; }
        .score-label-badge { font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 20px; display: inline-block; margin-bottom: 10px; }
        .verdict-text { font-size: 16px; line-height: 1.6; color: var(--ink); font-weight: 300; margin-bottom: 16px; }
        .priorities { display: flex; flex-direction: column; gap: 8px; }
        .priority-item { display: flex; align-items: flex-start; gap: 10px; font-size: 13px; color: var(--ink); line-height: 1.5; }
        .priority-num { width: 22px; height: 22px; border-radius: 50%; background: var(--gold); color: var(--ink); font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 1px; }

        .section-tabs { display: flex; gap: 0; background: var(--white); border: 1px solid var(--border); border-radius: 10px; overflow: hidden; margin-bottom: 20px; }
        .section-tab { flex: 1; padding: 14px 10px; font-size: 13px; font-weight: 500; color: var(--muted); background: none; border: none; border-right: 1px solid var(--border); cursor: pointer; transition: all 0.15s; font-family: 'DM Sans', sans-serif; text-align: center; }
        .section-tab:last-child { border-right: none; }
        .section-tab:hover { background: #faf7f2; color: var(--ink); }
        .section-tab.active { background: var(--ink); color: var(--cream); font-weight: 600; }

        .content-card { background: var(--white); border: 1px solid var(--border); border-radius: 12px; padding: 32px; animation: fadeUp 0.3s ease both; }
        .content-title { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 700; margin-bottom: 20px; letter-spacing: -0.3px; }

        .keyword-section { margin-bottom: 28px; }
        .kw-section-label { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px; color: var(--muted); margin-bottom: 12px; }
        .keyword-chips { display: flex; flex-wrap: wrap; gap: 8px; }
        .kw-chip { font-size: 12px; font-weight: 600; padding: 5px 12px; border-radius: 20px; }
        .kw-chip.present { background: #d1e7dd; color: var(--green); }
        .kw-chip.missing-required { background: #fde8e8; color: var(--red); }
        .kw-chip.missing-preferred { background: #fff3cd; color: var(--amber); }

        .missing-list { display: flex; flex-direction: column; gap: 10px; margin-top: 12px; }
        .missing-item { border: 1px solid var(--border); border-radius: 8px; overflow: hidden; cursor: pointer; transition: box-shadow 0.15s; }
        .missing-item:hover { box-shadow: 0 3px 12px rgba(0,0,0,0.07); }
        .missing-header { padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; }
        .missing-keyword { font-size: 14px; font-weight: 600; }
        .missing-body { padding: 12px 16px; border-top: 1px solid var(--border); background: #fdfaf5; font-size: 13px; line-height: 1.6; color: #3a3530; }
        .imp-badge { font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px; }

        .bullet-list { display: flex; flex-direction: column; gap: 14px; }
        .bullet-item { border: 1px solid var(--border); border-radius: 8px; overflow: hidden; cursor: pointer; transition: box-shadow 0.15s; }
        .bullet-item:hover { box-shadow: 0 3px 12px rgba(0,0,0,0.07); }
        .bullet-header { padding: 14px 16px; background: #faf7f2; font-size: 13px; color: var(--muted); line-height: 1.5; font-style: italic; display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
        .bullet-toggle { font-size: 16px; flex-shrink: 0; color: var(--muted); }
        .bullet-body { padding: 16px; border-top: 1px solid var(--border); }
        .bullet-sec-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px; color: var(--muted); margin-bottom: 8px; }
        .bullet-rewrite { background: #f0f7ef; border: 1px solid #c3dfc0; border-radius: 6px; padding: 12px 14px; font-size: 13px; line-height: 1.6; color: #2d5a29; font-family: 'Georgia', serif; margin-bottom: 10px; }
        .bullet-reason { font-size: 12px; color: var(--muted); font-style: italic; margin-bottom: 10px; line-height: 1.5; }
        .copy-btn { background: none; border: none; cursor: pointer; font-size: 12px; color: #1a6ba0; font-family: 'DM Sans', sans-serif; font-weight: 500; padding: 3px 0; transition: color 0.15s; }
        .copy-btn:hover { color: var(--ink); }
        .copy-btn.copied { color: var(--green); }

        .format-list { display: flex; flex-direction: column; gap: 12px; }
        .format-item { background: #faf7f2; border: 1px solid var(--border); border-radius: 8px; padding: 16px 18px; }
        .format-issue { font-size: 14px; font-weight: 600; color: var(--red); margin-bottom: 6px; }
        .format-fix { font-size: 13px; color: #3a3530; line-height: 1.6; }
        .no-issues { text-align: center; padding: 40px; color: var(--muted); }
        .no-issues-icon { font-size: 40px; margin-bottom: 12px; }
        .no-issues p { font-size: 15px; font-weight: 300; }

        .title-compare { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
        .title-card { background: #faf7f2; border: 1px solid var(--border); border-radius: 8px; padding: 20px; }
        .title-card-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px; color: var(--muted); margin-bottom: 8px; }
        .title-card-value { font-size: 16px; font-weight: 600; color: var(--ink); line-height: 1.4; }
        .title-card.suggested .title-card-value { color: var(--green); }
        .title-reason { font-size: 13px; color: var(--muted); line-height: 1.6; margin-bottom: 24px; font-style: italic; }
        .summary-box { background: #faf7f2; border: 1px solid var(--border); border-radius: 8px; padding: 20px 22px; font-size: 14px; line-height: 1.7; color: #3a3530; }

        .ats-summary-bar { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 24px; }
        .ats-summary-card { background: #faf7f2; border: 1px solid var(--border); border-radius: 10px; padding: 16px 18px; text-align: center; }
        .ats-summary-label { font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: var(--muted); font-weight: 600; margin-bottom: 6px; }
        .ats-summary-value { font-family: 'Playfair Display', serif; font-size: 26px; font-weight: 700; }
        .ats-summary-sub { font-size: 12px; color: var(--muted); margin-top: 4px; }

        .ats-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 28px; }
        .ats-item { border: 1px solid var(--border); border-radius: 8px; overflow: hidden; cursor: pointer; transition: box-shadow 0.15s; }
        .ats-item:hover { box-shadow: 0 3px 12px rgba(0,0,0,0.07); }
        .ats-header { padding: 14px 18px; display: flex; align-items: center; gap: 14px; background: var(--white); }
        .ats-logo { width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 800; flex-shrink: 0; color: white; }
        .ats-name-block { flex: 1; min-width: 0; }
        .ats-name { font-size: 15px; font-weight: 600; color: var(--ink); }
        .ats-vendor { font-size: 12px; color: var(--muted); margin-top: 1px; }
        .ats-meta { font-size: 11px; color: var(--muted); margin-top: 3px; }
        .ats-score-block { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
        .ats-score-num { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 700; }
        .ats-pass-badge { font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px; }
        .ats-bar-track { width: 80px; height: 4px; background: var(--border); border-radius: 2px; overflow: hidden; }
        .ats-bar-fill { height: 100%; border-radius: 2px; }
        .ats-toggle { font-size: 14px; color: var(--muted); margin-left: 4px; }

        .ats-body { padding: 16px 18px; border-top: 1px solid var(--border); background: #fdfaf5; }
        .ats-issues { margin-bottom: 14px; }
        .ats-issues-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px; color: var(--muted); margin-bottom: 8px; }
        .ats-issue-item { display: flex; align-items: flex-start; gap: 8px; font-size: 13px; color: var(--red); line-height: 1.5; margin-bottom: 6px; }
        .ats-fix-box { background: #f0f7ef; border: 1px solid #c3dfc0; border-radius: 6px; padding: 10px 14px; font-size: 13px; line-height: 1.6; color: #2d5a29; }
        .ats-fix-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px; color: var(--green); margin-bottom: 6px; }

        .universal-fixes { background: #faf7f2; border: 1px solid var(--border); border-radius: 10px; padding: 20px 22px; margin-top: 4px; }
        .universal-label { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px; color: var(--muted); margin-bottom: 12px; }
        .universal-item { display: flex; align-items: flex-start; gap: 10px; font-size: 13px; color: var(--ink); line-height: 1.5; margin-bottom: 8px; }
        .universal-item:last-child { margin-bottom: 0; }
        .universal-num { width: 20px; height: 20px; border-radius: 50%; background: var(--gold); color: var(--ink); font-size: 10px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 1px; }

        .ats-loading { text-align: center; padding: 40px; color: var(--muted); }
        .ats-loading-spinner { width: 32px; height: 32px; border: 2px solid var(--border); border-top-color: var(--gold); border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 12px; }

        .reset-btn { margin-top: 32px; background: none; border: 1px solid var(--border); border-radius: 6px; padding: 10px 24px; font-size: 13px; font-weight: 500; color: var(--muted); cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.15s; }
        .reset-btn:hover { border-color: var(--ink); color: var(--ink); }

        @media (max-width: 768px) {
          nav { padding: 16px 20px; }
          .page { padding: 32px 20px 60px; }
          .input-grid { grid-template-columns: 1fr; }
          .score-banner { grid-template-columns: 1fr; gap: 20px; }
          .title-compare { grid-template-columns: 1fr; }
          .section-tab { font-size: 11px; padding: 12px 4px; }
          .ats-summary-bar { grid-template-columns: 1fr; }
          .ats-bar-track { display: none; }
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
                      <strong>Drop your resume here</strong>
                      or click to browse
                    </div>
                  )}
                  <div className="drop-hint">PDF or DOCX · Max 5MB</div>
                </div>
                <input ref={fileInputRef} type="file" accept=".pdf,.docx,.doc" style={{display:'none'}} onChange={handleFileChange} />
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

            <button className="analyze-btn" onClick={handleAnalyze} disabled={!resumeFile || !jd.trim()}>
              {!resumeFile || !jd.trim() ? (
                <span>Upload resume and paste JD to analyze</span>
              ) : (
                <span>⚡ Analyze My Resume</span>
              )}
            </button>
          </>
        )}

        {loading && (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <div className="loading-text">Analyzing your resume...</div>
            <div className="loading-sub">Scoring against 10 ATS platforms, identifying gaps, drafting rewrites. Takes about 20 seconds.</div>
          </div>
        )}

        {result && (
          <div className="results">
            <div className="score-banner">
              <div className="score-circle" style={{ borderColor: scoreColor(result.atsScore), background: scoreBg(result.atsScore) }}>
                <div className="score-num" style={{color: scoreColor(result.atsScore)}}>{result.atsScore}</div>
                <div className="score-pct" style={{color: scoreColor(result.atsScore)}}>/ 100</div>
              </div>

              <div>
                <span className="score-label-badge" style={{ background: scoreBg(result.atsScore), color: scoreColor(result.atsScore) }}>{scoreLabel(result.atsScore)}</span>
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
                  {s === 'ats' && atsResult && (
                    <span style={{marginLeft:6, background: activeSection === s ? 'rgba(255,255,255,0.2)' : scoreBg(atsResult.overallCompatibility), color: activeSection === s ? 'var(--cream)' : scoreColor(atsResult.overallCompatibility), fontSize:10, fontWeight:700, padding:'1px 6px', borderRadius:10}}>{atsResult.overallCompatibility}%</span>
                  )}
                  {s === 'ats' && atsLoading && !atsResult && (
                    <span style={{marginLeft:6, fontSize:10, color: activeSection === s ? 'var(--cream)' : 'var(--muted)'}}>…</span>
                  )}
                </button>
              ))}
            </div>

            {activeSection === 'keywords' && (
              <div className="content-card">
                <div className="content-title">Keyword Analysis</div>
                {result.keywordAnalysis?.present?.length > 0 && (
                  <div className="keyword-section">
                    <div className="kw-section-label">✓ Present in your resume ({result.keywordAnalysis.present.length})</div>
                    <div className="keyword-chips">
                      {result.keywordAnalysis.present.map((kw, i) => <span key={i} className="kw-chip present">{kw}</span>)}
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
                            <span className="imp-badge" style={{ background: item.importance === 'Required' ? '#fde8e8' : '#fff3cd', color: item.importance === 'Required' ? 'var(--red)' : 'var(--amber)', border: `1px solid ${item.importance === 'Required' ? '#f5c6c6' : '#ffeaa7'}` }}>{item.importance}</span>
                          </div>
                          {expandedMissing === i && <div className="missing-body">{item.context}</div>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

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
                            <button className={`copy-btn ${copiedBullet === i ? 'copied' : ''}`} onClick={() => copyBullet(b.rewritten, i)}>
                              {copiedBullet === i ? '✓ Copied' : '📋 Copy rewritten bullet'}
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-issues"><div className="no-issues-icon">✨</div><p>Your bullets are already well-optimized for this role.</p></div>
                )}
              </div>
            )}

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
                  <div className="no-issues"><div className="no-issues-icon">✅</div><p>No formatting issues detected. Your resume should parse correctly.</p></div>
                )}
              </div>
            )}

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

            {activeSection === 'ats' && (
              <div className="content-card">
                <div className="content-title">ATS Compatibility Check</div>

                {atsLoading && !atsResult && (
                  <div className="ats-loading">
                    <div className="ats-loading-spinner"></div>
                    <div style={{fontSize:14, fontWeight:500}}>Simulating 10 ATS platforms...</div>
                    <div style={{fontSize:12, marginTop:4}}>This takes a few extra seconds</div>
                  </div>
                )}

                {atsResult && (
                  <>
                    <div className="ats-summary-bar">
                      <div className="ats-summary-card">
                        <div className="ats-summary-label">Overall Compatibility</div>
                        <div className="ats-summary-value" style={{color: scoreColor(atsResult.overallCompatibility)}}>{atsResult.overallCompatibility}%</div>
                        <div className="ats-summary-sub">{scoreLabel(atsResult.overallCompatibility)}</div>
                      </div>
                      <div className="ats-summary-card">
                        <div className="ats-summary-label">Most Compatible</div>
                        <div className="ats-summary-value" style={{fontSize:18, color:'var(--green)'}}>{atsResult.mostCompatible}</div>
                        <div className="ats-summary-sub">Highest score</div>
                      </div>
                      <div className="ats-summary-card">
                        <div className="ats-summary-label">Needs Most Work</div>
                        <div className="ats-summary-value" style={{fontSize:18, color:'var(--red)'}}>{atsResult.leastCompatible}</div>
                        <div className="ats-summary-sub">Lowest score</div>
                      </div>
                    </div>

                    <div className="ats-list">
                      {atsResult.atsResults?.map((ats, i) => {
                        const colors = ['#1a73e8','#34a853','#4285f4','#ea4335','#ff6d00','#00897b','#8e24aa','#e53935','#0097a7','#43a047'];
                        const bg = colors[i % colors.length];
                        const initials = ats.name.split(' ').map(w => w[0]).join('').slice(0,2);
                        return (
                          <div key={i} className="ats-item" onClick={() => setExpandedAts(expandedAts === i ? null : i)}>
                            <div className="ats-header">
                              <div className="ats-logo" style={{background: bg}}>{initials}</div>
                              <div className="ats-name-block">
                                <div className="ats-name">{ats.name}</div>
                                <div className="ats-vendor">{ats.vendor}</div>
                                <div className="ats-meta">{ats.parsing} parsing · {ats.skillMatch} · strictness {ats.strictness}%</div>
                              </div>
                              <div className="ats-score-block">
                                <div className="ats-bar-track">
                                  <div className="ats-bar-fill" style={{width:`${ats.score}%`, background: scoreColor(ats.score)}}></div>
                                </div>
                                <div className="ats-score-num" style={{color: scoreColor(ats.score)}}>{ats.score}%</div>
                                <span className="ats-pass-badge" style={{ background: ats.pass ? '#d1e7dd' : '#fde8e8', color: ats.pass ? 'var(--green)' : 'var(--red)' }}>{ats.pass ? 'Pass' : 'Fail'}</span>
                                <span className="ats-toggle">{expandedAts === i ? '▲' : '▼'}</span>
                              </div>
                            </div>
                            {expandedAts === i && (
                              <div className="ats-body" onClick={e => e.stopPropagation()}>
                                <div className="ats-issues">
                                  <div className="ats-issues-label">Issues flagged</div>
                                  {ats.issues?.map((issue, j) => (
                                    <div key={j} className="ats-issue-item"><span>⚠</span><span>{issue}</span></div>
                                  ))}
                                </div>
                                <div className="ats-fix-label">Top fix for {ats.name}</div>
                                <div className="ats-fix-box">{ats.topFix}</div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {atsResult.universalFixes?.length > 0 && (
                      <div className="universal-fixes">
                        <div className="universal-label">🔧 Universal fixes — improves all ATS scores</div>
                        {atsResult.universalFixes.map((fix, i) => (
                          <div key={i} className="universal-item">
                            <div className="universal-num">{i + 1}</div>
                            <span>{fix}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {!atsLoading && !atsResult && (
                  <div className="no-issues">
                    <div className="no-issues-icon">⚠️</div>
                    <p>ATS compatibility check failed. Please try re-analyzing your resume.</p>
                  </div>
                )}
              </div>
            )}

            <button className="reset-btn" onClick={() => { setResult(null); setAtsResult(null); setResumeFile(null); setJd(''); setError(null); }}>
              ← Analyze Another Resume
            </button>
          </div>
        )}
      </div>
    </>
  );
}
