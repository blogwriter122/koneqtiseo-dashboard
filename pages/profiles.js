/**
 * pages/profiles.js — Profile Management
 * Create/edit/assign Chrome profiles for each platform account
 * Model A: profiles run on user's PC via launcher
 */

import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { api } from '../lib/api';

const PLATFORMS = [
  { id: 'claude', label: 'Claude.ai (writer)', round: null },
  { id: 'wordpress', label: 'WordPress (publisher)', round: null },
  { id: 'linkedin', label: 'LinkedIn', round: 1 },
  { id: 'reddit', label: 'Reddit', round: 1 },
  { id: 'medium', label: 'Medium', round: 1 },
  { id: 'twitter', label: 'Twitter / X', round: 1 },
  { id: 'pinterest', label: 'Pinterest', round: 1 },
  { id: 'facebook', label: 'Facebook', round: 1 },
  { id: 'quora', label: 'Quora', round: 1 },
  { id: 'blogger', label: 'Blogger', round: 2 },
  { id: 'tumblr', label: 'Tumblr', round: 2 },
  { id: 'wordpress_com', label: 'WordPress.com', round: 2 },
  { id: 'devto', label: 'Dev.to', round: 2 },
  { id: 'notion', label: 'Notion', round: 2 },
  { id: 'forum', label: 'Forum (niche)', round: null },
  { id: 'gbp', label: 'Google Business Profile', round: null },
];

export default function ProfilesPage() {
  const [profiles, setProfiles] = useState([]);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [filter, setFilter] = useState('all');
  const [form, setForm] = useState({
    name: '', platform: 'linkedin', browser_type: 'chrome', port: '',
    scope: 'global', round: '', site_id: '', daily_limit: 5, username: '',
  });

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const [p, s] = await Promise.all([
        api.getProfiles().catch(() => ({ profiles: [] })),
        api.sites().catch(() => []),
      ]);
      setProfiles(p.profiles || []);
      setSites(Array.isArray(s) ? s : (s.sites || []));
    } catch (_) {} finally { setLoading(false); }
  }

  async function addProfile() {
    if (!form.name || !form.platform) { alert('Name and platform required'); return; }
    try {
      await api.addProfile({
        ...form,
        round: form.round ? parseInt(form.round) : null,
        daily_limit: parseInt(form.daily_limit) || 5,
        port: form.port ? parseInt(form.port) : undefined,
      });
      setShowAdd(false);
      setForm({ name: '', platform: 'linkedin', browser_type: 'chrome', port: '', scope: 'global', round: '', site_id: '', daily_limit: 5, username: '' });
      load();
    } catch (e) { alert(e.message); }
  }

  async function deleteProfile(id) {
    if (!confirm('Delete this profile?')) return;
    await api.deleteProfile(id);
    load();
  }

  async function loginProfile(id) {
    try {
      const r = await api.loginProfile(id);
      alert(r.message || 'Login request sent to your launcher');
    } catch (e) { alert(e.message); }
  }

  async function toggleEnabled(p) {
    await api.updateProfile(p.id, { enabled: !p.enabled });
    load();
  }

  // When platform changes, auto-set round
  function onPlatformChange(platform) {
    const p = PLATFORMS.find(x => x.id === platform);
    setForm(f => ({ ...f, platform, round: p?.round ? String(p.round) : '' }));
  }

  const s = {
    page: { padding: '24px' },
    panel: { background: 'var(--panel)', borderRadius: '12px', padding: '20px', marginBottom: '16px' },
    tabs: { display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' },
    tab: (a) => ({ padding: '7px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: a ? 'var(--forge)' : 'var(--panel)', color: a ? 'white' : 'var(--text)', fontWeight: a ? '700' : '500', fontSize: '13px' }),
    btn: (c = 'var(--forge)') => ({ background: c, color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '13px' }),
    smBtn: (c = 'var(--forge)') => ({ background: c, color: 'white', border: 'none', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '11px' }),
    table: { width: '100%', borderCollapse: 'collapse', fontSize: '13px' },
    th: { background: 'var(--bg)', padding: '8px 12px', textAlign: 'left', fontWeight: '700', borderBottom: '2px solid var(--border)', fontSize: '11px', color: 'var(--text-faint)', textTransform: 'uppercase' },
    td: { padding: '10px 12px', borderBottom: '1px solid var(--border)', verticalAlign: 'middle' },
    input: { width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: '13px' },
    label: { fontSize: '12px', color: 'var(--text-faint)', fontWeight: '600', marginBottom: '4px', display: 'block' },
    field: { marginBottom: '12px' },
    badge: (st) => { const c = { active: '#00c853', warmup: '#ff9100', banned: '#f44336', idle: '#666' }; return { background: c[st] || '#444', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '700' }; },
    roundBadge: (r) => ({ background: r === 1 ? '#2979ff' : r === 2 ? '#e040fb' : '#555', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '700' }),
    modal: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '24px' },
    modalCard: { background: 'var(--panel)', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '460px', maxHeight: '90vh', overflowY: 'auto' },
    row2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  };

  const filtered = filter === 'all' ? profiles
    : filter === 'round1' ? profiles.filter(p => p.round === 1)
    : filter === 'round2' ? profiles.filter(p => p.round === 2)
    : profiles.filter(p => p.platform === filter);

  return (
    <Layout>
      <div style={s.page}>
        <div className="page-head">
          <div>
            <div className="page-title">🔐 Profiles</div>
            <div className="page-sub">Chrome profiles run on your PC via the launcher · assign accounts to sites & rounds</div>
          </div>
        </div>

        <div style={{ ...s.panel, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px' }}>
          <div style={{ fontSize: '13px', color: 'var(--text-faint)' }}>
            {profiles.length} profiles · {profiles.filter(p => p.login_status === 'logged_in').length} logged in · {profiles.filter(p => p.status === 'active').length} active
          </div>
          <button style={s.btn()} onClick={() => setShowAdd(true)}>+ Add Profile</button>
        </div>

        <div style={s.tabs}>
          {[['all', 'All'], ['round1', '🔵 Round 1 (Social)'], ['round2', '🟣 Round 2 (Web2)']].map(([id, label]) => (
            <button key={id} style={s.tab(filter === id)} onClick={() => setFilter(id)}>{label}</button>
          ))}
        </div>

        <div style={s.panel}>
          {loading ? <div className="empty">Loading...</div> : filtered.length === 0 ? (
            <div className="empty">
              No profiles yet.<br />
              <span style={{ fontSize: '13px', color: 'var(--text-faint)' }}>Add a profile, then use your launcher to log in the account.</span>
            </div>
          ) : (
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>Profile</th><th style={s.th}>Platform</th><th style={s.th}>Round</th>
                  <th style={s.th}>Scope</th><th style={s.th}>Port</th><th style={s.th}>Status</th>
                  <th style={s.th}>Login</th><th style={s.th}>Today</th><th style={s.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => {
                  const siteName = p.site_id ? (sites.find(s => s.id === p.site_id)?.url || 'site') : null;
                  return (
                    <tr key={p.id} style={{ opacity: p.enabled === false ? 0.5 : 1 }}>
                      <td style={{ ...s.td, fontWeight: '600' }}>{p.browser_profile || p.name}</td>
                      <td style={s.td}>{p.platform}</td>
                      <td style={s.td}>{p.round ? <span style={s.roundBadge(p.round)}>R{p.round}</span> : <span style={{ color: 'var(--text-faint)' }}>—</span>}</td>
                      <td style={s.td}>{p.scope === 'site' ? `📍 ${siteName}` : '🌐 Global'}</td>
                      <td style={{ ...s.td, fontFamily: 'monospace' }}>{p.port || '—'}</td>
                      <td style={s.td}><span style={s.badge(p.status)}>{p.status}</span></td>
                      <td style={s.td}>{p.login_status === 'logged_in' ? '✅' : '⚠️'}</td>
                      <td style={{ ...s.td, fontFamily: 'monospace' }}>{p.published_today || 0}/{p.daily_limit || 5}</td>
                      <td style={s.td}>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          <button style={s.smBtn('#00c853')} onClick={() => loginProfile(p.id)}>Login</button>
                          <button style={s.smBtn('#666')} onClick={() => toggleEnabled(p)}>{p.enabled === false ? 'On' : 'Off'}</button>
                          <button style={s.smBtn('#f44336')} onClick={() => deleteProfile(p.id)}>Del</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* How it works */}
        <div style={{ ...s.panel, background: 'rgba(108,71,255,0.05)', border: '1px solid rgba(108,71,255,0.2)' }}>
          <div style={{ fontWeight: '700', marginBottom: '8px' }}>How Profiles Work</div>
          <div style={{ fontSize: '13px', color: 'var(--text-faint)', lineHeight: '1.7' }}>
            1. Add a profile here (name, platform, round).<br />
            2. Open your <strong>Launcher</strong> on your PC → click the profile → log in the account manually.<br />
            3. The engine uses that logged-in profile to post — on <strong>your PC, your IP</strong>.<br />
            <strong>Round 1</strong> = social platforms (posted first). <strong>Round 2</strong> = web2 (links back to Round 1).<br />
            <strong>Global</strong> profiles serve all your sites. <strong>Site</strong> profiles are locked to one site.
          </div>
        </div>
      </div>

      {/* Add Profile Modal */}
      {showAdd && (
        <div style={s.modal} onClick={() => setShowAdd(false)}>
          <div style={s.modalCard} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: '18px', fontWeight: '800', marginBottom: '20px' }}>Add Profile</div>

            <div style={s.field}>
              <label style={s.label}>Profile Name</label>
              <input style={s.input} placeholder="linkedin-1" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>

            <div style={s.row2}>
              <div style={s.field}>
                <label style={s.label}>Platform</label>
                <select style={s.input} value={form.platform} onChange={e => onPlatformChange(e.target.value)}>
                  {PLATFORMS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                </select>
              </div>
              <div style={s.field}>
                <label style={s.label}>Browser</label>
                <select style={s.input} value={form.browser_type} onChange={e => setForm(f => ({ ...f, browser_type: e.target.value }))}>
                  <option value="chrome">Chrome</option>
                  <option value="adspower">AdsPower</option>
                  <option value="ixbrowser">iX Browser</option>
                </select>
              </div>
            </div>

            <div style={s.field}>
              <label style={s.label}>Username / Email (optional)</label>
              <input style={s.input} placeholder="account@email.com" value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} />
            </div>

            <div style={s.row2}>
              <div style={s.field}>
                <label style={s.label}>Round</label>
                <select style={s.input} value={form.round} onChange={e => setForm(f => ({ ...f, round: e.target.value }))}>
                  <option value="">Any</option>
                  <option value="1">Round 1 (Social)</option>
                  <option value="2">Round 2 (Web2)</option>
                </select>
              </div>
              <div style={s.field}>
                <label style={s.label}>Daily Limit</label>
                <input style={s.input} type="number" value={form.daily_limit} onChange={e => setForm(f => ({ ...f, daily_limit: e.target.value }))} />
              </div>
            </div>

            <div style={s.field}>
              <label style={s.label}>Scope</label>
              <select style={s.input} value={form.scope} onChange={e => setForm(f => ({ ...f, scope: e.target.value }))}>
                <option value="global">🌐 Global (all sites)</option>
                <option value="site">📍 Specific site</option>
              </select>
            </div>

            {form.scope === 'site' && (
              <div style={s.field}>
                <label style={s.label}>Site</label>
                <select style={s.input} value={form.site_id} onChange={e => setForm(f => ({ ...f, site_id: e.target.value }))}>
                  <option value="">Select site</option>
                  {sites.map(s => <option key={s.id} value={s.id}>{s.url || s.name}</option>)}
                </select>
              </div>
            )}

            <div style={s.field}>
              <label style={s.label}>Debug Port (auto if empty)</label>
              <input style={s.input} type="number" placeholder="auto" value={form.port} onChange={e => setForm(f => ({ ...f, port: e.target.value }))} />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
              <button style={{ ...s.btn(), flex: 1 }} onClick={addProfile}>Create Profile</button>
              <button style={{ ...s.btn('#444'), flex: 1 }} onClick={() => setShowAdd(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
