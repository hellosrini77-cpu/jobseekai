import { useState, useEffect } from 'react';
import Link from 'next/link';
import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';

// ── Firebase config — replace with your project's config ──────────────────────
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Prevent re-initialization on hot reload
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// ── Constants ──────────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  Applied:   { bg: '#D6EAF8', text: '#1A5276', dot: '#2E86C1' },
  Interview: { bg: '#FEF9E7', text: '#B7950B', dot: '#D4AC0D' },
  Offer:     { bg: '#D5F5E3', text: '#1E8449', dot: '#27AE60' },
  Rejected:  { bg: '#FADBD8', text: '#922B21', dot: '#E74C3C' },
  Withdrawn: { bg: '#F2F3F4', text: '#626567', dot: '#AAB7B8' },
};

const WORK_TYPES = ['Remote', 'Hybrid', 'Onsite', 'Unknown'];
const STATUSES = Object.keys(STATUS_CONFIG);

const emptyForm = {
  company: '', role: '', dateApplied: new Date().toISOString().split('T')[0],
  workType: 'Unknown', compensation: '', status: 'Applied', notes: '', atsScore: '',
};

// ── Sub-components ─────────────────────────────────────────────────────────────
function WorkTypeBadge({ type }) {
  const colors = {
    Remote:  { bg: '#D5F5E3', text: '#1E8449' },
    Hybrid:  { bg: '#D6EAF8', text: '#1A5276' },
    Onsite:  { bg: '#FEF9E7', text: '#B7950B' },
    Unknown: { bg: '#F2F3F4', text: '#626567' },
  };
  const c = colors[type] || colors['Unknown'];
  return (
    <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: c.bg, color: c.text }}>
      {type}
    </span>
  );
}

// ── Auth Screen ────────────────────────────────────────────────────────────────
function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailAuth = async () => {
    if (!email || !password) return;
    setLoading(true);
    setError('');
    try {
      if (mode === 'signin') {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (e) {
      setError(e.message.replace('Firebase: ', '').replace(/\(auth\/.*\)/, '').trim());
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setLoading(true);
    setError('');
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e) {
      setError(e.message.replace('Firebase: ', '').trim());
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <a href="/" style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, textDecoration: 'none', color: 'var(--ink)', marginBottom: 8 }}>
        JobSeek<span style={{ color: 'var(--gold)' }}>AI</span>
      </a>
      <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 32 }}>Sign in to access your application tracker</p>

      <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 12, padding: '36px 40px', width: '100%', maxWidth: 400 }}>

        {/* Google button */}
        <button onClick={handleGoogle} disabled={loading}
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, border: '1px solid var(--border)', borderRadius: 8, padding: '11px 16px', fontSize: 14, fontWeight: 500, background: 'var(--white)', color: 'var(--ink)', cursor: 'pointer', marginBottom: 20 }}>
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          Continue with Google
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>or</span>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        </div>

        {/* Email/password */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--muted)', display: 'block', marginBottom: 6 }}>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="you@email.com"
            style={{ width: '100%', border: '1px solid var(--border)', borderRadius: 6, padding: '10px 12px', fontSize: 13, background: '#faf7f2', outline: 'none', color: 'var(--ink)' }} />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--muted)', display: 'block', marginBottom: 6 }}>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            onKeyDown={e => e.key === 'Enter' && handleEmailAuth()}
            style={{ width: '100%', border: '1px solid var(--border)', borderRadius: 6, padding: '10px 12px', fontSize: 13, background: '#faf7f2', outline: 'none', color: 'var(--ink)' }} />
        </div>

        {error && <p style={{ fontSize: 12, color: '#c0392b', marginBottom: 14 }}>{error}</p>}

        <button onClick={handleEmailAuth} disabled={loading || !email || !password}
          style={{ width: '100%', background: 'var(--ink)', color: 'var(--cream)', border: 'none', borderRadius: 6, padding: '11px', fontSize: 14, fontWeight: 600, cursor: 'pointer', opacity: (!email || !password || loading) ? 0.6 : 1, marginBottom: 16 }}>
          {loading ? 'Please wait...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
        </button>

        <p style={{ fontSize: 13, color: 'var(--muted)', textAlign: 'center' }}>
          {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
          <button onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); }}
            style={{ background: 'none', border: 'none', color: 'var(--gold)', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>
            {mode === 'signin' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}

// ── CSV Export ─────────────────────────────────────────────────────────────────
const exportCSV = (apps) => {
  const headers = ['Company', 'Role', 'Date Applied', 'Work Type', 'Compensation', 'ATS Score', 'Status', 'Notes'];
  const rows = apps.map(a => [
    a.company, a.role, a.dateApplied, a.workType, a.compensation,
    a.atsScore || '', a.status, a.notes
  ].map(v => `"${String(v || '').replace(/"/g, '""')}"`).join(','));
  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `jobseekai_applications_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

// ── Main Tracker ───────────────────────────────────────────────────────────────
export default function Tracker() {
  const [user, setUser] = useState(undefined); // undefined = loading, null = signed out
  const [apps, setApps] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('All');
  const [sortBy, setSortBy] = useState('dateApplied');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [saving, setSaving] = useState(false);

  // Auth listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return unsub;
  }, []);

  // Firestore listener — real-time sync
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'applications'),
      where('uid', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(q, (snapshot) => {
      setApps(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, [user]);

  const handleSubmit = async () => {
    if (!form.company.trim() || !form.role.trim()) return;
    setSaving(true);
    try {
      if (editId !== null) {
        const { id, ...data } = form;
        await updateDoc(doc(db, 'applications', editId), data);
        setEditId(null);
      } else {
        await addDoc(collection(db, 'applications'), {
          ...form,
          uid: user.uid,
          createdAt: new Date().toISOString(),
        });
      }
      setForm(emptyForm);
      setShowForm(false);
    } catch (e) {
      console.error('Save error:', e);
    }
    setSaving(false);
  };

  const handleEdit = (app) => {
    setForm({ ...app });
    setEditId(app.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, 'applications', id));
    setDeleteConfirm(null);
  };

  const handleStatusChange = async (id, status) => {
    await updateDoc(doc(db, 'applications', id), { status });
  };

  const filtered = apps
    .filter(a => filterStatus === 'All' || a.status === filterStatus)
    .sort((a, b) => {
      if (sortBy === 'dateApplied') return new Date(b.dateApplied) - new Date(a.dateApplied);
      if (sortBy === 'company') return a.company.localeCompare(b.company);
      if (sortBy === 'status') return a.status.localeCompare(b.status);
      return 0;
    });

  const counts = STATUSES.reduce((acc, s) => ({ ...acc, [s]: apps.filter(a => a.status === s).length }), {});

  // Loading state
  if (user === undefined) {
    return (
      <div style={{ minHeight: '100vh', background: '#f5f0e8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontFamily: 'DM Sans, sans-serif', color: '#6b6559' }}>Loading...</p>
      </div>
    );
  }

  // Not signed in
  if (!user) return <AuthScreen />;

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@300;400;500;600&display=swap');
        :root {
          --ink: #0f0f0e; --cream: #f5f0e8; --gold: #c9a84c;
          --muted: #6b6559; --border: #e0d8c8; --white: #ffffff;
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'DM Sans', sans-serif; background: var(--cream); color: var(--ink); min-height: 100vh; }
        nav { display: flex; justify-content: space-between; align-items: center; padding: 18px 48px; border-bottom: 1px solid var(--border); background: var(--cream); position: sticky; top: 0; z-index: 100; }
        .logo { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 700; text-decoration: none; color: var(--ink); letter-spacing: -0.5px; }
        .logo span { color: var(--gold); }
        input, textarea, select { font-family: 'DM Sans', sans-serif; }
        @media (max-width: 768px) {
          nav { padding: 16px 20px; }
          .page { padding: 24px 16px 60px !important; }
          .stats-grid { grid-template-columns: repeat(3, 1fr) !important; }
          .form-grid-3 { grid-template-columns: 1fr !important; }
          .table-wrap { overflow-x: auto; }
        }
      `}</style>

      <nav>
        <a href="/" className="logo">JobSeek<span>AI</span></a>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <Link href="/analyzer" style={{ fontSize: 13, color: 'var(--muted)', textDecoration: 'none', fontWeight: 500 }}>
            ← Resume Analyzer
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>{user.email || user.displayName}</span>
            <button onClick={() => signOut(auth)}
              style={{ fontSize: 12, color: 'var(--muted)', background: 'none', border: '1px solid var(--border)', borderRadius: 6, padding: '5px 12px', cursor: 'pointer' }}>
              Sign out
            </button>
          </div>
        </div>
      </nav>

      <div className="page" style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 48px 80px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 8 }}>
              Application Tracker
            </div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 900, letterSpacing: '-1px' }}>
              Your Job Search
            </h1>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            {apps.length > 0 && (
              <button onClick={() => exportCSV(apps)}
                style={{ fontSize: 13, color: 'var(--muted)', background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 6, padding: '10px 18px', cursor: 'pointer', fontWeight: 500 }}>
                Export CSV
              </button>
            )}
            <button onClick={() => { setForm(emptyForm); setEditId(null); setShowForm(!showForm); }}
              style={{ background: 'var(--ink)', color: 'var(--cream)', border: 'none', borderRadius: 6, padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              {showForm ? 'Cancel' : '+ Add Application'}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 28 }}>
          {STATUSES.map(s => (
            <div key={s} style={{ background: STATUS_CONFIG[s].bg, borderRadius: 10, padding: '16px 20px' }}>
              <div style={{ fontSize: 24, fontWeight: 800, fontFamily: "'Playfair Display', serif", color: STATUS_CONFIG[s].text }}>{counts[s]}</div>
              <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', color: STATUS_CONFIG[s].text, opacity: 0.8 }}>{s}</div>
            </div>
          ))}
        </div>

        {/* Form */}
        {showForm && (
          <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 12, padding: '28px 32px', marginBottom: 28 }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, marginBottom: 20 }}>
              {editId !== null ? 'Edit Application' : 'New Application'}
            </h2>
            <div className="form-grid-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
              {[['Company', 'company', 'text', 'Google'], ['Role', 'role', 'text', 'Software Engineer'], ['Date Applied', 'dateApplied', 'date', '']].map(([label, key, type, placeholder]) => (
                <div key={key}>
                  <label style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--muted)', display: 'block', marginBottom: 6 }}>{label}</label>
                  <input type={type} value={form[key]} placeholder={placeholder} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    style={{ width: '100%', border: '1px solid var(--border)', borderRadius: 6, padding: '10px 12px', fontSize: 13, background: '#faf7f2', color: 'var(--ink)', outline: 'none' }} />
                </div>
              ))}
            </div>
            <div className="form-grid-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--muted)', display: 'block', marginBottom: 6 }}>Work Type</label>
                <select value={form.workType} onChange={e => setForm(f => ({ ...f, workType: e.target.value }))}
                  style={{ width: '100%', border: '1px solid var(--border)', borderRadius: 6, padding: '10px 12px', fontSize: 13, background: '#faf7f2', color: 'var(--ink)', outline: 'none' }}>
                  {WORK_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--muted)', display: 'block', marginBottom: 6 }}>Compensation</label>
                <input type="text" value={form.compensation} placeholder="$120,000" onChange={e => setForm(f => ({ ...f, compensation: e.target.value }))}
                  style={{ width: '100%', border: '1px solid var(--border)', borderRadius: 6, padding: '10px 12px', fontSize: 13, background: '#faf7f2', color: 'var(--ink)', outline: 'none' }} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--muted)', display: 'block', marginBottom: 6 }}>Status</label>
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                  style={{ width: '100%', border: '1px solid var(--border)', borderRadius: 6, padding: '10px 12px', fontSize: 13, background: '#faf7f2', color: 'var(--ink)', outline: 'none' }}>
                  {STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--muted)', display: 'block', marginBottom: 6 }}>Notes</label>
              <textarea placeholder="Recruiter name, next steps, salary discussed..." value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                rows={2}
                style={{ width: '100%', border: '1px solid var(--border)', borderRadius: 6, padding: '10px 12px', fontSize: 13, background: '#faf7f2', resize: 'vertical', outline: 'none', color: 'var(--ink)' }} />
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={handleSubmit} disabled={!form.company.trim() || !form.role.trim() || saving}
                style={{ background: 'var(--ink)', color: 'var(--cream)', border: 'none', borderRadius: 6, padding: '11px 28px', fontSize: 14, fontWeight: 600, cursor: 'pointer', opacity: (!form.company.trim() || !form.role.trim() || saving) ? 0.5 : 1 }}>
                {saving ? 'Saving...' : editId !== null ? 'Save Changes' : 'Add Application'}
              </button>
              <button onClick={() => { setShowForm(false); setEditId(null); setForm(emptyForm); }}
                style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 6, padding: '11px 24px', fontSize: 13, color: 'var(--muted)', cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Filters & Sort */}
        {apps.length > 0 && (
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {['All', ...STATUSES].map(s => (
                <button key={s} onClick={() => setFilterStatus(s)}
                  style={{ fontSize: 12, fontWeight: 600, padding: '5px 12px', borderRadius: 20, border: '1px solid', cursor: 'pointer',
                    background: filterStatus === s ? 'var(--ink)' : 'var(--white)',
                    color: filterStatus === s ? 'var(--cream)' : 'var(--muted)',
                    borderColor: filterStatus === s ? 'var(--ink)' : 'var(--border)' }}>
                  {s}{s !== 'All' && counts[s] > 0 ? ` (${counts[s]})` : ''}
                </button>
              ))}
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>Sort by</span>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                style={{ fontSize: 12, border: '1px solid var(--border)', borderRadius: 6, padding: '5px 10px', background: 'var(--white)', color: 'var(--ink)', outline: 'none' }}>
                <option value="dateApplied">Date Applied</option>
                <option value="company">Company</option>
                <option value="status">Status</option>
              </select>
            </div>
          </div>
        )}

        {/* Table */}
        {filtered.length > 0 ? (
          <div className="table-wrap" style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F5F0E8', borderBottom: '1px solid var(--border)' }}>
                  {['Company', 'Role', 'Date', 'Type', 'Compensation', 'ATS Score', 'Status', 'Notes', ''].map(h => (
                    <th key={h} style={{ padding: '12px 16px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--muted)', textAlign: 'left', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((app, i) => (
                  <tr key={app.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#FDFBF7'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}>
                    <td style={{ padding: '14px 16px', fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap' }}>{app.company}</td>
                    <td style={{ padding: '14px 16px', fontSize: 13, color: '#444', maxWidth: 200 }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{app.role}</div>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 12, color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                      {new Date(app.dateApplied).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td style={{ padding: '14px 16px' }}><WorkTypeBadge type={app.workType} /></td>
                    <td style={{ padding: '14px 16px', fontSize: 13, color: app.compensation ? 'var(--ink)' : '#ccc', whiteSpace: 'nowrap' }}>
                      {app.compensation || '—'}
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                      {app.atsScore ? (
                        <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 700,
                          color: app.atsScore >= 75 ? '#2d6a4f' : app.atsScore >= 50 ? '#856404' : '#c0392b' }}>{app.atsScore}</span>
                      ) : <span style={{ color: '#ccc', fontSize: 13 }}>—</span>}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <select value={app.status} onChange={e => handleStatusChange(app.id, e.target.value)}
                        style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', border: 'none', borderRadius: 20, padding: '4px 10px', cursor: 'pointer', outline: 'none',
                          background: STATUS_CONFIG[app.status]?.bg, color: STATUS_CONFIG[app.status]?.text }}>
                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 12, color: 'var(--muted)', maxWidth: 160 }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{app.notes || '—'}</div>
                    </td>
                    <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                      <button onClick={() => handleEdit(app)}
                        style={{ fontSize: 12, color: '#1a6ba0', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500, marginRight: 12 }}>Edit</button>
                      {deleteConfirm === app.id ? (
                        <>
                          <button onClick={() => handleDelete(app.id)}
                            style={{ fontSize: 12, color: '#922B21', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, marginRight: 6 }}>Confirm</button>
                          <button onClick={() => setDeleteConfirm(null)}
                            style={{ fontSize: 12, color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer' }}>Cancel</button>
                        </>
                      ) : (
                        <button onClick={() => setDeleteConfirm(app.id)}
                          style={{ fontSize: 12, color: '#C0392B', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>Delete</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 12, padding: '60px 40px', textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>📋</div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
              {filterStatus !== 'All' ? `No ${filterStatus} applications` : 'No applications yet'}
            </div>
            <p style={{ color: 'var(--muted)', fontSize: 14, fontWeight: 300, marginBottom: 20 }}>
              {filterStatus !== 'All' ? 'Try a different filter.' : 'Add your first application to get started.'}
            </p>
            {filterStatus === 'All' && (
              <button onClick={() => { setForm(emptyForm); setEditId(null); setShowForm(true); }}
                style={{ background: 'var(--ink)', color: 'var(--cream)', border: 'none', borderRadius: 6, padding: '11px 24px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                + Add Application
              </button>
            )}
          </div>
        )}

        {apps.length > 0 && (
          <div style={{ marginTop: 16, fontSize: 12, color: 'var(--muted)', textAlign: 'right' }}>
            {filtered.length} of {apps.length} application{apps.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </>
  );
}
