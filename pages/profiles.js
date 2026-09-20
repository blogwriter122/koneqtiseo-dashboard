/**
 * pages/profiles.js — Browser Profiles (koneqti.com model)
 *
 * A profile = ONE Chrome browser identity.
 * You log MULTIPLE accounts inside ONE profile (LinkedIn + Reddit + Claude together).
 * Profiles run in PARALLEL and serve ANY site.
 * Use an existing Chrome folder OR let the launcher create one.
 */

import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { api } from '../lib/api';

// Platforms you might log into inside a profile
const PLATFORMS = ['claude', 'wordpress', 'linkedin', 'reddit', 'medium', 'twitter', 'pinterest', 'facebook', 'quora', 'blogger', 'tumblr', 'wordpress_com', 'devto', 'notion', 'forum', 'gbp'];

export default function ProfilesPage() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', browser_type: 'chrome', dir: '', port: '', ads_power_id: '', ix_profile_id: '' });

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const p = await api.getProfiles().catch(() => ({ profiles: [] }));
      setProfiles(p.profiles || []);
    } catch (_) {} finally { setLoading(false); }
  }

  async function addProfile() {
    if (!form.name) { alert('Profile name required'); return; }
    try {
      await api.addProfile({ ...form, port: form.port ? parseInt(form.port) : undefined });
      setShowAdd(false);
      setForm({ name: '', browser_type: 'chrome', dir: '', port: '', ads_power_id: '', ix_profile_id: '' });
      load();
    } catch (e) { alert(e.message); }
  }

  async function deleteProfile(id) {
    if (!confirm('Delete this profile? (does not delete the Chrome folder on your PC)')) return;
    await api.deleteProfile(id);
    load();
  }

  async function openProfile(id) {
    try {
      const r = await api.openProfile(id);
      alert(r.message || 'Open request sent to your launcher — check your launcher app');
    } catch (e) { alert(e.message); }
  }

  async function toggleEnabled(p) {
    await api.updateProfile(p.id, { enabled: !p.enabled });
    load();
  }

  const s = {
    page: { padding: '24px' },
    panel: { background: 'var(--panel)', borderRadius: '12px', padding: '20px', marginBottom: '16px' },
    btn: (c = 'var(--forge)') => ({ background: c, color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '13px' }),
    smBtn: (c = 'var(--forge)') => ({ background: c, color: 'white', border: 'none', padding: '4px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '11px' }),
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' },
    card: { background: 'var(--panel)', borderRadius: '12px', padding: '18px', border: '1px solid var(--border)' },
    input: { width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: '13px' },
    label: { fontSize: '12px', color: 'var(--text-faint)', fontWeight: '600', marginBottom: '4px', display: 'block' },
    field: { marginBottom: '12px' },
    badge: (st) => { const c = { idle: '#666', open: '#00c853', busy: '#2979ff' }; return { background: c[st] || '#444', color: 'white', padding: '2px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '700' }; },
    chip: { display: 'inline-block', background: 'var(--bg)', color: 'var(--text-faint)', padding: '2px 10px', borderRadius: '12px', fontSize: '11px', marginRight: '4px', marginBottom: '4px', border: '1px solid var(--border)' },
    modal: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '24px' },
    modalCard: { background: 'var(--panel)', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '440px', maxHeight: '90vh', overflowY: 'auto' },
  };

  return (
    <Layout>
      <div style={s.page}>
        <div className="page-head">
          <div>
            <div className="page-title">🔐 Browser Profiles</div>
            <div className="page-sub">Each profile is one Chrome identity · log multiple accounts inside · profiles run in parallel on your PC</div>
          </div>
        </div>

        <div style={{ ...s.panel, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px' }}>
          <div style={{ fontSize: '13px', color: 'var(--text-faint)' }}>
            {profiles.length} profiles · {profiles.filter(p => p.enabled !== false).length} enabled
          </div>
          <button style={s.btn()} onClick={() => setShowAdd(true)}>+ Add Profile</button>
        </div>

        {loading ? (
          <div style={s.panel}><div className="empty">Loading...</div></div>
        ) : profiles.length === 0 ? (
          <div style={s.panel}>
            <div className="empty">
              No profiles yet.<br />
              <span style={{ fontSize: '13px', color: 'var(--text-faint)' }}>Add a profile → open it in your launcher → log into your accounts inside it.</span>
            </div>
          </div>
        ) : (
          <div style={s.grid}>
            {profiles.map(p => (
              <div key={p.id} style={{ ...s.card, opacity: p.enabled === false ? 0.5 : 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ fontSize: '16px', fontWeight: '800' }}>{p.name}</div>
                  <span style={s.badge(p.status)}>{p.status || 'idle'}</span>
                </div>

                <div style={{ fontSize: '12px', color: 'var(--text-faint)', marginBottom: '10px' }}>
                  {p.browser_type === 'chrome' ? '🌐 Chrome' : p.browser_type === 'adspower' ? '🅰️ AdsPower' : '🦊 iX Browser'}
                  {p.port && <span style={{ fontFamily: 'monospace', marginLeft: '8px' }}>:{p.port}</span>}
                </div>

                {/* Logged-in accounts */}
                <div style={{ marginBottom: '12px', minHeight: '28px' }}>
                  {(p.logged_accounts && p.logged_accounts.length > 0) ? (
                    p.logged_accounts.map(a => <span key={a} style={s.chip}>✓ {a}</span>)
                  ) : (
                    <span style={{ fontSize: '12px', color: 'var(--text-faint)' }}>No accounts logged in yet</span>
                  )}
                </div>

                {p.dir && <div style={{ fontSize: '10px', color: 'var(--text-faint)', fontFamily: 'monospace', marginBottom: '10px', wordBreak: 'break-all' }}>{p.dir}</div>}

                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  <button style={s.smBtn('#00c853')} onClick={() => openProfile(p.id)}>Open & Login</button>
                  <button style={s.smBtn('#666')} onClick={() => toggleEnabled(p)}>{p.enabled === false ? 'Enable' : 'Disable'}</button>
                  <button style={s.smBtn('#f44336')} onClick={() => deleteProfile(p.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* How it works */}
        <div style={{ ...s.panel, background: 'rgba(108,71,255,0.05)', border: '1px solid rgba(108,71,255,0.2)', marginTop: '16px' }}>
          <div style={{ fontWeight: '700', marginBottom: '8px' }}>How Profiles Work</div>
          <div style={{ fontSize: '13px', color: 'var(--text-faint)', lineHeight: '1.7' }}>
            A <strong>profile</strong> is one Chrome browser on your PC. You log <strong>multiple accounts inside one profile</strong> — e.g. LinkedIn + Reddit + Claude all in "profile-1".<br />
            More profiles = more parallel work (write/post faster). Any profile can work on any site.<br />
            <strong>To set up:</strong> Add a profile → click "Open & Login" → your launcher opens that Chrome → log into your accounts → close it. Sessions are saved.<br />
            You can point to an <strong>existing Chrome folder</strong> or let the launcher create a fresh one.
          </div>
        </div>
      </div>

      {/* Add Profile Modal */}
      {showAdd && (
        <div style={s.modal} onClick={() => setShowAdd(false)}>
          <div style={s.modalCard} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: '18px', fontWeight: '800', marginBottom: '6px' }}>Add Profile</div>
            <div style={{ fontSize: '12px', color: 'var(--text-faint)', marginBottom: '20px' }}>One Chrome identity — you'll log accounts into it after.</div>

            <div style={s.field}>
              <label style={s.label}>Profile Name</label>
              <input style={s.input} placeholder="profile-1" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>

            <div style={s.field}>
              <label style={s.label}>Browser Type</label>
              <select style={s.input} value={form.browser_type} onChange={e => setForm(f => ({ ...f, browser_type: e.target.value }))}>
                <option value="chrome">Chrome (create/use folder)</option>
                <option value="adspower">AdsPower</option>
                <option value="ixbrowser">iX Browser</option>
              </select>
            </div>

            {form.browser_type === 'chrome' && (
              <div style={s.field}>
                <label style={s.label}>Existing Chrome folder (optional — leave empty to auto-create)</label>
                <input style={s.input} placeholder="C:\Users\You\koneqti-profiles\profile-1" value={form.dir} onChange={e => setForm(f => ({ ...f, dir: e.target.value }))} />
                <div style={{ fontSize: '11px', color: 'var(--text-faint)', marginTop: '4px' }}>Empty = launcher creates a fresh profile folder automatically</div>
              </div>
            )}

            {form.browser_type === 'adspower' && (
              <div style={s.field}>
                <label style={s.label}>AdsPower Profile ID</label>
                <input style={s.input} placeholder="k1abc123" value={form.ads_power_id} onChange={e => setForm(f => ({ ...f, ads_power_id: e.target.value }))} />
              </div>
            )}

            {form.browser_type === 'ixbrowser' && (
              <div style={s.field}>
                <label style={s.label}>iX Browser Profile ID</label>
                <input style={s.input} placeholder="12345" value={form.ix_profile_id} onChange={e => setForm(f => ({ ...f, ix_profile_id: e.target.value }))} />
              </div>
            )}

            <div style={s.field}>
              <label style={s.label}>Debug Port (auto if empty)</label>
              <input style={s.input} type="number" placeholder="auto" value={form.port} onChange={e => setForm(f => ({ ...f, port: e.target.value }))} />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
              <button style={{ ...s.btn(), flex: 1 }} onClick={addProfile}>Create</button>
              <button style={{ ...s.btn('#444'), flex: 1 }} onClick={() => setShowAdd(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
