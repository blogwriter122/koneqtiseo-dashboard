/**
 * pages/opportunity.js — SERP Opportunity Engine
 * Multi-engine analysis, country selection, winner-first mining
 */

import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { api } from '../lib/api';

export default function OpportunityPage() {
  const [tab, setTab] = useState('keyword');
  const [countries, setCountries] = useState([]);
  const [dataStatus, setDataStatus] = useState(null);
  const [country, setCountry] = useState('US');
  const [keyword, setKeyword] = useState('');
  const [siteDomain, setSiteDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    api.getCountryScores({ limit: 20 }).then(r => setCountries(r.countries || [])).catch(() => {});
    api.getDataStatus().then(setDataStatus).catch(() => {});
  }, []);

  async function analyzeKw() {
    if (!keyword) { alert('Enter a keyword'); return; }
    setLoading(true); setResult(null); setLogs(['Analyzing across search engines...']);
    try {
      const r = await api.analyzeOpportunity({ keyword, country });
      setResult({ type: 'keyword', data: r });
    } catch (e) { setLogs(p => [...p, `Error: ${e.message}`]); } finally { setLoading(false); }
  }

  async function mineSite() {
    if (!siteDomain) { alert('Enter a competitor domain'); return; }
    setLoading(true); setResult(null); setLogs([`Reverse engineering ${siteDomain}...`]);
    try {
      const r = await api.mineWinnerSite({ domain: siteDomain, country });
      setResult({ type: 'site', data: r });
    } catch (e) { setLogs(p => [...p, `Error: ${e.message}`]); } finally { setLoading(false); }
  }

  const s = {
    page: { padding: '24px' },
    panel: { background: 'var(--panel)', borderRadius: '12px', padding: '20px', marginBottom: '16px' },
    tabs: { display: 'flex', gap: '8px', marginBottom: '20px' },
    tab: (a) => ({ padding: '8px 18px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: a ? 'var(--forge)' : 'var(--panel)', color: a ? 'white' : 'var(--text)', fontWeight: a ? '700' : '500', fontSize: '13px' }),
    input: { padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: '14px' },
    select: { padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: '14px' },
    btn: (c = 'var(--forge)') => ({ background: c, color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '14px' }),
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px' },
    countryCard: (score) => ({ background: 'var(--bg)', borderRadius: '10px', padding: '14px', border: `1px solid ${score >= 85 ? '#00c853' : score >= 75 ? '#ff9100' : 'var(--border)'}`, cursor: 'pointer' }),
    score: (v) => ({ fontSize: '22px', fontWeight: '800', color: v >= 85 ? '#00c853' : v >= 75 ? '#ff9100' : 'var(--forge)' }),
    metric: { background: 'var(--bg)', borderRadius: '10px', padding: '16px', textAlign: 'center', border: '1px solid var(--border)' },
    logBox: { background: '#0d1117', borderRadius: '8px', padding: '12px', fontFamily: 'monospace', fontSize: '12px', color: '#7ee787', maxHeight: '120px', overflowY: 'auto', marginTop: '12px' },
    table: { width: '100%', borderCollapse: 'collapse', fontSize: '13px' },
    th: { background: 'var(--bg)', padding: '8px 12px', textAlign: 'left', fontWeight: '700', borderBottom: '2px solid var(--border)', fontSize: '11px', color: 'var(--text-faint)', textTransform: 'uppercase' },
    td: { padding: '9px 12px', borderBottom: '1px solid var(--border)' },
    badge: (v) => ({ background: v === 'STRONG' ? '#00c853' : v === 'MODERATE' ? '#ff9100' : v === 'WEAK' ? '#e0a000' : '#f44336', color: 'white', padding: '2px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '700' }),
    engineChip: (weak) => ({ display: 'inline-block', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', marginRight: '4px', marginBottom: '4px', background: weak ? 'rgba(0,200,83,0.15)' : 'rgba(244,67,54,0.1)', color: weak ? '#00c853' : '#999', border: `1px solid ${weak ? 'rgba(0,200,83,0.3)' : 'var(--border)'}` }),
  };

  return (
    <Layout>
      <div style={s.page}>
        <div className="page-head">
          <div>
            <div className="page-title">🎯 Opportunity Engine</div>
            <div className="page-sub">Multi-engine SERP + page-level weakness = "where can I rank?"</div>
          </div>
        </div>

        {/* Data source status */}
        {dataStatus && (
          <div style={{ ...s.panel, padding: '12px 20px', display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--text-faint)' }}>
            <span>Volume: {dataStatus.googleKP ? '✅ Google KP' : '⚠️ suggest only'}</span>
            <span>DA: {dataStatus.openPageRank ? '✅ OpenPageRank' : '⚠️ none'}</span>
            <span>Difficulty/Backlinks: {dataStatus.dataForSEO ? '✅ DataForSEO' : '❌ add key for full data'}</span>
          </div>
        )}

        <div style={s.tabs}>
          {[['keyword', '🔑 Keyword Analysis'], ['winner', '🏆 Winner Mining'], ['countries', '🌍 Markets']].map(([id, label]) => (
            <button key={id} style={s.tab(tab === id)} onClick={() => setTab(id)}>{label}</button>
          ))}
        </div>

        {/* KEYWORD ANALYSIS */}
        {tab === 'keyword' && (
          <div style={s.panel}>
            <div style={{ fontWeight: '700', marginBottom: '12px' }}>Analyze a keyword's real opportunity</div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <input style={{ ...s.input, flex: 2 }} placeholder="best air purifier for bedroom" value={keyword} onChange={e => setKeyword(e.target.value)} onKeyDown={e => e.key === 'Enter' && analyzeKw()} />
              <select style={s.select} value={country} onChange={e => setCountry(e.target.value)}>
                {countries.map(c => <option key={c.code} value={c.code}>{c.name} ({c.score})</option>)}
              </select>
              <button style={s.btn()} onClick={analyzeKw} disabled={loading}>{loading ? '⏳' : '🔍 Analyze'}</button>
            </div>
            {logs.length > 0 && <div style={s.logBox}>{logs.map((l, i) => <div key={i}>{l}</div>)}</div>}
          </div>
        )}

        {/* WINNER MINING */}
        {tab === 'winner' && (
          <div style={s.panel}>
            <div style={{ fontWeight: '700', marginBottom: '6px' }}>Reverse Engineer a Winning Site</div>
            <div style={{ fontSize: '13px', color: 'var(--text-faint)', marginBottom: '12px' }}>
              Point at a big site → get their traffic keywords → find which YOU can rank for. (Needs DataForSEO)
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <input style={{ ...s.input, flex: 2 }} placeholder="competitor.com" value={siteDomain} onChange={e => setSiteDomain(e.target.value)} />
              <select style={s.select} value={country} onChange={e => setCountry(e.target.value)}>
                {countries.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
              </select>
              <button style={s.btn()} onClick={mineSite} disabled={loading}>{loading ? '⏳ Mining...' : '🏆 Mine'}</button>
            </div>
            {logs.length > 0 && <div style={s.logBox}>{logs.map((l, i) => <div key={i}>{l}</div>)}</div>}
          </div>
        )}

        {/* COUNTRIES */}
        {tab === 'countries' && (
          <div style={s.panel}>
            <div style={{ fontWeight: '700', marginBottom: '12px' }}>Market Opportunity Scores</div>
            <div style={{ fontSize: '12px', color: 'var(--text-faint)', marginBottom: '16px' }}>
              Score = search diversity + commercial demand + local value + weak-SERP frequency. Higher = better arbitrage.
            </div>
            <div style={s.grid}>
              {countries.map(c => (
                <div key={c.code} style={s.countryCard(c.score)} onClick={() => { setCountry(c.code); setTab('keyword'); }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: '700' }}>{c.name}</span>
                    <span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '8px', background: 'var(--panel)', color: 'var(--text-faint)' }}>Tier {c.tier}</span>
                  </div>
                  <div style={s.score(c.score)}>{c.score}</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-faint)', marginTop: '4px' }}>{c.engines?.slice(0, 3).join(', ')}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RESULT: keyword */}
        {result?.type === 'keyword' && result.data && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '16px' }}>
              <div style={s.metric}><div style={s.score(result.data.rankability)}>{result.data.rankability}</div><div style={{ fontSize: '11px', color: 'var(--text-faint)' }}>Rankability</div></div>
              <div style={s.metric}><div style={{ fontSize: '22px', fontWeight: '800' }}>{result.data.serpWeakness}</div><div style={{ fontSize: '11px', color: 'var(--text-faint)' }}>SERP Weakness</div></div>
              <div style={s.metric}><div style={{ fontSize: '22px', fontWeight: '800', color: '#00c853' }}>{result.data.beatablePages}</div><div style={{ fontSize: '11px', color: 'var(--text-faint)' }}>Beatable Pages</div></div>
              <div style={s.metric}><span style={s.badge(result.data.verdict)}>{result.data.verdict}</span><div style={{ fontSize: '11px', color: 'var(--text-faint)', marginTop: '8px' }}>Verdict</div></div>
            </div>

            {result.data.engineWeakness && (
              <div style={s.panel}>
                <div style={{ fontWeight: '700', marginBottom: '10px' }}>Cross-Engine Weakness</div>
                {Object.entries(result.data.engineWeakness).map(([eng, d]) => (
                  <span key={eng} style={s.engineChip(d.weak)}>{eng}: {d.weak ? 'weak ✓' : 'strong'} ({d.bigBrands} brands)</span>
                ))}
              </div>
            )}

            {result.data.topPages?.length > 0 && (
              <div style={s.panel}>
                <div style={{ fontWeight: '700', marginBottom: '10px' }}>Ranking Pages (page-level analysis)</div>
                <table style={s.table}>
                  <thead><tr><th style={s.th}>Domain</th><th style={s.th}>DA</th><th style={s.th}>Words</th><th style={s.th}>Beatable?</th></tr></thead>
                  <tbody>
                    {result.data.topPages.map((p, i) => (
                      <tr key={i}>
                        <td style={{ ...s.td, fontFamily: 'monospace', fontSize: '12px' }}>{p.domain}</td>
                        <td style={{ ...s.td, color: p.da < 30 ? '#00c853' : 'var(--text)' }}>{p.da ?? '—'}</td>
                        <td style={s.td}>{p.words || '—'}</td>
                        <td style={s.td}>{p.weak ? '✅ yes' : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* RESULT: winner site */}
        {result?.type === 'site' && result.data && (
          <div style={s.panel}>
            <div style={{ fontWeight: '700', marginBottom: '12px' }}>
              {result.data.winnable ?? 0} winnable opportunities from {result.data.siteDomain}
            </div>
            {result.data.note && <div style={{ fontSize: '13px', color: '#ff9100', marginBottom: '12px' }}>⚠️ {result.data.note}</div>}
            {result.data.opportunities?.length > 0 && (
              <table style={s.table}>
                <thead><tr><th style={s.th}>Keyword</th><th style={s.th}>Their Traffic</th><th style={s.th}>Their Pos</th><th style={s.th}>Rankability</th><th style={s.th}>Verdict</th></tr></thead>
                <tbody>
                  {result.data.opportunities.slice(0, 30).map((o, i) => (
                    <tr key={i}>
                      <td style={s.td}>{o.keyword}</td>
                      <td style={s.td}>{o.sourceTraffic ? Math.round(o.sourceTraffic) : '—'}</td>
                      <td style={s.td}>#{o.sourcePosition || '—'}</td>
                      <td style={{ ...s.td, fontWeight: '700', color: o.rankability >= 50 ? '#00c853' : 'var(--text)' }}>{o.rankability}</td>
                      <td style={s.td}><span style={s.badge(o.verdict)}>{o.verdict}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
