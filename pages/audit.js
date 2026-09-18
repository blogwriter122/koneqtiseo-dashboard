/**
 * pages/audit.js — Full Site Audit (Crawler + Screaming Frog import)
 */
import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { api, fetchers } from '../lib/api';

export default function AuditPage() {
  const [sites, setSites] = useState([]);
  const [selectedSite, setSelectedSite] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState('crawl');
  const [logs, setLogs] = useState([]);

  useEffect(() => { fetchers.sites().then(setSites); }, []);

  async function runCrawl() {
    if (!selectedSite) { alert('Select a site first'); return; }
    const site = sites.find(s => s.id === selectedSite);
    if (!site?.url) { alert('Site has no URL'); return; }
    setLoading(true);
    setLogs(['Starting crawl...']);
    try {
      const result = await api.crawlSite({ siteUrl: site.url, siteId: selectedSite });
      setResult(result);
      setLogs(prev => [...prev, `✅ Crawl complete: ${result.totalPages || 0} pages, health score: ${result.health || 0}/100`]);
    } catch (e) {
      setLogs(prev => [...prev, `❌ ${e.message}`]);
    } finally { setLoading(false); }
  }

  async function generateWorkbook() {
    if (!result) { alert('Run a crawl first'); return; }
    try {
      await api.generateWorkbook({ crawlResult: result });
      alert('XLSX workbook generated — check job queue for download link');
    } catch (e) { alert(e.message); }
  }

  const s = {
    page: { padding: '24px' },
    panel: { background: 'var(--panel)', borderRadius: '12px', padding: '20px', marginBottom: '16px' },
    tabs: { display: 'flex', gap: '8px', marginBottom: '20px' },
    tab: (a) => ({ padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: a ? 'var(--forge)' : 'var(--panel)', color: a ? 'white' : 'var(--text)', fontWeight: a ? '700' : '400', fontSize: '13px' }),
    select: { padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: '14px' },
    btn: (color = 'var(--forge)') => ({ background: color, color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '14px' }),
    logBox: { background: '#0d1117', borderRadius: '8px', padding: '12px', maxHeight: '150px', overflowY: 'auto', fontFamily: 'monospace', fontSize: '12px', color: '#7ee787', marginTop: '12px' },
    grid4: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '16px' },
    statCard: { background: 'var(--bg)', borderRadius: '10px', padding: '16px', textAlign: 'center', border: '1px solid var(--border)' },
    issueRow: { display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)', fontSize: '13px' },
    badge: (color) => ({ background: color, color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '700' }),
  };

  return (
    <Layout>
      <div style={s.page}>
        <div className="page-head">
          <div>
            <div className="page-title">🕷️ Site Audit</div>
            <div className="page-sub">Full crawler + Screaming Frog import + auto-fix + XLSX report</div>
          </div>
        </div>

        <div style={s.tabs}>
          {[['crawl','🕷️ Crawl'],['import','📥 SF Import'],['workbook','📊 XLSX Report']].map(([tab, label]) => (
            <button key={tab} style={s.tab(activeTab === tab)} onClick={() => setActiveTab(tab)}>{label}</button>
          ))}
        </div>

        {activeTab === 'crawl' && (
          <>
            <div style={s.panel}>
              <div style={{ fontWeight: '700', marginBottom: '16px' }}>Full Site Crawl</div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <select style={s.select} value={selectedSite} onChange={e => setSelectedSite(e.target.value)}>
                  <option value="">Select site</option>
                  {sites.map(s => <option key={s.id} value={s.id}>{s.url || s.name}</option>)}
                </select>
                <button style={s.btn()} onClick={runCrawl} disabled={loading || !selectedSite}>
                  {loading ? '⏳ Crawling...' : '🕷️ Start Crawl'}
                </button>
                {result && <button style={s.btn('#444')} onClick={generateWorkbook}>📊 Export XLSX</button>}
              </div>
              {logs.length > 0 && <div style={s.logBox}>{logs.map((l, i) => <div key={i}>{l}</div>)}</div>}
            </div>

            {result && (
              <>
                <div style={s.grid4}>
                  {[
                    { label: 'Pages Crawled', value: result.totalPages || result.summary?.totalPages || 0 },
                    { label: 'Health Score', value: `${result.health || result.siteHealthScore || 0}/100` },
                    { label: 'Critical Issues', value: result.summary?.criticalIssues || 0 },
                    { label: 'Thin Pages', value: result.thinContentPages || 0 },
                  ].map(m => (
                    <div key={m.label} style={s.statCard}>
                      <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--forge)' }}>{m.value}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-faint)', marginTop: '4px' }}>{m.label}</div>
                    </div>
                  ))}
                </div>

                {result.issuesByType?.length > 0 && (
                  <div style={s.panel}>
                    <div style={{ fontWeight: '700', marginBottom: '16px' }}>Top Issues</div>
                    {result.issuesByType.slice(0, 10).map(([type, count], i) => (
                      <div key={i} style={s.issueRow}>
                        <span>{type.replace(/_/g, ' ').toUpperCase()}</span>
                        <span style={s.badge(count > 10 ? '#f44336' : '#ff9100')}>{count} pages</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}

        {activeTab === 'import' && (
          <div style={s.panel}>
            <div style={{ fontWeight: '700', marginBottom: '8px' }}>Screaming Frog Import</div>
            <div style={{ fontSize: '13px', color: 'var(--text-faint)', marginBottom: '20px' }}>
              Export CSV from Screaming Frog → upload here → auto-fix bot-fixable issues → human report for the rest.
            </div>
            <div className="empty">Upload Screaming Frog CSV export to begin import and auto-fix.</div>
          </div>
        )}

        {activeTab === 'workbook' && (
          <div style={s.panel}>
            <div style={{ fontWeight: '700', marginBottom: '8px' }}>XLSX Audit Workbook</div>
            <div style={{ fontSize: '13px', color: 'var(--text-faint)', marginBottom: '20px' }}>
              Professional agency-ready Excel report with colored cells, issue sheets, and human-fix checklist.
            </div>
            <button style={s.btn()} onClick={generateWorkbook} disabled={!result}>
              📊 Generate XLSX Report
            </button>
            {!result && <div style={{ fontSize: '12px', color: 'var(--text-faint)', marginTop: '8px' }}>Run a crawl first to generate the workbook.</div>}
          </div>
        )}
      </div>
    </Layout>
  );
}
