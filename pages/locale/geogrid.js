/**
 * pages/locale/geogrid.js — Geo-Grid Heat Map
 * SoLV score + 5×5 grid visualization for local rank tracking
 */
import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { fetchers } from '../../lib/api';

export default function GeoGridPage() {
  const [sites, setSites] = useState([]);
  const [selectedSite, setSelectedSite] = useState('');
  const [keyword, setKeyword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [centerLat, setCenterLat] = useState('');
  const [centerLng, setCenterLng] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => { fetchers.sites().then(setSites); }, []);

  async function runGeoGrid() {
    if (!keyword || !businessName || !centerLat || !centerLng) {
      alert('Fill all fields first');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/locale/geo-grid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteId: selectedSite, keyword, businessName, centerLat: parseFloat(centerLat), centerLng: parseFloat(centerLng) }),
      });
      setResult(await res.json());
    } catch (e) { alert(e.message); } finally { setLoading(false); }
  }

  // Color based on ranking
  function cellColor(cell) {
    if (!cell) return '#1a1a2e';
    if (cell.inMapPack) return '#00c853';
    if (cell.organicRank > 0 && cell.organicRank <= 3) return '#00c853';
    if (cell.organicRank > 0 && cell.organicRank <= 10) return '#ff9100';
    if (cell.organicRank > 10) return '#f44336';
    return '#333';
  }

  function cellLabel(cell) {
    if (!cell) return '—';
    if (cell.inMapPack) return '📍';
    if (cell.organicRank > 0) return `#${cell.organicRank}`;
    return '❌';
  }

  const s = {
    page: { padding: '24px' },
    panel: { background: 'var(--panel)', borderRadius: '12px', padding: '20px', marginBottom: '16px' },
    input: { padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: '14px', flex: 1 },
    btn: { background: 'var(--forge)', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '14px' },
    select: { padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: '14px' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '6px', maxWidth: '300px' },
    cell: (color) => ({ background: color, borderRadius: '8px', padding: '16px 8px', textAlign: 'center', fontWeight: '700', fontSize: '14px', color: 'white', minHeight: '52px', display: 'flex', alignItems: 'center', justifyContent: 'center' }),
    statCard: { background: 'var(--bg)', borderRadius: '10px', padding: '16px', textAlign: 'center', border: '1px solid var(--border)' },
    statsRow: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', marginBottom: '20px' },
    legend: { display: 'flex', gap: '16px', marginTop: '16px', flexWrap: 'wrap' },
    legendItem: (color) => ({ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-faint)' }),
    legendDot: (color) => ({ width: '12px', height: '12px', borderRadius: '4px', background: color, flexShrink: 0 }),
  };

  // Build 5×5 grid from results
  const heatmap = result?.heatmap || [];
  const grid = Array.from({ length: 5 }, (_, row) =>
    Array.from({ length: 5 }, (_, col) =>
      heatmap.find(c => c.row === row && c.col === col) || null
    )
  );

  return (
    <Layout>
      <div style={s.page}>
        <div className="page-head">
          <div>
            <div className="page-title">🗺️ Geo-Grid Tracker</div>
            <div className="page-sub">5×5 local rank heat map — SoLV score per city area</div>
          </div>
        </div>

        <div style={s.panel}>
          <div style={{ fontWeight: '700', marginBottom: '16px' }}>Grid Settings</div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '12px' }}>
            <select style={s.select} value={selectedSite} onChange={e => setSelectedSite(e.target.value)}>
              <option value="">Select site</option>
              {sites.map(s => <option key={s.id} value={s.id}>{s.url}</option>)}
            </select>
            <input style={s.input} placeholder="Keyword e.g. plumber near me" value={keyword} onChange={e => setKeyword(e.target.value)} />
            <input style={s.input} placeholder="Business name" value={businessName} onChange={e => setBusinessName(e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <input style={s.input} placeholder="Center Lat (e.g. 30.2672)" value={centerLat} onChange={e => setCenterLat(e.target.value)} />
            <input style={s.input} placeholder="Center Lng (e.g. -97.7431)" value={centerLng} onChange={e => setCenterLng(e.target.value)} />
            <button style={s.btn} onClick={runGeoGrid} disabled={loading}>
              {loading ? '⏳ Scanning 25 points...' : '🗺️ Run Geo-Grid'}
            </button>
          </div>
        </div>

        {result && (
          <>
            <div style={s.statsRow}>
              <div style={s.statCard}>
                <div style={{ fontSize: '32px', fontWeight: '900', color: result.solv >= 50 ? '#00c853' : result.solv >= 25 ? '#ff9100' : '#f44336' }}>{result.solv}%</div>
                <div style={{ fontSize: '13px', color: 'var(--text-faint)', marginTop: '4px' }}>SoLV Score</div>
                <div style={{ fontSize: '11px', color: 'var(--text-faint)' }}>Share of Local Voice</div>
              </div>
              <div style={s.statCard}>
                <div style={{ fontSize: '32px', fontWeight: '900', color: '#00c853' }}>{result.inTop3}</div>
                <div style={{ fontSize: '13px', color: 'var(--text-faint)', marginTop: '4px' }}>Grid Points Top 3</div>
                <div style={{ fontSize: '11px', color: 'var(--text-faint)' }}>out of 25 total</div>
              </div>
              <div style={s.statCard}>
                <div style={{ fontSize: '32px', fontWeight: '900', color: '#2979ff' }}>{result.inMapPack}</div>
                <div style={{ fontSize: '13px', color: 'var(--text-faint)', marginTop: '4px' }}>In Map Pack</div>
                <div style={{ fontSize: '11px', color: 'var(--text-faint)' }}>grid points</div>
              </div>
            </div>

            <div style={s.panel}>
              <div style={{ fontWeight: '700', marginBottom: '16px' }}>Heat Map — {keyword}</div>
              <div style={s.grid}>
                {grid.flat().map((cell, i) => (
                  <div key={i} style={s.cell(cellColor(cell))} title={cell ? `Pos: ${cell.organicRank}, Map Pack: ${cell.inMapPack}` : 'Not checked'}>
                    {cellLabel(cell)}
                  </div>
                ))}
              </div>
              <div style={s.legend}>
                {[['#00c853', 'Top 3 / Map Pack'], ['#ff9100', 'Position 4-10'], ['#f44336', 'Position 11+'], ['#333', 'Not ranking']].map(([color, label]) => (
                  <div key={label} style={s.legendItem(color)}>
                    <div style={s.legendDot(color)} />
                    {label}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {!result && !loading && (
          <div style={s.panel}>
            <div className="empty">
              Enter your business details above and run the geo-grid scan.<br/>
              We check rankings from 25 different points across the city — like Local Falcon.
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
