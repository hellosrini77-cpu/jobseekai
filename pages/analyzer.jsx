import { useState, useRef } from 'react';

// ─── ATSBreakdown Component ─────────────────────────────────────────────

const STRICTNESS_COLOR = (level) => {
  if (level >= 80) return { bg: '#FADBD8', text: '#922B21', label: 'Very Strict' };
  if (level >= 65) return { bg: '#FEF9E7', text: '#B7950B', label: 'Strict' };
  if (level >= 50) return { bg: '#D6EAF8', text: '#1A5276', label: 'Moderate' };
  return { bg: '#D5F5E3', text: '#1E8449', label: 'Lenient' };
};

const SCORE_BADGE = (score) => {
  if (score >= 80) return { bg: '#D5F5E3', text: '#1E8449', label: 'Strong' };
  if (score >= 65) return { bg: '#D6EAF8', text: '#1A5276', label: 'Good' };
  if (score >= 50) return { bg: '#FEF9E7', text: '#B7950B', label: 'Fair' };
  return { bg: '#FADBD8', text: '#922B21', label: 'Weak' };
};

function ScoreBar({ score, pass }) {
  const color = pass ? (score >= 80 ? '#1E8449' : score >= 65 ? '#1A5276' : '#B7950B') : '#922B21';
  return (
    <div style={{ width: '100%', height: 6, background: '#E8E3D9', borderRadius: 99, overflow: 'hidden' }}>
      <div style={{ width: `${score}%`, height: '100%', background: color, borderRadius: 99, transition: 'width 0.8s ease' }} />
    </div>
  );
}

function ATSCard({ ats }) {
  const [expanded, setExpanded] = useState(false);
  const badge = SCORE_BADGE(ats.score);
  const strictBadge = STRICTNESS_COLOR(ats.strictness);

  return (
    <div
      onClick={() => setExpanded(v => !v)}
      style={{
        background: '#FDFBF7',
        border: `1px solid ${ats.pass ? '#E2DDD4' : '#F5C6C2'}`,
        borderLeft: `4px solid ${ats.pass ? badge.text : '#C0392B'}`,
        borderRadius: 10,
        padding: '16px 18px',
        cursor: 'pointer',
        transition: 'box-shadow 0.2s',
        boxShadow: expanded ? '0 4px 18px rgba(0,0,0,0.08)' : 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 3 }}>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 700, color: '#1A1A1A' }}>
              {ats.name}
            </span>
            <span style={{
              fontSize: 10, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase',
              padding: '2px 8px', borderRadius: 20,
              background: ats.pass ? '#D5F5E3' : '#FADBD8',
              color: ats.pass ? '#1E8449' : '#922B21',
            }}>
              {ats.pass ? '✓ Pass' : '✗ Fail'}
            </span>
            <span style={{
              fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase',
              padding: '2px 8px', borderRadius: 20, background: badge.bg, color: badge.text,
            }}>
              {badge.label}
            </span>
          </div>
          <p style={{ margin: 0, fontSize: 11, color: '#999' }}>{ats.vendor}</p>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, color: badge.text, lineHeight: 1 }}>
            {ats.score}
          </span>
          <span style={{ fontSize: 11, color: '#AAA' }}>/100</span>
        </div>
      </div>

      <ScoreBar score={ats.score} pass={ats.pass} />

      <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 10, color: '#888', background: '#F0EBE1', padding: '3px 8px', borderRadius: 5 }}>
          {ats.parsing} parsing
        </span>
        <span style={{ fontSize: 10, color: '#888', background: '#F0EBE1', padding: '3px 8px', borderRadius: 5 }}>
          {ats.skillMatch}
        </span>
        <span style={{ fontSize: 10, color: strictBadge.text, background: strictBadge.bg, padding: '3px 8px', borderRadius: 5, fontWeight: 600 }}>
          {strictBadge.label} ({ats.strictness}%)
        </span>
      </div>

      <div style={{ textAlign: 'right', fontSize: 11, color: '#BBB', marginTop: 6 }}>
        {expanded ? '▲ less' : '▼ details'}
      </div>

      {expanded && (
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #E8E3D9' }}>
          {ats.issues?.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <p style={{ margin: '0 0 8px', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#AAA' }}>
                Issues Flagged
              </p>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                {ats.issues.map((issue, i) => (
                  <li key={i} style={{ fontSize: 12, color: '#444', padding: '5px 0 5px 14px', borderLeft: '3px solid #E2DDD4', marginBottom: 6, lineHeight: 1.5 }}>
                    {issue}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {ats.topFix && (
            <div style={{ background: '#F0F9F4', border: '1px solid #A9DFBF', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#1E8449', lineHeight: 1.5 }}>
              <strong>⚡ Top Fix:</strong> {ats.topFix}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ATSBreakdown({ data }) {
  if (!data || !data.atsResults) return null;
  const { atsResults, overallCompatibility, mostCompatible, leastCompatible, universalFixes } = data;
  const passCount = atsResults.filter(a => a.pass).length;

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ marginBottom: 24 }}>
        <p style={{ margin: '0 0 6px', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#B5A98B' }}>
          ATS Compatibility Check
        </p>
        <h2 style={{ margin: '0 0 6px', fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, color: '#1A1A1A', letterSpacing: '-0.02em' }}>
          How you score across 10 platforms
        </h2>
        <p style={{ margin: 0, fontSize: 13, color: '#777' }}>
          Each ATS parses resumes differently. Click any card to see flagged issues and the top fix.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, background: '#F5F0E8', borderRadius: 12, padding: '18px 20px', marginBottom: 24 }}>
        {[
          { label: 'Overall Score', value: `${overallCompatibility}`, unit: '/ 100' },
          { label: 'Platforms Passed', value: `${passCount}`, unit: `/ ${atsResults.length}` },
          { label: 'Best Platform', value: mostCompatible, unit: '' },
          { label: 'Needs Most Work', value: leastCompatible, unit: '' },
        ].map(({ label, value, unit }) => (
          <div key={label} style={{ textAlign: 'center' }}>
            <p style={{ margin: '0 0 4px', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#999' }}>
              {label}
            </p>
            <p style={{ margin: 0, fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: '#1A1A1A', lineHeight: 1.2 }}>
              {value}{' '}
              {unit && <span style={{ fontSize: 12, color: '#AAA' }}>{unit}</span>}
            </p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 12, marginBottom: 24 }}>
        {atsResults.map(ats => <ATSCard key={ats.name} ats={ats} />)}
      </div>

      {universalFixes?.length > 0 && (
        <div style={{ background: '#FDFBF7', border: '1px solid #E2DDD4', borderRadius: 12, padding: '20px 24px' }}>
          <p style={{ margin: '0 0 14px', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#B5A98B' }}>
            Universal Fixes — improves every ATS score
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {universalFixes.map((fix, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: '#B5A98B', lineHeight: 1, flexShrink: 0, marginTop: 1 }}>
                  {i + 1}.
                </span>
                <p style={{ margin: 0, fontSize: 13, color: '#333', lineHeight: 1.6 }}>{fix}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── CoverLetter Component ────────────────────────────────────────────────────

function CoverLetter({ result, jd, companyName, jobTitle, onSaved }) {
  const [tone, setTone] = useState('professional');
  const [coverLetter, setCoverLetter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    setLoading(true);
    setError(null);
    setCoverLetter('');

    try {
      const response = await fetch('/api/cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jd,
          companyName: companyName.trim() || 'the company',
          summary: result.summary,
          verdict: result.verdict,
          keywords: result.keywordAnalysis?.present || [],
          titleCurrent: result.titleRecommendation?.current || '',
          titleSuggested: result.titleRecommendation?.suggested || '',
          tone,
          jobTitle: jobTitle || '',
        }),
      });

      if (!response.ok) throw new Error('Failed to generate cover letter');
      const data = await response.json();
      setCoverLetter(data.coverLetter);

      // Auto-save to tracker
      try {
        const existing = JSON.parse(localStorage.getItem('jobseekai_tracker') || '[]');
        const alreadySaved = existing.some(e => e.company === (companyName || '') && e.role === (jobTitle || '') && e.company !== '');
        if (!alreadySaved) {
          const workType = /remote/i.test(jd) ? 'Remote' : /hybrid/i.test(jd) ? 'Hybrid' : /onsite|on-site/i.test(jd) ? 'Onsite' : 'Unknown';
          const compMatch = jd.match(/\$[\d,]+[Kk]?\s*[-–]\s*\$[\d,]+[Kk]?|\$[\d,]+[Kk]+/);
          const entry = {
            id: Date.now(),
            company: companyName || '',
            role: jobTitle || '',
            dateApplied: new Date().toISOString().split('T')[0],
            workType,
            compensation: compMatch ? compMatch[0] : '',
            atsScore: result?.atsScore || '',
            status: 'Applied',
            notes: 'Auto-saved from cover letter generator',
          };
          localStorage.setItem('jobseekai_tracker', JSON.stringify([...existing, entry]));
        }
      } catch (e) {}

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copy = () => {
    navigator.clipboard.writeText(coverLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tones = [
    { value: 'professional', label: '💼 Professional', desc: 'Polished and precise' },
    { value: 'bold', label: '🚀 Bold', desc: 'Confident and direct' },
    { value: 'warm', label: '🤝 Warm', desc: 'Personable and relationship-focused' },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <p style={{ margin: '0 0 6px', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#B5A98B' }}>
          AI-Generated
        </p>
        <h2 style={{ margin: '0 0 8px', fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, color: '#1A1A1A', letterSpacing: '-0.02em' }}>
          Cover Letter {companyName ? `— ${companyName}` : ''}
        </h2>
        <p style={{ margin: 0, fontSize: 13, color: '#777' }}>
          Generated from your resume analysis and job description. Choose a tone and generate.
        </p>
      </div>

      {/* Tone selector */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        {tones.map(t => (
          <div
            key={t.value}
            onClick={() => setTone(t.value)}
            style={{
              flex: 1, minWidth: 140, padding: '12px 16px', borderRadius: 10, cursor: 'pointer',
              border: `2px solid ${tone === t.value ? '#c9a84c' : '#e0d8c8'}`,
              background: tone === t.value ? '#fdf8ee' : '#fdfbf7',
              transition: 'all 0.15s',
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 700, color: tone === t.value ? '#c9a84c' : '#1A1A1A', marginBottom: 2 }}>{t.label}</div>
            <div style={{ fontSize: 11, color: '#999' }}>{t.desc}</div>
          </div>
        ))}
      </div>

      {/* Generate button */}
      {!coverLetter && !loading && (
        <button
          onClick={generate}
          style={{
            width: '100%', background: '#0f0f0e', color: '#f5f0e8', border: 'none',
            borderRadius: 8, padding: '16px', fontSize: 15, fontWeight: 600,
            fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', marginBottom: 16,
          }}
        >
          ✍️ Generate Cover Letter
        </button>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '40px 20px', background: '#faf7f2', borderRadius: 10, marginBottom: 16 }}>
          <div style={{ width: 36, height: 36, border: '3px solid #e0d8c8', borderTopColor: '#c9a84c', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 14px' }} />
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Writing your cover letter...</div>
          <div style={{ fontSize: 13, color: '#999' }}>Tailoring to the job description and your resume. Takes about 10 seconds.</div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ background: '#fde8e8', border: '1px solid #f5c6c6', borderRadius: 8, padding: '12px 16px', fontSize: 13, color: '#c0392b', marginBottom: 16 }}>
          ⚠ {error}
        </div>
      )}

      {/* Result */}
      {coverLetter && (
        <div style={{ animation: 'fadeUp 0.4s ease both' }}>
          <div style={{
            background: '#fdfbf7', border: '1px solid #e0d8c8', borderRadius: 10,
            padding: '28px 32px', fontSize: 14, lineHeight: 1.9, color: '#2a2a28',
            fontFamily: 'Georgia, serif', whiteSpace: 'pre-wrap', marginBottom: 16,
          }}>
            {coverLetter}
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              onClick={copy}
              style={{
                background: copied ? '#d1e7dd' : '#c9a84c', color: copied ? '#1E8449' : '#0f0f0e',
                border: 'none', borderRadius: 6, padding: '10px 22px', fontSize: 13,
                fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", transition: 'all 0.15s',
              }}
            >
              {copied ? '✓ Copied!' : '📋 Copy to Clipboard'}
            </button>
            <button
              onClick={() => { setCoverLetter(''); }}
              style={{
                background: 'none', border: '1px solid #e0d8c8', borderRadius: 6,
                padding: '10px 22px', fontSize: 13, fontWeight: 500, color: '#6b6559',
                cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
              }}
            >
              ↺ Regenerate
            </button>
            <button
              onClick={generate}
              style={{
                background: 'none', border: '1px solid #e0d8c8', borderRadius: 6,
                padding: '10px 22px', fontSize: 13, fontWeight: 500, color: '#6b6559',
                cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
              }}
            >
              🔄 Try Different Tone
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Analyzer Page ───────────────────────────────────────────────────────

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
  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [atsResult, setAtsResult] = useState(null);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState('keywords');
  const [expandedBullet, setExpandedBullet] = useState(null);
  const [expandedMissing, setExpandedMissing] = useState(null);
  const [copiedBullet, setCopiedBullet] = useState(null);
  const [savedToTracker, setSavedToTracker] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === 'application/pdf' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.name.endsWith('.docx'))) {
      setResumeFile(file);
      setError(null);
    } else {
      setError('Please upload a PDF or DOCX file.');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && (file.type === 'application/pdf' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.name.endsWith('.docx'))) {
      setResumeFile(file);
      setError(null);
    } else {
      setError('Please upload a PDF or DOCX file.');
    }
  };

  const handleAnalyze = async () => {
    if (!resumeFile) { setError('Please upload your resume PDF.'); return; }
    if (!jd.trim()) { setError('Please paste the job description.'); return; }

    setLoading(true);
    setError(null);
    setResult(null);
    setAtsResult(null);
    setSavedToTracker(false);

    try {
      const formData = new FormData();
      formData.append('resume', resumeFile);
      formData.append('jd', jd);

      const [analyzeRes, atsRes] = await Promise.allSettled([
        fetch('/api/analyze', { method: 'POST', body: formData }),
        fetch('/api/ats-check', { method: 'POST', body: formData }),
      ]);

      if (analyzeRes.status === 'fulfilled' && analyzeRes.value.ok) {
        const data = await analyzeRes.value.json();
        setResult(data);
      } else {
        const errData = analyzeRes.status === 'fulfilled'
          ? await analyzeRes.value.json()
          : { error: 'Analysis failed' };
        throw new Error(errData.error || 'Analysis failed');
      }

      if (atsRes.status === 'fulfilled' && atsRes.value.ok) {
        const atsData = await atsRes.value.json();
        setAtsResult(atsData);
      }

      setActiveSection('keywords');
      setExpandedBullet(null);
      setExpandedMissing(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const saveToTracker = () => {
    try {
      const entry = {
        id: Date.now(),
        company: companyName,
        jobTitle: jobTitle,
        score: result?.overallScore ?? null,
        date: new Date().toISOString(),
      };
      const existing = JSON.parse(localStorage.getItem('jobseekai_tracker') || '[]');
      localStorage.setItem('jobseekai_tracker', JSON.stringify([...existing, entry]));
      setSavedToTracker(true);
    } catch (e) { console.log(e); }
  };

  const copyBullet = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedBullet(id);
    setTimeout(() => setCopiedBullet(null), 2000);
  };

  const SECTIONS = ['keywords', 'platforms', 'rewrites', 'formatting', 'title', 'cover-letter'];
  const sectionLabels = {
    keywords: 'Keywords',
    platforms: 'ATS Platforms',
    rewrites: 'Bullet Rewrites',
    formatting: 'Formatting',
    title: 'Title & Summary',
    'cover-letter': '✍️ Cover Letter',
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
        .drop-zone:hover, .drop-zone.dragover { border-color: var(--gold); background: #fdf8ee; }
        .drop-zone.has-file { border-color: var(--green); background: #f0f7ef; border-style: solid; }
        .drop-icon { font-size: 32px; margin-bottom: 12px; }
        .drop-text { font-size: 14px; color: var(--muted); font-weight: 300; line-height: 1.5; }
        .drop-text strong { color: var(--ink); font-weight: 600; display: block; margin-bottom: 4px; font-size: 15px; }
        .drop-text.success strong { color: var(--green); }
        .drop-hint { font-size: 11px; color: var(--muted); margin-top: 8px; }

        .company-input { width: 100%; border: 1px solid var(--border); border-radius: 8px; padding: 12px 16px; font-family: 'DM Sans', sans-serif; font-size: 13px; color: var(--ink); background: #faf7f2; transition: border-color 0.2s; outline: none; margin-bottom: 16px; }
        .company-input:focus { border-color: var(--gold); background: var(--white); }
        .company-input::placeholder { color: #b0a898; }

        .jd-textarea { width: 100%; height: 170px; border: 1px solid var(--border); border-radius: 8px; padding: 14px 16px; font-family: 'DM Sans', sans-serif; font-size: 13px; line-height: 1.6; color: var(--ink); background: #faf7f2; resize: vertical; transition: border-color 0.2s; outline: none; }
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
        .section-tab.cover-letter-tab { background: #fdf8ee; color: #c9a84c; font-weight: 600; }
        .section-tab.cover-letter-tab.active { background: var(--ink); color: var(--cream); }

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

        .bottom-actions { display: flex; gap: 12px; margin-top: 32px; align-items: center; flex-wrap: wrap; }
        .reset-btn { background: none; border: 1px solid var(--border); border-radius: 6px; padding: 10px 24px; font-size: 13px; font-weight: 500; color: var(--muted); cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.15s; }
        .reset-btn:hover { border-color: var(--ink); color: var(--ink); }
        .save-btn { background: var(--gold); color: var(--ink); border: none; border-radius: 6px; padding: 10px 24px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: background 0.15s; }
        .save-btn:hover { background: var(--gold-light); }
        .saved-msg { font-size: 13px; color: var(--green); font-weight: 500; display: flex; align-items: center; gap: 6px; }

        .ats-loading { text-align: center; padding: 40px; color: var(--muted); }
        .ats-loading-spinner { width: 32px; height: 32px; border: 2px solid var(--border); border-top-color: var(--gold); border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 12px; }

        @media (max-width: 768px) {
          nav { padding: 16px 20px; }
          .page { padding: 32px 20px 60px; }
          .input-grid { grid-template-columns: 1fr; }
          .score-banner { grid-template-columns: 1fr; gap: 20px; }
          .title-compare { grid-template-columns: 1fr; }
          .section-tab { font-size: 11px; padding: 12px 4px; }
        }
      `}</style>

      <nav>
        <a href="/" className="logo">JobSeek<span>AI</span></a>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          <a href="/tracker" style={{ fontSize: 13, color: 'var(--muted)', textDecoration: 'none', fontWeight: 500 }}>📋 Tracker</a>
          <div className="nav-tag">ATS Resume Analyzer</div>
        </div>
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
                      <strong>Drop your PDF or DOCX here</strong>
                      or click to browse
                    </div>
                  )}
                  <div className="drop-hint">PDF or DOCX · Max 5MB</div>
                </div>
                <input ref={fileInputRef} type="file" accept=".pdf,.docx" style={{ display: 'none' }} onChange={handleFileChange} />
              </div>

              <div className="input-card">
                <label className="input-label">Job Description</label>
                <input
                  className="company-input"
                  type="text"
                  placeholder="Company name (e.g. Ripple) — used for cover letter"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
                <input
                  className="company-input"
                  type="text"
                  placeholder="Job title (e.g. Senior Legal Operations Manager)"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                />
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

        {/* LOADING */}
        {loading && (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <div className="loading-text">Analyzing your resume...</div>
            <div className="loading-sub">Scoring against 10 ATS platforms, identifying gaps, drafting rewrites. Takes about 20 seconds.</div>
          </div>
        )}

        {/* RESULTS */}
        {result && (
          <div className="results">
            {/* SCORE BANNER */}
            <div className="score-banner">
              <div className="score-circle" style={{ borderColor: scoreColor(result.atsScore), background: scoreBg(result.atsScore) }}>
                <div className="score-num" style={{ color: scoreColor(result.atsScore) }}>{result.atsScore}</div>
                <div className="score-pct" style={{ color: scoreColor(result.atsScore) }}>/ 100</div>
              </div>

              <div>
                <span className="score-label-badge" style={{ background: scoreBg(result.atsScore), color: scoreColor(result.atsScore) }}>
                  {scoreLabel(result.atsScore)}
                </span>
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

              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--muted)', marginBottom: 8, fontWeight: 600 }}>Score Breakdown</div>
                {result.scoreBreakdown && Object.entries({
                  'Required KW': [result.scoreBreakdown.requiredKeywords, 30],
                  'Preferred KW': [result.scoreBreakdown.preferredKeywords, 15],
                  'Title Align': [result.scoreBreakdown.titleAlignment, 20],
                  'Quantified': [result.scoreBreakdown.quantifiedAchievements, 15],
                  'Formatting': [result.scoreBreakdown.formatting, 10],
                  'Narrative': [result.scoreBreakdown.narrativeFit, 10],
                }).map(([label, [score, max]]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                    <span style={{ fontSize: 12, color: 'var(--muted)', minWidth: 80 }}>{label}</span>
                    <div style={{ width: 80, height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ width: `${(score / max) * 100}%`, height: '100%', background: 'var(--gold)', borderRadius: 2 }}></div>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, minWidth: 32, textAlign: 'right' }}>{score}/{max}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION TABS */}
            <div className="section-tabs">
              {SECTIONS.map(s => (
                <button
                  key={s}
                  className={`section-tab ${s === 'cover-letter' ? 'cover-letter-tab' : ''} ${activeSection === s ? 'active' : ''}`}
                  onClick={() => setActiveSection(s)}
                >
                  {sectionLabels[s]}
                  {s === 'rewrites' && result.bulletRewrites?.length > 0 && (
                    <span style={{ marginLeft: 6, background: activeSection === s ? 'rgba(255,255,255,0.2)' : 'var(--gold)', color: activeSection === s ? 'var(--cream)' : 'var(--ink)', fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 10 }}>
                      {result.bulletRewrites.length}
                    </span>
                  )}
                  {s === 'keywords' && result.keywordAnalysis?.missing?.length > 0 && (
                    <span style={{ marginLeft: 6, background: activeSection === s ? 'rgba(255,255,255,0.2)' : '#fde8e8', color: activeSection === s ? 'var(--cream)' : 'var(--red)', fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 10 }}>
                      {result.keywordAnalysis.missing.length}
                    </span>
                  )}
                  {s === 'platforms' && atsResult && (
                    <span style={{ marginLeft: 6, background: activeSection === s ? 'rgba(255,255,255,0.2)' : '#D6EAF8', color: activeSection === s ? 'var(--cream)' : '#1A5276', fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 10 }}>
                      {atsResult.atsResults?.filter(a => a.pass).length}/{atsResult.atsResults?.length}
                    </span>
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
                          <div className="missing-header" style={{ background: item.importance === 'Required' ? '#fde8e8' : '#fff3cd' }}>
                            <span className="missing-keyword">{item.keyword}</span>
                            <span className="imp-badge" style={{
                              background: item.importance === 'Required' ? '#fde8e8' : '#fff3cd',
                              color: item.importance === 'Required' ? 'var(--red)' : 'var(--amber)',
                              border: `1px solid ${item.importance === 'Required' ? '#f5c6c6' : '#ffeaa7'}`
                            }}>{item.importance}</span>
                          </div>
                          {expandedMissing === i && <div className="missing-body">{item.context}</div>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ATS PLATFORMS */}
            {activeSection === 'platforms' && (
              <div className="content-card">
                {atsResult ? (
                  <ATSBreakdown data={atsResult} />
                ) : loading ? (
                  <div className="ats-loading">
                    <div className="ats-loading-spinner"></div>
                    <p>Loading platform scores...</p>
                  </div>
                ) : (
                  <div className="no-issues">
                    <div className="no-issues-icon">⚠️</div>
                    <p>ATS platform scores unavailable. Try re-analyzing.</p>
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
                            <button className={`copy-btn ${copiedBullet === i ? 'copied' : ''}`} onClick={() => copyBullet(b.rewritten, i)}>
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
                <div style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--muted)', marginBottom: 10 }}>Overall Assessment</div>
                <div className="summary-box">{result.summary}</div>
              </div>
            )}

            {/* COVER LETTER */}
            {activeSection === 'cover-letter' && (
              <div className="content-card">
                <CoverLetter result={result} jd={jd} companyName={companyName} jobTitle={jobTitle} onSaved={() => setSavedToTracker(true)} />
              </div>
            )}

            {/* BOTTOM ACTIONS */}
            <div className="bottom-actions">
              <button className="reset-btn" onClick={() => { setResult(null); setAtsResult(null); setResumeFile(null); setJd(''); setCompanyName(''); setJobTitle(''); setError(null); setSavedToTracker(false); }}>
                ← Analyze Another Resume
              </button>
              {savedToTracker && (
                <div className="saved-msg">
                  ✓ Saved to Tracker
                  <a href="/tracker" style={{ color: 'var(--green)', fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: 3 }}>
                    View Tracker →
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
