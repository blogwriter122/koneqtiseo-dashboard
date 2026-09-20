/**
 * pages/campaign.js — Campaign Dashboard
 *
 * Manages full SEO campaigns:
 *   - New site campaigns (Phase 0→5)
 *   - Existing site campaigns (audit → fix → grow)
 *   - Real business local SEO campaigns
 *
 * Features:
 *   - Campaign progress tracker (Phase 0-5)
 *   - Human-fix report viewer
 *   - 301 redirect manager
 *   - Site health score
 *
 * MASTER_PLAN §16
 */

import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { api, fetchers } from '../lib/api';

const PHASES = [
  { num: 0, label: 'Audit', icon: '🔍', desc: 'Technical crawl + GSC analysis' },
  { num: 1, label: 'Research', icon: '📊', desc: 'Keywords + battle plan' },
  { num: 2, label: 'Content', icon: '✍️', desc: 'Write + publish batch' },
  { num: 3, label: 'Off-Page', icon: '🔗', desc: 'Cross-link + web2 + brand' },
  { num: 4, label: 'Indexing', icon: '📡', desc: 'Submit + verify indexation' },
  { num: 5, label: 'Monitor', icon: '📈', desc: 'Weekly GSC + backlinks' },
];

const CAMPAIGN_MODES = [
  { value: 'new_site',      label: '🆕 New Site',      desc: 'Find niche → build → write all → grow (day by day)', needsNiche: true },
  { value: 'grow_existing', label: '📈 Grow Existing',  desc: 'Audit → fix → improve → fill gaps → offpage → monitor' },
  { value: 'audit_fix',     label: '🔧 Audit + Fix',    desc: 'Crawl → auto-fix → human report (one-time)' },
  { value: 'offpage_only',  label: '🔗 Off-Page Only',  desc: 'Just backlinks — 2-round + directories + forums' },
  { value: 'write_only',    label: '✍️ Write Articles',  desc: 'Full 8-step quality pipeline → publish auto' },
  { value: 'parasite',      label: '🦠 Parasite Engine', desc: 'Auto keywords + trends → 16 platforms (continuous)' },
];

const NICHE_TYPES = [
  { value: 'affiliate', label: 'Affiliate (Amazon/merchant)' },
  { value: 'apk',       label: 'APK / App download' },
  { value: 'menu',      label: 'Menu / Restaurant' },
  { value: 'tool',      label: 'Tool + Info (AI-proof)' },
  { value: 'info',      label: 'Info / Guide' },
  { value: 'ecommerce', label: 'Ecommerce' },
  { value: 'rank_rent', label: 'Local Rank & Rent' },
];

export default function CampaignPage() {
  const [sites, setSites] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [selectedSite, setSelectedSite] = useState('');
  const [mode, setMode] = useState('new_site');
  const [nicheType, setNicheType] = useState('affiliate');
  const [keywords, setKeywords] = useState('');       // write_only
  const [targetUrls, setTargetUrls] = useState('');   // offpage_only
  const [highQuality, setHighQuality] = useState(false);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('campaigns'); // campaigns | redirects | human-fix
  const [redirects, setRedirects] = useState([]);
  const [newRedirect, setNewRedirect] = useState({ from: '', to: '', type: '301' });
  const [humanReport, setHumanReport] = useState(null);

  useEffect(() => {
    fetchers.sites().then(setSites);
    loadCampaigns();
  }, []);

  async function loadCampaigns() {
    try {
      const { data } = await import('../lib/api').then(m => m.supabase
        .from('jobs')
        .select('*')
        .eq('type', 'campaign')
        .order('created_at', { ascending: false })
        .limit(20)
      );
      setCampaigns(data || []);
    } catch (_) {}
  }

  async function startCampaign() {
    if (!selectedSite) { alert('Select a site first'); return; }
    if (mode === 'write_only' && !keywords.trim()) { alert('Enter keywords to write'); return; }
    setLoading(true);
    setLogs([`Starting ${mode} campaign...`]);
    try {
      const options = { mode, country: 'US', language: 'english' };
      if (mode === 'new_site') options.nicheType = nicheType;
      if (mode === 'write_only') {
        options.keywords = keywords.split('\n').map(k => k.trim()).filter(Boolean);
        options.highQuality = highQuality;
      }
      if (mode === 'offpage_only') {
        options.targetPages = targetUrls.split('\n').map(u => u.trim()).filter(Boolean);
      }
      const result = await api.startCampaign({ siteId: selectedSite, options });
      setLogs(prev => [...prev, `✅ Campaign started: ID ${result.campaignId}`, `Flow: ${(result.flow || []).join(' → ')}`]);
      loadCampaigns();
    } catch (e) {
      setLogs(prev => [...prev, `❌ Error: ${e.message}`]);
    } finally { setLoading(false); }
  }

  async function addRedirect() {
    if (!newRedirect.from || !newRedirect.to) return;
    setRedirects(prev => [...prev, { ...newRedirect, id: Date.now() }]);
    setNewRedirect({ from: '', to: '', type: '301' });
  }

  const s = {
    page: { padding: '24px' },
    tabs: { display: 'flex', gap: '8px', marginBottom: '20px' },
    tab: (active) => ({ padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: active ? 'var(--forge)' : 'var(--panel)', color: active ? 'white' : 'var(--text)', fontWeight: active ? '700' : '400' }),
    panel: { background: 'var(--panel)', borderRadius: '12px', padding: '20px', marginBottom: '16px' },
    row: { display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-start' },
    label: { fontSize: '12px', color: 'var(--text-faint)', fontWeight: '600', marginBottom: '4px', display: 'block' },
    select: { width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: '14px' },
    input: { width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: '14px' },
    btn: (color = 'var(--forge)') => ({ background: color, color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '14px' }),
    btnSm: { background: 'var(--panel)', color: 'var(--text)', border: '1px solid var(--border)', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' },
    phaseBar: { display: 'flex', gap: '4px', marginBottom: '8px' },
    phaseStep: (active, done) => ({ flex: 1, padding: '8px 4px', borderRadius: '6px', textAlign: 'center', fontSize: '11px', background: done ? '#00c853' : active ? 'var(--forge)' : 'var(--bg)', color: done || active ? 'white' : 'var(--text-faint)', border: '1px solid var(--border)' }),
    logBox: { background: '#0d1117', borderRadius: '8px', padding: '12px', maxHeight: '120px', overflowY: 'auto', fontFamily: 'monospace', fontSize: '12px', color: '#7ee787' },
    table: { width: '100%', borderCollapse: 'collapse', fontSize: '13px' },
    th: { background: 'var(--bg)', padding: '8px 12px', textAlign: 'left', fontWeight: '700', borderBottom: '2px solid var(--border)' },
    td: { padding: '8px 12px', borderBottom: '1px solid var(--border)' },
    badge: (color) => ({ background: color, color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '700' }),
  };

  return (
    <Layout>
      <div style={s.page}>
        <div className="page-head">
          <div>
            <div className="page-title">🚀 Campaigns</div>
            <div className="page-sub">Full SEO campaigns — new site, existing site, real business</div>
          </div>
        </div>

        <div style={s.tabs}>
          {[['campaigns', '🚀 Campaigns'], ['redirects', '↩️ 301 Redirects'], ['human-fix', '🔧 Human Fix List']].map(([tab, label]) => (
            <button key={tab} style={s.tab(activeTab === tab)} onClick={() => setActiveTab(tab)}>{label}</button>
          ))}
        </div>

        {/* ── CAMPAIGNS TAB ── */}
        {activeTab === 'campaigns' && (
          <>
            {/* Start New Campaign */}
            <div style={s.panel}>
              <div style={{ fontWeight: '700', marginBottom: '16px' }}>Start New Campaign</div>

              {/* Mode selector */}
              <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
                {CAMPAIGN_MODES.map(m => (
                  <button key={m.value} onClick={() => setMode(m.value)} style={{
                    padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', textAlign: 'left',
                    border: `2px solid ${mode === m.value ? 'var(--forge)' : 'var(--border)'}`,
                    background: mode === m.value ? 'rgba(var(--forge-rgb),0.1)' : 'transparent',
                  }}>
                    <div style={{ fontWeight: '700' }}>{m.label}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-faint)' }}>{m.desc}</div>
                  </button>
                ))}
              </div>

              <div style={s.row}>
                <div style={{ flex: 2 }}>
                  <label style={s.label}>Select Site</label>
                  <select style={s.select} value={selectedSite} onChange={e => setSelectedSite(e.target.value)}>
                    <option value="">-- choose site --</option>
                    {sites.map(s => <option key={s.id} value={s.id}>{s.url || s.name}</option>)}
                  </select>
                </div>
                {mode === 'new_site' && (
                  <div style={{ flex: 2 }}>
                    <label style={s.label}>Niche Type</label>
                    <select style={s.select} value={nicheType} onChange={e => setNicheType(e.target.value)}>
                      {NICHE_TYPES.map(n => <option key={n.value} value={n.value}>{n.label}</option>)}
                    </select>
                  </div>
                )}
                <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end' }}>
                  <button style={s.btn()} onClick={startCampaign} disabled={loading}>
                    {loading ? '⏳ Starting...' : '🚀 Start Campaign'}
                  </button>
                </div>
              </div>

              {/* write_only: keyword input */}
              {mode === 'write_only' && (
                <div style={{ marginTop: '16px' }}>
                  <label style={s.label}>Keywords (one per line) — full 8-step pipeline, publishes auto</label>
                  <textarea
                    style={{ width: '100%', minHeight: '100px', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: '13px', fontFamily: 'monospace' }}
                    placeholder={"best coffee maker under 100\nhow to clean espresso machine\ncoffee grinder vs blender"}
                    value={keywords}
                    onChange={e => setKeywords(e.target.value)}
                  />
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px', fontSize: '13px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={highQuality} onChange={e => setHighQuality(e.target.checked)} />
                    High-quality mode (claim verification + section-by-section — for money pages)
                  </label>
                </div>
              )}

              {/* offpage_only: target URLs */}
              {mode === 'offpage_only' && (
                <div style={{ marginTop: '16px' }}>
                  <label style={s.label}>Target Pages to build links to (one URL per line)</label>
                  <textarea
                    style={{ width: '100%', minHeight: '80px', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: '13px', fontFamily: 'monospace' }}
                    placeholder={"https://client-site.com/services/leak-repair\nhttps://client-site.com/emergency-plumber"}
                    value={targetUrls}
                    onChange={e => setTargetUrls(e.target.value)}
                  />
                </div>
              )}

              {/* Dynamic flow for selected mode */}
              <div style={{ marginTop: '16px' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-faint)', marginBottom: '8px' }}>
                  {CAMPAIGN_MODES.find(m => m.value === mode)?.label} flow:
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text)', lineHeight: '1.6' }}>
                  {CAMPAIGN_MODES.find(m => m.value === mode)?.desc}
                </div>
              </div>

              {logs.length > 0 && <div style={{ ...s.logBox, marginTop: '12px' }}>{logs.map((l, i) => <div key={i}>{l}</div>)}</div>}
            </div>

            {/* Active campaigns */}
            {campaigns.length > 0 && (
              <div style={s.panel}>
                <div style={{ fontWeight: '700', marginBottom: '16px' }}>Active Campaigns ({campaigns.length})</div>
                <table style={s.table}>
                  <thead>
                    <tr>
                      <th style={s.th}>ID</th>
                      <th style={s.th}>Site</th>
                      <th style={s.th}>Mode</th>
                      <th style={s.th}>Phase</th>
                      <th style={s.th}>Status</th>
                      <th style={s.th}>Started</th>
                    </tr>
                  </thead>
                  <tbody>
                    {campaigns.map(c => (
                      <tr key={c.id}>
                        <td style={s.td}>{c.id?.slice(0, 8)}...</td>
                        <td style={s.td}>{c.site_id?.slice(0, 8)}...</td>
                        <td style={s.td}>{c.payload?.mode || 'new_site'}</td>
                        <td style={s.td}>
                          <div style={s.phaseBar}>
                            {PHASES.map(p => (
                              <div key={p.num} style={s.phaseStep(
                                p.num === (c.payload?.currentPhase || 0),
                                p.num < (c.payload?.currentPhase || 0)
                              )}>
                                {p.icon}
                              </div>
                            ))}
                          </div>
                        </td>
                        <td style={s.td}>
                          <span style={s.badge(c.status === 'running' ? '#00c853' : c.status === 'blocked' ? '#f44336' : '#666')}>
                            {c.status}
                          </span>
                        </td>
                        <td style={s.td} className="text-faint">{new Date(c.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* ── 301 REDIRECTS TAB ── */}
        {activeTab === 'redirects' && (
          <div style={s.panel}>
            <div style={{ fontWeight: '700', marginBottom: '16px' }}>301 Redirect Manager</div>
            <div style={{ fontSize: '13px', color: 'var(--text-faint)', marginBottom: '16px' }}>
              Add redirects here → system exports as .htaccess or Nginx rules + updates WordPress
            </div>

            {/* Add redirect */}
            <div style={{ ...s.row, marginBottom: '16px' }}>
              <div style={{ flex: 2 }}>
                <label style={s.label}>From URL (old)</label>
                <input style={s.input} placeholder="/old-page-slug" value={newRedirect.from} onChange={e => setNewRedirect(p => ({ ...p, from: e.target.value }))} />
              </div>
              <div style={{ flex: 2 }}>
                <label style={s.label}>To URL (new)</label>
                <input style={s.input} placeholder="/new-page-slug or https://..." value={newRedirect.to} onChange={e => setNewRedirect(p => ({ ...p, to: e.target.value }))} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={s.label}>Type</label>
                <select style={s.select} value={newRedirect.type} onChange={e => setNewRedirect(p => ({ ...p, type: e.target.value }))}>
                  <option value="301">301 Permanent</option>
                  <option value="302">302 Temporary</option>
                </select>
              </div>
              <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end' }}>
                <button style={s.btn()} onClick={addRedirect}>Add</button>
              </div>
            </div>

            {/* Redirect list */}
            {redirects.length > 0 && (
              <>
                <table style={s.table}>
                  <thead>
                    <tr>
                      <th style={s.th}>Type</th>
                      <th style={s.th}>From</th>
                      <th style={s.th}>To</th>
                      <th style={s.th}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {redirects.map(r => (
                      <tr key={r.id}>
                        <td style={s.td}><span style={s.badge('#2979ff')}>{r.type}</span></td>
                        <td style={s.td} style={{ fontFamily: 'monospace', fontSize: '12px' }}>{r.from}</td>
                        <td style={s.td} style={{ fontFamily: 'monospace', fontSize: '12px' }}>{r.to}</td>
                        <td style={s.td}><button style={s.btnSm} onClick={() => setRedirects(p => p.filter(x => x.id !== r.id))}>Remove</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                  <button style={s.btn()} onClick={() => {
                    const htaccess = redirects.map(r => `Redirect ${r.type} ${r.from} ${r.to}`).join('\n');
                    navigator.clipboard.writeText(htaccess);
                    alert('Copied .htaccess rules to clipboard');
                  }}>
                    📋 Copy .htaccess
                  </button>
                  <button style={s.btn('#444')} onClick={() => {
                    const nginx = redirects.map(r => `rewrite ^${r.from}$ ${r.to} ${r.type === '301' ? 'permanent' : 'redirect'};`).join('\n');
                    navigator.clipboard.writeText(nginx);
                    alert('Copied Nginx rules to clipboard');
                  }}>
                    📋 Copy Nginx
                  </button>
                </div>
              </>
            )}
            {redirects.length === 0 && <div className="empty">No redirects added yet</div>}
          </div>
        )}

        {/* ── HUMAN FIX TAB ── */}
        {activeTab === 'human-fix' && (
          <div style={s.panel}>
            <div style={{ fontWeight: '700', marginBottom: '16px' }}>Human Fix Report</div>
            <div style={{ fontSize: '13px', color: 'var(--text-faint)', marginBottom: '16px' }}>
              Issues that require manual attention. Bot-fixable issues are resolved automatically.
            </div>
            {humanReport ? (
              <table style={s.table}>
                <thead>
                  <tr>
                    <th style={s.th}>✓</th>
                    <th style={s.th}>Priority</th>
                    <th style={s.th}>URL</th>
                    <th style={s.th}>Issues</th>
                  </tr>
                </thead>
                <tbody>
                  {humanReport.issues?.map((item, i) => (
                    <tr key={i}>
                      <td style={s.td}><input type="checkbox" /></td>
                      <td style={s.td}><span style={s.badge(item.priority === 'HIGH' ? '#f44336' : '#ff9100')}>{item.priority}</span></td>
                      <td style={{ ...s.td, fontFamily: 'monospace', fontSize: '11px' }}>{item.url}</td>
                      <td style={s.td}>{item.issues?.map(i => i.type.replace(/_/g, ' ')).join(', ')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="empty">Run a site crawl first to generate the human fix report</div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
