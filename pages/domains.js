/**
 * pages/domains.js — Off-Page Domain Library
 * Import CSV, auto-discover niche forums/blogs, manage backlink targets
 */

import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { api } from '../lib/api';

export default function DomainsPage() {
  const [domains, setDomains] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('library');
  const [gapOur, setGapOur] = useState('');
  const [gapCompetitors, setGapCompetitors] = useState('');
  const [gapLoading, setGapLoading] = useState(false);
  const [gapResult, setGapResult] = useState(null);

  async function runLinkGap() {
    if (!gapOur || !gapCompetitors.trim()) { alert('Enter your domain + competitors'); return; }
    setGapLoading(true); setGapResult(null);
    try {
      const competitors = gapCompetitors.split('\n').map(c => c.trim()).filter(Boolean);
      const r = await api.linkGap({ ourDomain: gapOur, competitors });
      setGapResult(r);
      load();  // refresh library (gap domains added)
    } catch (e) { alert(e.message); } finally { setGapLoading(false); }
  }
  const [discoverNiche, setDiscoverNiche] = useState('');
  const [discovering, setDiscovering] = useState(false);
  const [csvText, setCsvText] = useState('');
  const [importing, setImporting] = useState(false);
  const [filterType, setFilterType] = useState('all');

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const [d, st] = await Promise.all([
        api.getDomains().catch(() => ({ domains: [] })),
        api.getDomainStats().catch(() => null),
      ]);
      setDomains(d.domains || []);
      setStats(st);
    } catch (_) {} finally { setLoading(false); }
  }

  async function runDiscover() {
    if (!discoverNiche) { alert('Enter a niche'); return; }
    setDiscovering(true);
    try {
      const r = await api.discoverDomains(discoverNiche);
      alert(`Discovered ${r.discovered} domains for "${discoverNiche}"`);
      load();
    } catch (e) { alert(e.message); } finally { setDiscovering(false); }
  }

  async function importCsv() {
    if (!csvText.trim()) { alert('Paste CSV data'); return; }
    setImporting(true);
    try {
      // Parse CSV (header row + data)
      const lines = csvText.trim().split('\n');
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const rows = lines.slice(1).map(line => {
        const vals = line.split(',');
        const row = {};
        headers.forEach((h, i) => { row[h] = (vals[i] || '').trim(); });
        return row;
      });
      const r = await api.importDomains(rows);
      alert(`Imported ${r.imported}, skipped ${r.skipped}`);
      setCsvText('');
      load();
    } catch (e) { alert(e.message); } finally { setImporting(false); }
  }

  async function deleteDomain(id) {
    if (!confirm('Delete this domain?')) return;
    await api.deleteDomain(id);
    load();
  }

  const s = {
    page: { padding: '24px' },
    panel: { background: 'var(--panel)', borderRadius: '12px', padding: '20px', marginBottom: '16px' },
    tabs: { display: 'flex', gap: '8px', marginBottom: '20px' },
    tab: (a) => ({ padding: '8px 18px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: a ? 'var(--forge)' : 'var(--panel)', color: a ? 'white' : 'var(--text)', fontWeight: a ? '700' : '500', fontSize: '13px' }),
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px', marginBottom: '16px' },
    stat: { background: 'var(--bg)', borderRadius: '10px', padding: '16px', textAlign: 'center', border: '1px solid var(--border)' },
    btn: (c = 'var(--forge)') => ({ background: c, color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '13px' }),
    smBtn: (c = '#f44336') => ({ background: c, color: 'white', border: 'none', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '11px' }),
    input: { padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: '14px' },
    textarea: { width: '100%', minHeight: '160px', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: '12px', fontFamily: 'monospace' },
    table: { width: '100%', borderCollapse: 'collapse', fontSize: '13px' },
    th: { background: 'var(--bg)', padding: '8px 12px', textAlign: 'left', fontWeight: '700', borderBottom: '2px solid var(--border)', fontSize: '11px', color: 'var(--text-faint)', textTransform: 'uppercase' },
    td: { padding: '9px 12px', borderBottom: '1px solid var(--border)' },
    typeBadge: (t) => { const c = { forum: '#2979ff', web2: '#e040fb', directory: '#ff9100', blog: '#00c853', qa: '#00bcd4', social: '#f44336' }; return { background: c[t] || '#555', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '700' }; },
  };

  const filtered = filterType === 'all' ? domains : domains.filter(d => d.platform_type === filterType);

  return (
    <Layout>
      <div style={s.page}>
        <div className="page-head">
          <div>
            <div className="page-title">🌐 Domain Library</div>
            <div className="page-sub">Backlink targets — forums, blogs, web2, directories · import CSV or auto-discover</div>
          </div>
        </div>

        {stats && (
          <div style={s.grid}>
            {[
              { label: 'Total Domains', value: stats.total, color: 'var(--forge)' },
              { label: 'Active', value: stats.active, color: '#00c853' },
              { label: 'Forums', value: stats.byType?.forum || 0, color: '#2979ff' },
              { label: 'Blogs', value: stats.byType?.blog || 0, color: '#00c853' },
              { label: 'Web2', value: stats.byType?.web2 || 0, color: '#e040fb' },
              { label: 'High DA (50+)', value: stats.highDA, color: '#ff9100' },
            ].map(m => (
              <div key={m.label} style={s.stat}>
                <div style={{ fontSize: '24px', fontWeight: '800', color: m.color }}>{m.value}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-faint)', marginTop: '4px' }}>{m.label}</div>
              </div>
            ))}
          </div>
        )}

        <div style={s.tabs}>
          {[['library', '📚 Library'], ['discover', '🔍 Auto-Discover'], ['import', '📥 Import CSV'], ['gap', '🎯 Competitor Gap']].map(([id, label]) => (
            <button key={id} style={s.tab(tab === id)} onClick={() => setTab(id)}>{label}</button>
          ))}
        </div>

        {/* LIBRARY */}
        {tab === 'library' && (
          <div style={s.panel}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
              {['all', 'forum', 'blog', 'web2', 'directory', 'qa'].map(t => (
                <button key={t} style={s.tab(filterType === t)} onClick={() => setFilterType(t)}>{t} ({t === 'all' ? domains.length : domains.filter(d => d.platform_type === t).length})</button>
              ))}
            </div>
            {loading ? <div className="empty">Loading...</div> : filtered.length === 0 ? (
              <div className="empty">No domains yet. Auto-discover or import a CSV.</div>
            ) : (
              <table style={s.table}>
                <thead>
                  <tr><th style={s.th}>Domain</th><th style={s.th}>Type</th><th style={s.th}>Niche</th><th style={s.th}>DA</th><th style={s.th}>Follow</th><th style={s.th}>Used</th><th style={s.th}></th></tr>
                </thead>
                <tbody>
                  {filtered.slice(0, 200).map(d => (
                    <tr key={d.id}>
                      <td style={{ ...s.td, fontFamily: 'monospace', fontSize: '12px' }}>{d.domain}</td>
                      <td style={s.td}><span style={s.typeBadge(d.platform_type)}>{d.platform_type}</span></td>
                      <td style={s.td}>{d.niche}</td>
                      <td style={{ ...s.td, fontWeight: '700', color: d.da >= 50 ? '#00c853' : d.da >= 30 ? '#ff9100' : 'var(--text-faint)' }}>{d.da || '—'}</td>
                      <td style={s.td}>{d.dofollow ? '✅' : '—'}</td>
                      <td style={{ ...s.td, color: 'var(--text-faint)' }}>{d.times_used || 0}×</td>
                      <td style={s.td}><button style={s.smBtn()} onClick={() => deleteDomain(d.id)}>Del</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {filtered.length > 200 && <div style={{ textAlign: 'center', color: 'var(--text-faint)', fontSize: '12px', marginTop: '12px' }}>Showing 200 of {filtered.length}</div>}
          </div>
        )}

        {/* DISCOVER */}
        {tab === 'discover' && (
          <div style={s.panel}>
            <div style={{ fontWeight: '700', marginBottom: '8px' }}>Auto-Discover Niche Domains</div>
            <div style={{ fontSize: '13px', color: 'var(--text-faint)', marginBottom: '16px' }}>
              Searches Google for "niche forum", "write for us", "guest post", community forums. Uses your browser profile.
            </div>
            <div style={{ display: 'flex', gap: '10px', maxWidth: '500px' }}>
              <input style={{ ...s.input, flex: 1 }} placeholder="e.g. home improvement, fitness, tech" value={discoverNiche} onChange={e => setDiscoverNiche(e.target.value)} />
              <button style={s.btn()} onClick={runDiscover} disabled={discovering}>
                {discovering ? '⏳ Searching...' : '🔍 Discover'}
              </button>
            </div>
          </div>
        )}

        {/* IMPORT */}
        {tab === 'import' && (
          <div style={s.panel}>
            <div style={{ fontWeight: '700', marginBottom: '8px' }}>Import Domains from CSV</div>
            <div style={{ fontSize: '13px', color: 'var(--text-faint)', marginBottom: '12px' }}>
              Paste CSV with header row. Columns: <code>domain,platform_type,niche,da,dofollow,post_type,login_url,post_url</code>
            </div>
            <textarea
              style={s.textarea}
              placeholder={`domain,platform_type,niche,da,dofollow,post_type\nreddit.com/r/SEO,forum,seo,91,false,thread\nmedium.com,web2,general,96,true,article\nquora.com,qa,general,93,true,answer`}
              value={csvText}
              onChange={e => setCsvText(e.target.value)}
            />
            <button style={{ ...s.btn(), marginTop: '12px' }} onClick={importCsv} disabled={importing}>
              {importing ? '⏳ Importing...' : '📥 Import Domains'}
            </button>
          </div>
        )}

        {/* COMPETITOR GAP */}
        {tab === 'gap' && (
          <div style={s.panel}>
            <div style={{ fontWeight: '700', marginBottom: '8px' }}>🎯 Competitor Link Gap</div>
            <div style={{ fontSize: '13px', color: 'var(--text-faint)', marginBottom: '16px' }}>
              Find domains linking to competitors but NOT you → gettable ones added as priority off-page targets. (Needs DataForSEO)
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '520px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-faint)', display: 'block', marginBottom: '4px' }}>Your domain</label>
                <input style={s.input} placeholder="mysite.com" value={gapOur} onChange={e => setGapOur(e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-faint)', display: 'block', marginBottom: '4px' }}>Competitors (one per line, top 3 rankers)</label>
                <textarea style={{ ...s.textarea, minHeight: '80px' }} placeholder={"competitor1.com\ncompetitor2.com\ncompetitor3.com"} value={gapCompetitors} onChange={e => setGapCompetitors(e.target.value)} />
              </div>
              <button style={s.btn()} onClick={runLinkGap} disabled={gapLoading}>
                {gapLoading ? '⏳ Analyzing...' : '🎯 Find Link Gap'}
              </button>
            </div>
            {gapResult && (
              <div style={{ marginTop: '20px' }}>
                <div style={{ fontSize: '13px', marginBottom: '12px' }}>
                  Found <strong>{gapResult.gaps?.length || 0}</strong> gap domains, <strong style={{ color: '#00c853' }}>{gapResult.gettableGaps?.length || 0}</strong> gettable (added to library).
                </div>
                {gapResult.anchorDistribution && (
                  <div style={{ fontSize: '12px', color: 'var(--text-faint)', marginBottom: '12px' }}>
                    Anchor mix to match: {Object.entries(gapResult.anchorDistribution).map(([k, v]) => `${k} ${v}%`).join(' · ')}
                  </div>
                )}
                {gapResult.gettableGaps?.length > 0 && (
                  <table style={s.table}>
                    <thead><tr><th style={s.th}>Domain</th><th style={s.th}>Type</th><th style={s.th}>Linked by</th><th style={s.th}>DA</th><th style={s.th}>Priority</th></tr></thead>
                    <tbody>
                      {gapResult.gettableGaps.slice(0, 30).map((g, i) => (
                        <tr key={i}>
                          <td style={{ ...s.td, fontFamily: 'monospace', fontSize: '12px' }}>{g.domain}</td>
                          <td style={s.td}><span style={s.typeBadge(g.gettable?.type)}>{g.gettable?.type}</span></td>
                          <td style={s.td}>{g.count} comp</td>
                          <td style={s.td}>{g.da || '—'}</td>
                          <td style={{ ...s.td, fontWeight: '700' }}>{Math.round(g.priority)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
