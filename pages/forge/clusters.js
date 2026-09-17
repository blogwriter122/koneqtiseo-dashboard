/**
 * pages/forge/clusters.js — Affiliate Cluster Progress Dashboard
 *
 * Market → clusters grid → progress bars → commission rate → revenue
 * MASTER_PLAN §35
 */

import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { api } from '../../lib/api';

export default function ClustersPage() {
  const [markets, setMarkets] = useState([]);
  const [selectedMarket, setSelectedMarket] = useState('');
  const [clusters, setClusters] = useState([]);
  const [dbClusters, setDbClusters] = useState([]);
  const [dbStats, setDbStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sites, setSites] = useState([]);
  const [selectedSite, setSelectedSite] = useState('');

  useEffect(() => {
    loadMarkets();
    loadDbClusters();
    api.affiliateMarkets && api.affiliateMarkets().then(d => { setMarkets(d.markets || []); setDbStats(d.stats); }).catch(() => {});
  }, []);

  async function loadMarkets() {
    try {
      const data = await api.affiliateMarkets();
      setMarkets(data.markets || []);
      setDbStats(data.stats);
    } catch (_) {}
  }

  async function loadDbClusters() {
    try {
      const data = await api.affiliateClusters();
      setDbClusters(data || []);
    } catch (_) {}
  }

  async function loadMarketClusters(market) {
    setSelectedMarket(market);
    setLoading(true);
    try {
      const data = await api.affiliateMarket(market);
      setClusters(data.clusters || []);
    } catch (_) {} finally { setLoading(false); }
  }

  async function buildCluster(market, category) {
    if (!selectedSite) { alert('Select a site first'); return; }
    try {
      await api.affiliateBuildCluster({ market, category, siteId: selectedSite });
      alert(`Cluster queued: ${category}`);
      loadDbClusters();
    } catch (e) { alert(e.message); }
  }

  // Merge DB status into clusters
  const clustersWithStatus = clusters.map(c => {
    const db = dbClusters.find(d => d.market === c.market && d.category === c.category);
    return { ...c, dbData: db };
  });

  const s = {
    page: { padding: '24px' },
    panel: { background: 'var(--panel)', borderRadius: '12px', padding: '20px', marginBottom: '16px' },
    row: { display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' },
    select: { padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: '14px' },
    btn: (color = 'var(--forge)') => ({ background: color, color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '13px' }),
    btnSm: { background: 'var(--panel)', color: 'var(--text)', border: '1px solid var(--border)', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px' },
    marketItem: (active) => ({ padding: '10px 12px', borderRadius: '8px', cursor: 'pointer', marginBottom: '4px', background: active ? 'rgba(var(--forge-rgb),0.1)' : 'transparent', borderLeft: `3px solid ${active ? 'var(--forge)' : 'transparent'}` }),
    clusterCard: { background: 'var(--bg)', borderRadius: '8px', padding: '14px', border: '1px solid var(--border)', marginBottom: '8px' },
    progressBar: (pct, color = 'var(--forge)') => ({ height: '6px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden', marginTop: '6px' }),
    progressFill: (pct, color = '#00c853') => ({ height: '100%', width: `${Math.min(100, pct)}%`, background: color, borderRadius: '3px', transition: 'width 0.3s' }),
    statCard: { background: 'var(--bg)', borderRadius: '8px', padding: '14px', textAlign: 'center', border: '1px solid var(--border)' },
  };

  const statusColors = { done: '#00c853', publishing: '#2979ff', writing: '#ff9100', not_started: '#666' };

  return (
    <Layout>
      <div style={s.page}>
        <div className="page-head">
          <div>
            <div className="page-title">📦 Affiliate Clusters</div>
            <div className="page-sub">1M keyword system — market → clusters → drip publishing</div>
          </div>
        </div>

        {/* Stats */}
        {dbStats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '16px' }}>
            {[
              ['Markets', dbStats.totalMarkets],
              ['Clusters', dbStats.totalCategories],
              ['Min Articles', dbStats.totalKeywords?.toLocaleString()],
              ['Live', dbClusters.filter(c => c.status === 'done').length],
            ].map(([label, val]) => (
              <div key={label} style={s.statCard}>
                <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--forge)' }}>{val}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-faint)' }}>{label}</div>
              </div>
            ))}
          </div>
        )}

        <div style={{ ...s.panel, padding: '12px 20px' }}>
          <div style={s.row}>
            <div>
              <select style={s.select} value={selectedSite} onChange={e => setSelectedSite(e.target.value)}>
                <option value="">Select site to build on</option>
                {sites.map(s => <option key={s.id} value={s.id}>{s.url}</option>)}
              </select>
            </div>
            <button style={s.btn()} onClick={loadMarkets}>🔄 Refresh</button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px' }}>
          {/* Markets sidebar */}
          <div style={{ ...s.panel, flex: '0 0 200px', padding: '12px' }}>
            <div style={{ fontWeight: '700', fontSize: '12px', color: 'var(--text-faint)', marginBottom: '12px' }}>MARKETS</div>
            {markets.map(m => (
              <div key={m.market} style={s.marketItem(selectedMarket === m.market)} onClick={() => loadMarketClusters(m.market)}>
                <div style={{ fontSize: '13px', fontWeight: '600' }}>{m.market}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-faint)' }}>{m.commission}% · {m.totalCategories} clusters</div>
              </div>
            ))}
            {!markets.length && <div style={{ fontSize: '12px', color: 'var(--text-faint)' }}>Loading markets...</div>}
          </div>

          {/* Clusters grid */}
          <div style={{ flex: 1 }}>
            {selectedMarket ? (
              <>
                <div style={{ fontWeight: '700', marginBottom: '12px' }}>{selectedMarket} — {clustersWithStatus.length} clusters</div>
                {loading && <div style={{ color: 'var(--text-faint)', padding: '20px' }}>Loading...</div>}
                {clustersWithStatus.map(c => {
                  const db = c.dbData;
                  const pct = db ? Math.round((db.live_count / db.planned_count) * 100) : 0;
                  const status = db?.status || 'not_started';
                  return (
                    <div key={c.category} style={s.clusterCard}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: '600', fontSize: '14px' }}>{c.category}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-faint)', marginTop: '2px' }}>
                            {c.commission}% commission · {c.keywords?.length || 8} articles · ${(c.commission * 8 * 30).toFixed(0)}/mo est.
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <span style={{ fontSize: '11px', fontWeight: '700', color: statusColors[status] || '#666' }}>
                            {status.replace('_', ' ').toUpperCase()}
                          </span>
                          {status === 'not_started' && (
                            <button style={s.btnSm} onClick={() => buildCluster(selectedMarket, c.category)}>
                              ▶ Build
                            </button>
                          )}
                        </div>
                      </div>
                      <div style={s.progressBar(pct)}>
                        <div style={s.progressFill(pct, statusColors[status])} />
                      </div>
                      {db && (
                        <div style={{ fontSize: '11px', color: 'var(--text-faint)', marginTop: '4px' }}>
                          {db.live_count || 0}/{db.planned_count || 8} articles live ({pct}%)
                        </div>
                      )}
                    </div>
                  );
                })}
              </>
            ) : (
              <div style={{ ...s.panel, textAlign: 'center', color: 'var(--text-faint)' }}>
                Select a market from the left to view clusters
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
