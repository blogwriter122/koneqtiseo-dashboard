/**
 * pages/forge/gsc.js — GSC Intelligence Dashboard
 * Buried Giants, Striking Distance, Dead Weight
 */

import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { api, fetchers } from '../../lib/api';

const TYPES = [
  { id: 'buriedGiants', label: '🏛️ Buried Giants', color: '#ff9100', desc: 'High impressions, low CTR — fix title/meta' },
  { id: 'strikingDistance', label: '🎯 Striking Distance', color: '#2979ff', desc: 'Position 8-25 — small push = page 1' },
  { id: 'deadWeight', label: '💀 Dead Weight', color: '#f44336', desc: '0-5 impressions — prune or redirect' },
];

export default function GSCPage() {
  const [sites, setSites] = useState([]);
  const [selectedSite, setSelectedSite] = useState('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [activeType, setActiveType] = useState('buriedGiants');

  useEffect(() => { fetchers.sites().then(setSites); }, []);

  async function runAnalysis() {
    if (!selectedSite) { alert('Select a site first'); return; }
    setLoading(true);
    try {
      const result = await api.analyzeGSC({ siteId: selectedSite });
      setReport(result);
    } catch (e) { alert(e.message); } finally { setLoading(false); }
  }

  const s = {
    page: { padding: '24px' },
    panel: { background: 'var(--panel)', borderRadius: '12px', padding: '20px', marginBottom: '16px' },
    select: { padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: '14px' },
    btn: (color = 'var(--forge)') => ({ background: color, color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '14px' }),
    tabs: { display: 'flex', gap: '8px', marginBottom: '16px' },
    tab: (a) => ({ padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: a ? 'var(--forge)' : 'var(--panel)', color: a ? 'white' : 'var(--text)', fontWeight: a ? '700' : '400', fontSize: '13px' }),
    table: { width: '100%', borderCollapse: 'collapse', fontSize: '13px' },
    th: { background: 'var(--bg)', padding: '8px 12px', textAlign: 'left', fontWeight: '700', borderBottom: '2px solid var(--border)', fontSize: '11px', color: 'var(--text-faint)', textTransform: 'uppercase' },
    td: { padding: '10px 12px', borderBottom: '1px solid var(--border)' },
    badge: (color) => ({ background: color, color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '700' }),
    statCard: { background: 'var(--bg)', borderRadius: '8px', padding: '14px', textAlign: 'center', border: '1px solid var(--border)' },
  };

  const activeData = report?.[activeType] || [];
  const activeType_ = TYPES.find(t => t.id === activeType);

  return (
    <Layout>
      <div style={s.page}>
        <div className="page-head">
          <div>
            <div className="page-title">📊 GSC Intelligence</div>
            <div className="page-sub">Buried giants, striking distance, dead weight — auto-fix queued</div>
          </div>
        </div>

        <div style={{ ...s.panel, padding: '12px 20px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <select style={s.select} value={selectedSite} onChange={e => setSelectedSite(e.target.value)}>
              <option value="">Select site</option>
              {sites.map(s => <option key={s.id} value={s.id}>{s.url || s.name}</option>)}
            </select>
            <button style={s.btn()} onClick={runAnalysis} disabled={loading || !selectedSite}>
              {loading ? '⏳ Analyzing...' : '🔍 Run GSC Analysis'}
            </button>
          </div>
        </div>

        {report && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '16px' }}>
              {[
                { label: 'Total Pages', value: report.totalPages || 0 },
                { label: 'Buried Giants', value: report.summary?.buriedGiants || 0 },
                { label: 'Near Page 1', value: report.summary?.strikingDistance || 0 },
                { label: 'Est. Extra Clicks', value: (report.summary?.estimatedMonthlyClickGain || 0).toLocaleString() },
              ].map(m => (
                <div key={m.label} style={s.statCard}>
                  <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--forge)' }}>{m.value}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-faint)', marginTop: '4px' }}>{m.label}</div>
                </div>
              ))}
            </div>

            <div style={s.tabs}>
              {TYPES.map(t => (
                <button key={t.id} style={s.tab(activeType === t.id)} onClick={() => setActiveType(t.id)}>
                  {t.label} ({(report[t.id] || []).length})
                </button>
              ))}
            </div>

            <div style={s.panel}>
              <div style={{ fontWeight: '700', marginBottom: '4px' }}>{activeType_?.label}</div>
              <div style={{ fontSize: '13px', color: 'var(--text-faint)', marginBottom: '16px' }}>{activeType_?.desc}</div>

              {activeData.length === 0 ? (
                <div className="empty">No {activeType_.label.toLowerCase()} found</div>
              ) : (
                <table style={s.table}>
                  <thead>
                    <tr>
                      <th style={s.th}>URL</th>
                      <th style={s.th}>Top Query</th>
                      <th style={s.th}>Impressions</th>
                      <th style={s.th}>CTR</th>
                      <th style={s.th}>Position</th>
                      <th style={s.th}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeData.map((item, i) => (
                      <tr key={i}>
                        <td style={{ ...s.td, maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'monospace', fontSize: '11px' }}>
                          <a href={item.url} target="_blank" rel="noreferrer" style={{ color: 'var(--forge)' }}>{item.url}</a>
                        </td>
                        <td style={s.td}>{item.topQuery || '—'}</td>
                        <td style={s.td}>{(item.impressions || 0).toLocaleString()}</td>
                        <td style={s.td}>{((item.ctr || 0) * 100).toFixed(1)}%</td>
                        <td style={s.td}>{(item.position || 0).toFixed(1)}</td>
                        <td style={s.td}>
                          <span style={s.badge(activeType_?.color)}>{item.action?.split(' ').slice(0, 2).join(' ') || 'Fix'}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        {!report && !loading && (
          <div style={s.panel}>
            <div className="empty">Select a site and run GSC analysis to see opportunities</div>
          </div>
        )}
      </div>
    </Layout>
  );
}
