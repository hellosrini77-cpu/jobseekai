import Link from 'next/link';

export default function Home() {
  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@300;400;500;600&display=swap');
        :root {
          --ink: #0f0f0e; --cream: #f5f0e8; --gold: #c9a84c; --gold-light: #e8c97a;
          --muted: #6b6559; --border: #e0d8c8; --white: #ffffff;
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'DM Sans', sans-serif; background: var(--cream); color: var(--ink); min-height: 100vh; }
      `}</style>

      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>

        {/* Logo */}
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, fontWeight: 900, letterSpacing: '-1px', marginBottom: 8 }}>
          JobSeek<span style={{ color: 'var(--gold)' }}>AI</span>
        </div>
        <p style={{ color: 'var(--muted)', fontSize: 16, fontWeight: 300, marginBottom: 56, textAlign: 'center' }}>
          Land more interviews. Track every opportunity.
        </p>

        {/* Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20, width: '100%', maxWidth: 600 }}>
          <Link href="/analyzer" style={{ textDecoration: 'none' }}>
            <div style={{
              background: 'var(--ink)', color: 'var(--cream)', borderRadius: 14, padding: '36px 32px',
              cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s',
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 14px 40px rgba(0,0,0,0.18)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.12)'; }}
            >
              <div style={{ fontSize: 32, marginBottom: 16 }}>⚡</div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Resume Analyzer</div>
              <p style={{ fontSize: 14, color: '#a09a8e', fontWeight: 300, lineHeight: 1.6, marginBottom: 20 }}>
                Score your resume against any job description across 10 ATS platforms. Get keyword gaps, bullet rewrites, and formatting fixes.
              </p>
              <span style={{ fontSize: 13, color: 'var(--gold)', fontWeight: 600 }}>Analyze my resume →</span>
            </div>
          </Link>

          <Link href="/tracker" style={{ textDecoration: 'none' }}>
            <div style={{
              background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 14, padding: '36px 32px',
              cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s',
              boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 10px 32px rgba(0,0,0,0.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.06)'; }}
            >
              <div style={{ fontSize: 32, marginBottom: 16 }}>📋</div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Application Tracker</div>
              <p style={{ fontSize: 14, color: 'var(--muted)', fontWeight: 300, lineHeight: 1.6, marginBottom: 20 }}>
                Track every application, interview, and offer. Status updates, compensation, work type — your whole pipeline in one place.
              </p>
              <span style={{ fontSize: 13, color: 'var(--ink)', fontWeight: 600 }}>View my pipeline →</span>
            </div>
          </Link>
        </div>

        <p style={{ marginTop: 48, fontSize: 12, color: '#bbb' }}>© 2026 JobSeekAI · Built for job seekers</p>
      </div>
    </>
  );
}
