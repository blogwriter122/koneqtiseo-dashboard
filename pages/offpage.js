/**
 * pages/offpage.js — Standalone Off-Page Dashboard
 *
 * Shows all off-page activity:
 *   - Backlinks built (by platform, by site, by tier)
 *   - Cross-linking campaigns
 *   - Directory submissions
 *   - Brand authority chain
 *   - Cloud stack status
 *   - Monthly report per site
 *
 * MASTER_PLAN §30
 */

import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { api, fetchers } from '../lib/api';

const TIERS = [
  { id: 0, label: 'TIER 0', name: 'Internal Links', color: '#00c853', desc: 'Auto-enforced after every publish' },
  { id: 1, label: 'TIER 1', name: 'Social Platforms', color: '#2979ff', desc: '10 social platforms, Round 1' },
  { id: 2, label: 'TIER 2', name: 'Web 2.0', color: '#ff9100', desc: '9 web2 platforms, Round 2' },
  { id: 3, label: 'TIER 3', name: 'Directories', color: '#e040fb', desc: 'Niche + local directories' },
  { id: 4, label: 'TIER 4', name: 'Forums', color: '#00bcd4', desc: 'Reddit, Quora, niche forums' },
  { id: 5, label: 'TIER 5', name: 'Cloud Stack', color: '#ff5722', desc: 'Google Sites, GitHub Pages, Netlify' },
];

export default function OffPageDashboard() {
  const [sites, setSites] = useState([]);
  const [selectedSite, setSelectedSite] = useState('');
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [crossLinkKeyword, setCrossLinkKeyword] = useState('');
  const [crossLinkUrl, setCrossLinkUrl] = useState('');

  useEffect(() => { fetchers.sites().then(setSites); }, []);

  useEffect(() => {
    if (selectedSite) loadStats();
  }, [selectedSite]);

  async function loadStats() {
    setLoading(true);
    try {
      const result = await api.getOffpageStats(selectedSite);
      setStats(result);
    } catch (_) {} finally { setLoading(false); }
  }

  async function startCrossLink() {
    if (!crossLinkKeyword || !crossLinkUrl) { alert('Enter keyword and URL'); return; }
    await api.runCrossLink({ keyword: crossLinkKeyword, moneyUrl: crossLinkUrl, siteId: selectedSite });
    alert('Cross-linking campaign started!');
  }

  async function startDirectories() {
    if (!selectedSite) { alert('Select a site first'); return; }
    const site = sites.find(s => s.id === selectedSite);
    await api.runDirectories({ siteId: selectedSite, siteData: { url: site?.url, name: site?.name } });
    alert('Directory submissions queued!');
  }

  async function runAudit() {
    if (!selectedSite) { alert('Select a site first'); return; }
    setLoading(true);
    try {
      const result = await api.runBacklinkAudit({ siteId: selectedSite });
      setStats(prev => ({ ...prev, audit: result }));
    } catch (_) {} finally { setLoading(false); }
  }

  const s = {
    page: { padding: '24px' },
    tabs: { display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' },
    tab: (a) => ({ padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: a ? 'var(--forge)' : 'var(--panel)', color: a ? 'white' : 'var(--text)', fontWeight: a ? '700' : '400', fontSize: '13px' }),
    panel: { background: 'var(--panel)', borderRadius: '12px', padding: '20px', marginBottom: '16px' },
    select: { padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: '14px' },
    input: { padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: '14px', width: '100%' },
    btn: (color = 'var(--forge)') => ({ background: color, color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '13px' }),
    grid4: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '16px' },
    metricCard: { background: 'var(--bg)', borderRadius: '10px', padding: '16px', textAlign: 'center', border: '1px solid var(--border)' },
    metricVal: { fontSize: '28px', fontWeight: '800', color: 'var(--forge)' },
    metricLabel: { fontSize: '12px', color: 'var(--text-faint)', marginTop: '4px' },
    tierRow: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: '1px solid var(--border)' },
    tierBadge: (color) => ({ background: color, color: 'white', padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '700', flexShrink: 0 }),
    row: { display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' },
  };

  return (
    <Layout>
      <div style={s.page}>
        <div className="page-head">
          <div>
            <div className="page-title">🔗 Off-Page SEO</div>
            <div className="page-sub">Backlinks, cross-linking, directories, cloud stack</div>
          </div>
        </div>

        {/* Site selector */}
        <div style={{ ...s.panel, padding: '12px 20px' }}>
          <div style={s.row}>
            <div style={{ flex: 2 }}>
              <select style={s.select} value={selectedSite} onChange={e => setSelectedSite(e.target.value)}>
                <option value="">Select site</option>
                {sites.map(s => <option key={s.id} value={s.id}>{s.url || s.name}</option>)}
              </select>
            </div>
            <button style={s.btn()} onClick={loadStats} disabled={!selectedSite || loading}>
              {loading ? '⏳' : '🔄 Refresh'}
            </button>
            <button style={s.btn('#f44336')} onClick={runAudit} disabled={!selectedSite}>
              🔍 Run Audit
            </button>
          </div>
        </div>

        <div style={s.tabs}>
          {[['overview','📊 Overview'],['cross-link','🔗 Cross-Link'],['directories','📁 Directories'],['cloud','☁️ Cloud Stack'],['report','📄 Monthly Report']].map(([tab, label]) => (
            <button key={tab} style={s.tab(activeTab === tab)} onClick={() => setActiveTab(tab)}>{label}</button>
          ))}
        </div>

        {/* OVERVIEW */}
        {activeTab === 'overview' && (
          <>
            <div style={s.grid4}>
              {[
                { label: 'Total Backlinks', value: stats?.total || '—' },
                { label: 'Live Links', value: stats?.live || '—' },
                { label: 'Dead Links', value: stats?.dead || '—' },
                { label: 'Platforms Covered', value: Object.keys(stats?.byPlatform || {}).length || '—' },
              ].map(m => (
                <div key={m.label} style={s.metricCard}>
                  <div style={s.metricVal}>{m.value}</div>
                  <div style={s.metricLabel}>{m.label}</div>
                </div>
              ))}
            </div>

            <div style={s.panel}>
              <div style={{ fontWeight: '700', marginBottom: '16px' }}>Off-Page Tier Status</div>
              {TIERS.map(tier => (
                <div key={tier.id} style={s.tierRow}>
                  <span style={s.tierBadge(tier.color)}>{tier.label}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', fontSize: '14px' }}>{tier.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-faint)' }}>{tier.desc}</div>
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-faint)' }}>
                    {stats?.byTier?.[tier.id] || 0} links
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* CROSS-LINK */}
        {activeTab === 'cross-link' && (
          <div style={s.panel}>
            <div style={{ fontWeight: '700', marginBottom: '16px' }}>Two-Round Cross-Linking Campaign</div>
            <div style={{ fontSize: '13px', color: 'var(--text-faint)', marginBottom: '16px' }}>
              Round 1: 10 social platforms (immediate) → Round 2: 9 web2 platforms (24h later, links to all Round 1 URLs)
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '500px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-faint)', display: 'block', marginBottom: '4px' }}>Keyword</label>
                <input style={s.input} placeholder="best air purifier for bedroom" value={crossLinkKeyword} onChange={e => setCrossLinkKeyword(e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-faint)', display: 'block', marginBottom: '4px' }}>Money URL</label>
                <input style={s.input} placeholder="https://yoursite.com/best-air-purifier" value={crossLinkUrl} onChange={e => setCrossLinkUrl(e.target.value)} />
              </div>
              <button style={s.btn()} onClick={startCrossLink}>🔗 Start Cross-Linking Campaign</button>
            </div>
          </div>
        )}

        {/* DIRECTORIES */}
        {activeTab === 'directories' && (
          <div style={s.panel}>
            <div style={{ fontWeight: '700', marginBottom: '16px' }}>Directory Submission</div>
            <div style={{ fontSize: '13px', color: 'var(--text-faint)', marginBottom: '20px' }}>
              Submits to general, local and niche-specific directories. Rate-limited to avoid spam triggers.
            </div>
            <button style={s.btn()} onClick={startDirectories} disabled={!selectedSite}>
              📁 Submit to Directories
            </button>
          </div>
        )}

        {/* CLOUD STACK */}
        {activeTab === 'cloud' && (
          <div style={s.panel}>
            <div style={{ fontWeight: '700', marginBottom: '8px' }}>Cloud Stacking (TIER 5)</div>
            <div style={{ fontSize: '13px', color: 'var(--text-faint)', marginBottom: '20px' }}>
              Layer 1: Google Sites + GitHub Pages (DR 96-100) → Layer 2: Netlify + Vercel (DR 93). Layer 2 links to Layer 1 and money site.
            </div>
            <div className="empty">Cloud stack jobs appear in the Job Queue after launching from here.</div>
          </div>
        )}

        {/* MONTHLY REPORT */}
        {activeTab === 'report' && (
          <div style={s.panel}>
            <div style={{ fontWeight: '700', marginBottom: '16px' }}>Monthly Off-Page Report</div>
            <div style={{ fontSize: '13px', color: 'var(--text-faint)', marginBottom: '16px' }}>
              Generates a white-label HTML/PDF report showing all backlinks built, platforms covered, and recommendations.
            </div>
            <button style={s.btn()} disabled={!selectedSite} onClick={() => alert('Report generation started — check Job Queue')}>
              📄 Generate Monthly Report
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}
