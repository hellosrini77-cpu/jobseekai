import { useState, useEffect } from 'react';
import Link from 'next/link';

const STATUS_CONFIG = {
  Applied:    { bg: '#D6EAF8', text: '#1A5276', dot: '#2E86C1' },
  Interview:  { bg: '#FEF9E7', text: '#B7950B', dot: '#D4AC0D' },
  Offer:      { bg: '#D5F5E3', text: '#1E8449', dot: '#27AE60' },
  Rejected:   { bg: '#FADBD8', text: '#922B21', dot: '#E74C3C' },
  Withdrawn:  { bg: '#F2F3F4', text: '#626567', dot: '#AAB7B8' },
};

const WORK_TYPES = ['Remote', 'Hybrid', 'Onsite', 'Unknown'];
const STATUSES = Object.keys(STATUS_CONFIG);

function WorkTypeBadge({ type }) {
  const colors = {
    Remote: { bg: '#D5F5E3', text: '#1E8449' },
    Hybrid: { bg: '#D6EAF8', text: '#1A5276' },
    Onsite: { bg: '#FEF9E7', text: '#B7950B' },
    Unknown: { bg: '#F2F3F4', text: '#626567' },
  };
  const c = colors[type] || colors['Unknown'];
  return (
    <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: c.bg, color: c.text }}>
      {type}
    </span>
  );
}

const emptyForm = {
  company: '', role: '', dateApplied: new Date().toISOString().split('T')[0],
  workType: 'Unknown', compensation: '', status: 'Applied', notes: '',
};

export default function Tracker() {
  const [apps, setApps] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('All');
  const [sortBy, setSortBy] = useState('dateApplied');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('jobseekai_tracker');
      if (saved) setApps(JSON.parse(saved));
    } catch {}
  }, []);

  const save = (updated) => {
    setApps(updated);
    try { localStorage.setItem('jobseekai_tracker', JSON.stringify(updated)); } catch {}
  };

  const handleSubmit = () => {
    if (!form.company.trim() || !form.role.trim()) return;
    if (editId !== null) {
      save(apps.map(a => a.id === editId ? { ...form, id: editId } : a));
      setEditId(null);
    } else {
      save([...apps, { ...form, id: Date.now() }]);
    }
    setForm(emptyForm);
    setShowForm(false);
  };

  const handleEdit = (app) => {
    setForm({ ...app });
    setEditId(app.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id) => {
    save(apps.filter(a => a.id !== id));
    setDeleteConfirm(null);
  };

  const handleStatusChange = (id, status) => {
    save(apps.map(a => a.id === id ? { ...a, status } : a));
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
        <Link href="/analyzer" style={{ fontSize: 13, color: 'var(--muted)', textDecoration: 'none', fontWeight: 500 }}>
          ← Resume Analyzer
        </Link>
      </nav>

      <div className="page" style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 48px 80px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 8 }}>
              Application Tracker
            </div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, fontWeight: 900, letterSpacing: '-1px', marginBottom: 8 }}>
              Your job search pipeline.
            </h1>
            <p style={{ color: 'var(--muted)', fontSize: 15, fontWeight: 300 }}>
              Track every application, interview, and offer in one place.
            </p>
          </div>
          <button
            onClick={() => { setForm(emptyForm); setEditId(null); setShowForm(!showForm); }}
            style={{ background: 'var(--ink)', color: 'var(--cream)', border: 'none', borderRadius: 8, padding: '12px 24px', fontSize: 14, fontWeight: 600, cursor: 'pointer', flexShrink: 0, marginTop: 8 }}
          >
            + Add Application
          </button>
        </div>

        {/* Stats */}
        <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 28 }}>
          {STATUSES.map(s => {
            const cfg = STATUS_CONFIG[s];
            return (
              <div key={s} onClick={() => setFilterStatus(filterStatus === s ? 'All' : s)}
                style={{ background: 'var(--white)', border: `1px solid ${filterStatus === s ? cfg.dot : 'var(--border)'}`, borderTop: `3px solid ${cfg.dot}`, borderRadius: 10, padding: '16px 18px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.15s' }}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 900, color: cfg.text, lineHeight: 1 }}>{counts[s] || 0}</div>
                <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--muted)', marginTop: 4 }}>{s}</div>
              </div>
            );
          })}
        </div>

        {/* Add / Edit Form */}
        {showForm && (
          <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 12, padding: 28, marginBottom: 28 }}>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, marginBottom: 20 }}>
              {editId !== null ? 'Edit Application' : 'Add Application'}
            </h3>
            <div className="form-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 16 }}>
              {[
                { label: 'Company *', key: 'company', placeholder: 'e.g. Acme Corp' },
                { label: 'Role *', key: 'role', placeholder: 'e.g. Legal Operations Manager' },
                { label: 'Date Applied', key: 'dateApplied', type: 'date' },
              ].map(({ label, key, placeholder, type }) => (
                <div key={key}>
                  <label style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--muted)', display: 'block', marginBottom: 6 }}>{label}</label>
                  <input type={type || 'text'} placeholder={placeholder} value={form[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    style={{ width: '100%', border: '1px solid var(--border)', borderRadius: 6, padding: '10px 12px', fontSize: 13, background: '#faf7f2', outline: 'none', color: 'var(--ink)' }}
                  />
                </div>
              ))}
            </div>
            <div className="form-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--muted)', display: 'block', marginBottom: 6 }}>Work Type</label>
                <select value={form.workType} onChange={e => setForm(f => ({ ...f, workType: e.target.value }))}
                  style={{ width: '100%', border: '1px solid var(--border)', borderRadius: 6, padding: '10px 12px', fontSize: 13, background: '#faf7f2', color: 'var(--ink)', outline: 'none' }}>
                  {WORK_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--muted)', display: 'block', marginBottom: 6 }}>Compensation</label>
                <input type="text" placeholder="e.g. $120K–$150K" value={form.compensation}
                  onChange={e => setForm(f => ({ ...f, compensation: e.target.value }))}
                  style={{ width: '100%', border: '1px solid var(--border)', borderRadius: 6, padding: '10px 12px', fontSize: 13, background: '#faf7f2', outline: 'none', color: 'var(--ink)' }}
                />
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
                style={{ width: '100%', border: '1px solid var(--border)', borderRadius: 6, padding: '10px 12px', fontSize: 13, background: '#faf7f2', resize: 'vertical', outline: 'none', color: 'var(--ink)' }}
              />
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={handleSubmit} disabled={!form.company.trim() || !form.role.trim()}
                style={{ background: 'var(--ink)', color: 'var(--cream)', border: 'none', borderRadius: 6, padding: '11px 28px', fontSize: 14, fontWeight: 600, cursor: 'pointer', opacity: (!form.company.trim() || !form.role.trim()) ? 0.5 : 1 }}>
                {editId !== null ? 'Save Changes' : 'Add Application'}
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
                  {['Company', 'Role', 'Date', 'Type', 'Compensation', 'Status', 'Notes', ''].map(h => (
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
              {filterStatus !== 'All' ? 'Try a different filter.' : 'Add your first application or analyze a resume to get started.'}
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
