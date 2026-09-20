/**
 * pages/reach/accounts.js — Platform Accounts + Assignment
 *
 * An account = a platform login (LinkedIn, Reddit...) that:
 *   - lives INSIDE a profile (browser)
 *   - is assigned to site(s) (global or specific)
 *   - has a round (1 social / 2 web2) for the off-page strategy
 *
 * Multiple accounts share one profile → parallel work.
 */

import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { api } from '../../lib/api';

const PLATFORMS = [
  { id: 'linkedin', label: 'LinkedIn', round: 1 },
  { id: 'reddit', label: 'Reddit', round: 1 },
  { id: 'medium', label: 'Medium', round: 1 },
  { id: 'twitter', label: 'Twitter / X', round: 1 },
  { id: 'pinterest', label: 'Pinterest', round: 1 },
  { id: 'facebook', label: 'Facebook', round: 1 },
  { id: 'instagram', label: 'Instagram', round: 1 },
  { id: 'threads', label: 'Threads', round: 1 },
  { id: 'bluesky', label: 'Bluesky', round: 1 },
  { id: 'quora', label: 'Quora', round: 1 },
  { id: 'blogger', label: 'Blogger', round: 2 },
  { id: 'wordpress_com', label: 'WordPress.com', round: 2 },
  { id: 'devto', label: 'Dev.to', round: 2 },
  { id: 'tumblr', label: 'Tumblr', round: 2 },
  { id: 'notion', label: 'Notion', round: 2 },
  { id: 'hubpages', label: 'HubPages', round: 2 },
  { id: 'scribd', label: 'Scribd', round: 2 },
  { id: 'slideshare', label: 'SlideShare', round: 2 },
  { id: 'forum', label: 'Forum (niche)', round: null },
];

export default function AccountsPage() {
  const [accounts, setAccounts] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [filter, setFilter] = useState('all');
  const [form, setForm] = useState({
    platform: 'linkedin', username: '', profile_id: '', scope: 'global', site_id: '', round: '1', daily_limit: 5,
  });

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const [a, p, s] = await Promise.all([
        api.accounts().catch(() => []),
        api.getProfiles().catch(() => ({ profiles: [] })),
        api.sites().catch(() => []),
      ]);
      setAccounts(Array.isArray(a) ? a : (a.accounts || []));
      setProfiles(p.profiles || []);
      setSites(Array.isArray(s) ? s : (s.sites || []));
    } catch (_) {} finally { setLoading(false); }
  }

  function onPlatformChange(platform) {
    const p = PLATFORMS.find(x => x.id === platform);
    setForm(f => ({ ...f, platform, round: p?.round ? String(p.round) : '' }));
  }

  async function addAccount() {
    if (!form.platform || !form.profile_id) { alert('Platform and profile required'); return; }
    try {
      await api.addAccount({
        platform: form.platform,
        username: form.username || null,
        profile_id: form.profile_id,
        scope: form.scope,
        site_id: form.scope === 'site' ? form.site_id : null,
        round: form.round ? parseInt(form.round) : null,
        daily_limit: parseInt(form.daily_limit) || 5,
        status: 'warmup',
        warmup_day: 1,
        published_today: 0,
        enabled: true,
      });
      setShowAdd(false);
      setForm({ platform: 'linkedin', username: '', profile_id: '', scope: 'global', site_id: '', round: '1', daily_limit: 5 });
      load();
    } catch (e) { alert(e.message); }
  }

  async function deleteAccount(id) {
    if (!confirm('Delete this account?')) return;
    await api.deleteAccount(id);
    load();
  }

  async function toggleEnabled(a) {
    await api.updateAccount(a.id, { enabled: !a.enabled });
    load();
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
    row2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
    badge: (st) => { const c = { active: '#00c853', warmup: '#ff9100', banned: '#f44336' }; return { background: c[st] || '#444', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '700' }; },
    roundBadge: (r) => ({ background: r === 1 ? '#2979ff' : r === 2 ? '#e040fb' : '#555', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '700' }),
    modal: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '24px' },
    modalCard: { background: 'var(--panel)', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '460px', maxHeight: '90vh', overflowY: 'auto' },
    stat: { background: 'var(--bg)', borderRadius: '10px', padding: '16px', textAlign: 'center', border: '1px solid var(--border)' },
  };

  const filtered = filter === 'all' ? accounts
    : filter === 'round1' ? accounts.filter(a => a.round === 1)
    : filter === 'round2' ? accounts.filter(a => a.round === 2)
    : accounts.filter(a => a.status === filter);

  const profileName = (id) => profiles.find(p => p.id === id)?.name || '—';
  const siteName = (id) => sites.find(s => s.id === id)?.url || 'site';

  return (
    <Layout>
      <div style={s.page}>
        <div className="page-head">
          <div>
            <div className="page-title">◉ Accounts</div>
            <div className="page-sub">Platform logins assigned to profiles + sites · Round 1 social, Round 2 web2</div>
          </div>
        </div>

        <div className="grid grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '16px' }}>
          <div style={s.stat}><div style={{ fontSize: '24px', fontWeight: '800' }}>{accounts.length}</div><div style={{ fontSize: '12px', color: 'var(--text-faint)' }}>Total</div></div>
          <div style={s.stat}><div style={{ fontSize: '24px', fontWeight: '800', color: '#00c853' }}>{accounts.filter(a => a.status === 'active').length}</div><div style={{ fontSize: '12px', color: 'var(--text-faint)' }}>Active</div></div>
          <div style={s.stat}><div style={{ fontSize: '24px', fontWeight: '800', color: '#2979ff' }}>{accounts.filter(a => a.round === 1).length}</div><div style={{ fontSize: '12px', color: 'var(--text-faint)' }}>Round 1</div></div>
          <div style={s.stat}><div style={{ fontSize: '24px', fontWeight: '800', color: '#e040fb' }}>{accounts.filter(a => a.round === 2).length}</div><div style={{ fontSize: '12px', color: 'var(--text-faint)' }}>Round 2</div></div>
        </div>

        <div style={{ ...s.panel, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px' }}>
          <div style={s.tabs}>
            {[['all', 'All'], ['round1', '🔵 Round 1'], ['round2', '🟣 Round 2'], ['active', 'Active'], ['warmup', 'Warmup']].map(([id, label]) => (
              <button key={id} style={s.tab(filter === id)} onClick={() => setFilter(id)}>{label}</button>
            ))}
          </div>
          <button style={s.btn()} onClick={() => setShowAdd(true)} disabled={profiles.length === 0}>+ Add Account</button>
        </div>

        {profiles.length === 0 && (
          <div style={{ ...s.panel, background: 'rgba(255,145,0,0.08)', border: '1px solid rgba(255,145,0,0.2)' }}>
            <div style={{ fontSize: '13px', color: '#ff9100' }}>⚠️ Create a <a href="/profiles" style={{ color: '#ff9100', fontWeight: '700' }}>profile</a> first — accounts must live inside a profile.</div>
          </div>
        )}

        <div style={s.panel}>
          {loading ? <div className="empty">Loading...</div> : filtered.length === 0 ? (
            <div className="empty">No accounts yet. Add an account and assign it to a profile + site.</div>
          ) : (
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>Platform</th><th style={s.th}>Username</th><th style={s.th}>Profile</th>
                  <th style={s.th}>Round</th><th style={s.th}>Assigned To</th><th style={s.th}>Status</th>
                  <th style={s.th}>Today</th><th style={s.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(a => (
                  <tr key={a.id} style={{ opacity: a.enabled === false ? 0.5 : 1 }}>
                    <td style={{ ...s.td, fontWeight: '600' }}>{a.platform}</td>
                    <td style={{ ...s.td, fontFamily: 'monospace', fontSize: '12px' }}>{a.username || '—'}</td>
                    <td style={s.td}>🔐 {profileName(a.profile_id)}</td>
                    <td style={s.td}>{a.round ? <span style={s.roundBadge(a.round)}>R{a.round}</span> : '—'}</td>
                    <td style={s.td}>{a.scope === 'site' ? `📍 ${siteName(a.site_id)}` : '🌐 All sites'}</td>
                    <td style={s.td}><span style={s.badge(a.status)}>{a.status}</span>{a.status === 'warmup' && <span style={{ fontSize: '10px', color: 'var(--text-faint)', marginLeft: '4px' }}>d{a.warmup_day || 1}</span>}</td>
                    <td style={{ ...s.td, fontFamily: 'monospace' }}>{a.published_today || 0}/{a.daily_limit || 5}</td>
                    <td style={s.td}>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button style={s.smBtn('#666')} onClick={() => toggleEnabled(a)}>{a.enabled === false ? 'On' : 'Off'}</button>
                        <button style={s.smBtn('#f44336')} onClick={() => deleteAccount(a.id)}>Del</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add Account Modal */}
      {showAdd && (
        <div style={s.modal} onClick={() => setShowAdd(false)}>
          <div style={s.modalCard} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: '18px', fontWeight: '800', marginBottom: '6px' }}>Add Account</div>
            <div style={{ fontSize: '12px', color: 'var(--text-faint)', marginBottom: '20px' }}>Assign a platform login to a profile + site.</div>

            <div style={s.row2}>
              <div style={s.field}>
                <label style={s.label}>Platform</label>
                <select style={s.input} value={form.platform} onChange={e => onPlatformChange(e.target.value)}>
                  {PLATFORMS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                </select>
              </div>
              <div style={s.field}>
                <label style={s.label}>Round</label>
                <select style={s.input} value={form.round} onChange={e => setForm(f => ({ ...f, round: e.target.value }))}>
                  <option value="">Any</option>
                  <option value="1">Round 1 (Social)</option>
                  <option value="2">Round 2 (Web2)</option>
                </select>
              </div>
            </div>

            <div style={s.field}>
              <label style={s.label}>Username / Email (optional)</label>
              <input style={s.input} placeholder="account@email.com" value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} />
            </div>

            <div style={s.field}>
              <label style={s.label}>Profile (which browser it lives in) *</label>
              <select style={s.input} value={form.profile_id} onChange={e => setForm(f => ({ ...f, profile_id: e.target.value }))}>
                <option value="">Select profile</option>
                {profiles.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>

            <div style={s.field}>
              <label style={s.label}>Assign to</label>
              <select style={s.input} value={form.scope} onChange={e => setForm(f => ({ ...f, scope: e.target.value }))}>
                <option value="global">🌐 All my sites</option>
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
              <label style={s.label}>Daily Limit</label>
              <input style={s.input} type="number" value={form.daily_limit} onChange={e => setForm(f => ({ ...f, daily_limit: e.target.value }))} />
              <div style={{ fontSize: '11px', color: 'var(--text-faint)', marginTop: '4px' }}>Warmup auto-ramps: week 1 = 1/day, week 2 = 2/day, week 3+ = full limit</div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
              <button style={{ ...s.btn(), flex: 1 }} onClick={addAccount}>Add Account</button>
              <button style={{ ...s.btn('#444'), flex: 1 }} onClick={() => setShowAdd(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
