/**
 * pages/niches.js — Niche Catalog (Amazon-style browse)
 * Browse 1000s of scored niches → click any → full plan (validation + cluster + silo)
 */

import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { api } from '../lib/api';

export default function NichesPage() {
  const [tree, setTree] = useState([]);
  const [stats, setStats] = useState(null);
  const [niches, setNiches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selVertical, setSelVertical] = useState('');
  const [minScore, setMinScore] = useState(50);
  const [nicheTypeFilter, setNicheTypeFilter] = useState('');
  const [sortBy, setSortBy] = useState('rankability');
  const [selNiche, setSelNiche] = useState(null);
  const [plan, setPlan] = useState(null);
  const [planLoading, setPlanLoading] = useState(false);

  useEffect(() => {
    api.getNicheTree().then(r => setTree(r.tree || [])).catch(() => {});
    api.getNicheStats().then(setStats).catch(() => {});
    loadNiches();
  }, []);

  async function loadNiches(vertical = '') {
    setLoading(true);
    try {
      const q = { vertical, minScore, sortBy, limit: 200 };
      if (nicheTypeFilter) q.nicheType = nicheTypeFilter;
      const r = await api.browseNiches(q);
      setNiches(r.niches || []);
    } catch (_) {} finally { setLoading(false); }
  }

  async function openPlan(niche) {
    setSelNiche(niche);
    setPlan(null);
    setPlanLoading(true);
    try {
      const r = await api.getNichePlan(niche.id);
      setPlan(r);
    } catch (e) { alert(e.message); } finally { setPlanLoading(false); }
  }

  const s = {
    page: { padding: '24px' },
    layout: { display: 'grid', gridTemplateColumns: '240px 1fr', gap: '16px' },
    tree: { background: 'var(--panel)', borderRadius: '12px', padding: '16px', maxHeight: '70vh', overflowY: 'auto' },
    treeItem: (a) => ({ padding: '8px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', background: a ? 'var(--forge)' : 'transparent', color: a ? 'white' : 'var(--text)', display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }),
    panel: { background: 'var(--panel)', borderRadius: '12px', padding: '20px' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px,1fr))', gap: '10px', marginBottom: '16px' },
    stat: { background: 'var(--bg)', borderRadius: '10px', padding: '14px', textAlign: 'center', border: '1px solid var(--border)' },
    filters: { display: 'flex', gap: '10px', marginBottom: '16px', alignItems: 'center', flexWrap: 'wrap' },
    select: { padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: '13px' },
    table: { width: '100%', borderCollapse: 'collapse', fontSize: '13px' },
    th: { background: 'var(--bg)', padding: '8px 12px', textAlign: 'left', fontWeight: '700', borderBottom: '2px solid var(--border)', fontSize: '11px', color: 'var(--text-faint)', textTransform: 'uppercase' },
    td: { padding: '9px 12px', borderBottom: '1px solid var(--border)', cursor: 'pointer' },
    badge: (v) => ({ background: v === 'GOLDMINE' ? '#ffd700' : v === 'STRONG' ? '#00c853' : v === 'MODERATE' ? '#ff9100' : '#f44336', color: v === 'GOLDMINE' ? '#000' : '#fff', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '700' }),
    modal: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '24px' },
    modalCard: { background: 'var(--panel)', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '700px', maxHeight: '88vh', overflowY: 'auto' },
    scoreBar: { display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '8px', marginBottom: '16px' },
    scoreCell: { background: 'var(--bg)', borderRadius: '8px', padding: '10px', textAlign: 'center', border: '1px solid var(--border)' },
    btn: (c = 'var(--forge)') => ({ background: c, color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '14px' }),
    chip: { display: 'inline-block', background: 'var(--bg)', padding: '3px 10px', borderRadius: '12px', fontSize: '11px', margin: '2px', border: '1px solid var(--border)' },
  };

  return (
    <Layout>
      <div style={s.page}>
        <div className="page-head">
          <div>
            <div className="page-title">📚 Niche Catalog</div>
            <div className="page-sub">Browse discovered niches · click any → full plan (validation + cluster + silo)</div>
          </div>
        </div>

        {stats && (
          <div style={s.grid}>
            {[
              { label: 'Total Niches', value: stats.total, color: 'var(--forge)' },
              { label: '🏆 Goldmine', value: stats.goldmine, color: '#ffd700' },
              { label: '✅ Strong', value: stats.strong, color: '#00c853' },
              { label: 'Winnable', value: stats.winnable, color: '#00c853' },
            ].map(m => (
              <div key={m.label} style={s.stat}>
                <div style={{ fontSize: '24px', fontWeight: '800', color: m.color }}>{m.value}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-faint)' }}>{m.label}</div>
              </div>
            ))}
          </div>
        )}

        <div style={s.layout}>
          {/* TREE */}
          <div style={s.tree}>
            <div style={{ fontWeight: '700', fontSize: '12px', color: 'var(--text-faint)', marginBottom: '10px', textTransform: 'uppercase' }}>Verticals</div>
            <div style={s.treeItem(selVertical === '')} onClick={() => { setSelVertical(''); loadNiches(''); }}>
              <span>All</span><span style={{ color: 'var(--text-faint)' }}>{stats?.total || 0}</span>
            </div>
            {tree.map(v => (
              <div key={v.vertical}>
                <div style={s.treeItem(selVertical === v.vertical)} onClick={() => { setSelVertical(v.vertical); loadNiches(v.vertical); }}>
                  <span>{v.vertical}</span>
                  <span style={{ color: v.winnable > 0 ? '#00c853' : 'var(--text-faint)' }}>{v.winnable}/{v.count}</span>
                </div>
              </div>
            ))}
            {tree.length === 0 && <div style={{ fontSize: '12px', color: 'var(--text-faint)', padding: '10px' }}>No niches yet. Mine a vertical in Studio.</div>}
          </div>

          {/* LIST */}
          <div style={s.panel}>
            <div style={s.filters}>
              <span style={{ fontSize: '12px', color: 'var(--text-faint)' }}>Type:</span>
              <select style={s.select} value={nicheTypeFilter} onChange={e => { setNicheTypeFilter(e.target.value); setTimeout(() => loadNiches(selVertical), 0); }}>
                <option value="">All types</option>
                <option value="affiliate">🛒 Affiliate</option>
                <option value="info">📚 Info</option>
                <option value="apk">📱 APK</option>
                <option value="tool">🔧 Tool</option>
                <option value="menu">🍔 Menu</option>
                <option value="ecommerce">🏪 Ecommerce</option>
                <option value="multi_page">📄 Multi-Page</option>
              </select>
              <span style={{ fontSize: '12px', color: 'var(--text-faint)' }}>Min rankability:</span>
              <select style={s.select} value={minScore} onChange={e => { setMinScore(parseInt(e.target.value)); loadNiches(selVertical); }}>
                <option value={0}>Any</option><option value={50}>50+</option><option value={60}>60+</option><option value={70}>70+ (strong)</option>
              </select>
              <span style={{ fontSize: '12px', color: 'var(--text-faint)' }}>Sort:</span>
              <select style={s.select} value={sortBy} onChange={e => { setSortBy(e.target.value); loadNiches(selVertical); }}>
                <option value="rankability">Rankability</option><option value="volume">Volume</option><option value="score">Total Score</option>
              </select>
            </div>

            {loading ? <div className="empty">Loading...</div> : niches.length === 0 ? (
              <div className="empty">No niches. Mine a vertical in Studio to fill the catalog.</div>
            ) : (
              <table style={s.table}>
                <thead><tr><th style={s.th}>Keyword</th><th style={s.th}>Vertical</th><th style={s.th}>Type</th><th style={s.th}>Vol</th><th style={s.th}>Rank</th><th style={s.th}>Verdict</th></tr></thead>
                <tbody>
                  {niches.map(n => (
                    <tr key={n.id} onClick={() => openPlan(n)} style={{ cursor: 'pointer' }}>
                      <td style={{ ...s.td, fontWeight: '600' }}>{n.keyword}</td>
                      <td style={s.td}>{n.vertical || '—'}</td>
                      <td style={s.td}>{n.niche_type}</td>
                      <td style={s.td}>{n.volume?.toLocaleString() ?? '—'}</td>
                      <td style={{ ...s.td, fontWeight: '700', color: n.rankability >= 60 ? '#00c853' : 'var(--text)' }}>{n.rankability ?? '—'}</td>
                      <td style={s.td}>{n.verdict ? <span style={s.badge(n.verdict)}>{n.verdict}</span> : <span style={{ fontSize: '11px', color: 'var(--text-faint)' }}>click to validate</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* FULL PLAN MODAL */}
      {selNiche && (
        <div style={s.modal} onClick={() => { setSelNiche(null); setPlan(null); }}>
          <div style={s.modalCard} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: '20px', fontWeight: '800', marginBottom: '4px' }}>{selNiche.keyword}</div>
            <div style={{ fontSize: '13px', color: 'var(--text-faint)', marginBottom: '20px' }}>
              {selNiche.vertical} · {selNiche.niche_type} · {selNiche.country}
            </div>

            {planLoading ? (
              <div className="empty">Validating + building full plan...</div>
            ) : plan ? (
              <>
                {/* Validation scores (the 5 metrics) */}
                {plan.validation && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <div style={{ fontWeight: '700' }}>Validation Score</div>
                      <div><span style={s.badge(plan.validation.verdict)}>{plan.validation.verdict}</span> <strong>{plan.validation.totalScore}/100</strong></div>
                    </div>
                    <div style={s.scoreBar}>
                      {[
                        ['Traffic', plan.validation.scores?.trafficProof, 20],
                        ['Competition', plan.validation.scores?.competition, 25],
                        ['Monetization', plan.validation.scores?.monetization, 20],
                        ['Sustain', plan.validation.scores?.sustainability, 15],
                        ['Cluster', plan.validation.scores?.cluster, 20],
                      ].map(([label, val, max]) => (
                        <div key={label} style={s.scoreCell}>
                          <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--forge)' }}>{val ?? '—'}</div>
                          <div style={{ fontSize: '9px', color: 'var(--text-faint)' }}>{label} /{max}</div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* Keyword cluster (sub-keywords) */}
                {plan.blueprint?.section4_cluster && (
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontWeight: '700', marginBottom: '8px' }}>🔑 Keyword Cluster (sub-keywords)</div>
                    {Object.entries(plan.blueprint.section4_cluster).map(([group, kws]) => Array.isArray(kws) && kws.length > 0 && (
                      <div key={group} style={{ marginBottom: '8px' }}>
                        <div style={{ fontSize: '11px', color: 'var(--text-faint)', textTransform: 'uppercase', marginBottom: '4px' }}>{group}</div>
                        {kws.slice(0, 15).map((k, i) => <span key={i} style={s.chip}>{typeof k === 'string' ? k : k.keyword}</span>)}
                      </div>
                    ))}
                  </div>
                )}

                {/* Silo structure */}
                {plan.blueprint?.section6_structure && (
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontWeight: '700', marginBottom: '8px' }}>🏛️ Silo Structure</div>
                    <pre style={{ background: 'var(--bg)', padding: '12px', borderRadius: '8px', fontSize: '12px', overflow: 'auto', maxHeight: '200px' }}>
                      {JSON.stringify(plan.blueprint.section6_structure, null, 2).slice(0, 1000)}
                    </pre>
                  </div>
                )}

                {/* Content plan */}
                {plan.blueprint?.section5_contentPlan && (
                  <div style={{ marginBottom: '16px', fontSize: '13px' }}>
                    <strong>Content plan:</strong> {plan.blueprint.section5_contentPlan.totalArticles} articles, {plan.blueprint.section5_contentPlan.estimatedWeeks} weeks
                  </div>
                )}

                <button style={{ ...s.btn('#00c853'), width: '100%' }} onClick={() => window.location.href = '/studio'}>
                  🚀 Build This Niche (go to Studio)
                </button>
              </>
            ) : (
              <div className="empty">Click to load plan</div>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
}
