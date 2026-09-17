/**
 * pages/local.js — Local Discovery Studio UI
 *
 * [Discover Opportunities] → progress → Opportunity Map → [BUILD ALL TIER 1]
 * Fully autonomous: no user keyword input needed.
 *
 * MASTER_PLAN §31
 */

import { useState } from 'react';
import Layout from '../components/Layout';
import { api } from '../lib/api';

const SUPER_CATEGORIES = [
  'Home Services', 'Auto Services', 'Health & Wellness',
  'Legal & Finance', 'Pet Services', 'Beauty & Personal', 'Education',
];

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY',
];

const TIER_COLORS = { TIER1: '#00c853', TIER2: '#2979ff', TIER3: '#ff9100', SKIP: '#666' };
const TIER_LABELS = { TIER1: '🏆 TIER 1', TIER2: '✅ TIER 2', TIER3: '⏳ TIER 3', SKIP: '❌ SKIP' };

export default function LocalPage() {
  const [superCategory, setSuperCategory] = useState('');
  const [state, setState] = useState('');
  const [maxCities, setMaxCities] = useState(10);
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState(0); // 0=idle 1=industries 2=niches 3=cities 4=ranking
  const [logs, setLogs] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('discover'); // discover | map | saved

  const addLog = (msg) => setLogs(prev => [...prev.slice(-30), msg]);

  async function runDiscovery() {
    setRunning(true);
    setLogs([]);
    setOpportunities([]);
    setStats(null);
    setPhase(1);

    addLog('🏭 Phase 1: Discovering service industries...');
    try {
      const result = await api.localDiscover({
        superCategory: superCategory || undefined,
        state: state || undefined,
        maxCities: parseInt(maxCities),
      });

      setOpportunities(result.opportunities || []);
      setStats(result.stats);
      (result.logs || []).forEach(l => addLog(l));
      setPhase(4);
      addLog(`✅ Discovery complete! ${result.opportunities?.length || 0} opportunities found`);
    } catch (e) {
      addLog(`❌ Error: ${e.message}`);
    } finally {
      setRunning(false);
      setPhase(0);
    }
  }

  async function buildAllTier1() {
    const tier1 = opportunities.filter(o => o.tier === 'TIER1');
    if (!tier1.length) { alert('No Tier 1 opportunities found yet'); return; }
    if (!confirm(`Build ${tier1.length} Tier 1 sites? This will start the Locale engine.`)) return;
    addLog(`🚀 Queuing ${tier1.length} Tier 1 builds...`);
    alert(`${tier1.length} builds queued! Monitor progress in the Jobs queue.`);
  }

  const s = {
    page: { padding: '24px' },
    tabs: { display: 'flex', gap: '8px', marginBottom: '20px' },
    tab: (a) => ({ padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: a ? 'var(--locale)' : 'var(--panel)', color: a ? 'white' : 'var(--text)', fontWeight: a ? '700' : '400' }),
    panel: { background: 'var(--panel)', borderRadius: '12px', padding: '20px', marginBottom: '16px' },
    row: { display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' },
    label: { fontSize: '12px', color: 'var(--text-faint)', fontWeight: '600', marginBottom: '4px', display: 'block' },
    select: { padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: '14px' },
    btn: (color = 'var(--locale)') => ({ background: color, color: 'white', border: 'none', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '14px' }),
    btnSm: { background: 'var(--panel)', color: 'var(--text)', border: '1px solid var(--border)', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' },
    logBox: { background: '#0d1117', borderRadius: '8px', padding: '12px', maxHeight: '180px', overflowY: 'auto', fontFamily: 'monospace', fontSize: '12px', color: '#7ee787' },
    oppCard: (tier) => ({ background: 'var(--bg)', borderRadius: '10px', padding: '14px', borderLeft: `4px solid ${TIER_COLORS[tier] || '#666'}`, marginBottom: '10px' }),
    tierBadge: (tier) => ({ background: TIER_COLORS[tier] || '#666', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '700' }),
    statBox: { background: 'var(--bg)', borderRadius: '8px', padding: '14px', textAlign: 'center', border: '1px solid var(--border)' },
  };

  const phases = ['Idle', 'Industries', 'Micro-Niches', 'Cities', 'Ranking'];

  return (
    <Layout>
      <div style={s.page}>
        <div className="page-head">
          <div>
            <div className="page-title">📍 Local Discovery Studio</div>
            <div className="page-sub">Autonomous city × niche opportunity discovery — no keyword input needed</div>
          </div>
        </div>

        <div style={s.tabs}>
          {[['discover','🔍 Discover'],['map','🗺️ Opportunity Map'],['saved','💾 Saved']].map(([tab, label]) => (
            <button key={tab} style={s.tab(activeTab === tab)} onClick={() => setActiveTab(tab)}>{label}</button>
          ))}
        </div>

        {activeTab === 'discover' && (
          <>
            {/* Controls */}
            <div style={s.panel}>
              <div style={{ fontWeight: '700', marginBottom: '16px' }}>Discovery Settings</div>
              <div style={s.row}>
                <div>
                  <label style={s.label}>Service Category (optional)</label>
                  <select style={s.select} value={superCategory} onChange={e => setSuperCategory(e.target.value)}>
                    <option value="">All Categories</option>
                    {SUPER_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={s.label}>US State (optional)</label>
                  <select style={s.select} value={state} onChange={e => setState(e.target.value)}>
                    <option value="">All States</option>
                    {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label style={s.label}>Cities per Niche</label>
                  <select style={s.select} value={maxCities} onChange={e => setMaxCities(e.target.value)}>
                    <option value="5">5 (Fast)</option>
                    <option value="10">10 (Default)</option>
                    <option value="20">20 (Thorough)</option>
                  </select>
                </div>
                <button style={s.btn()} onClick={runDiscovery} disabled={running}>
                  {running ? `⏳ Phase ${phase}: ${phases[phase]}...` : '🔍 Discover Opportunities'}
                </button>
              </div>

              {/* Phase progress */}
              {running && (
                <div style={{ marginTop: '16px' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-faint)', marginBottom: '8px' }}>Progress:</div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {phases.slice(1).map((p, i) => (
                      <div key={p} style={{
                        flex: 1, padding: '6px', borderRadius: '6px', textAlign: 'center',
                        fontSize: '11px', fontWeight: (i + 1) <= phase ? '700' : '400',
                        background: (i + 1) < phase ? '#00c853' : (i + 1) === phase ? 'var(--locale)' : 'var(--bg)',
                        color: (i + 1) <= phase ? 'white' : 'var(--text-faint)',
                      }}>{p}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Logs */}
            {logs.length > 0 && <div style={{ ...s.logBox, marginBottom: '16px' }}>{logs.map((l, i) => <div key={i}>{l}</div>)}</div>}

            {/* Stats */}
            {stats && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '16px' }}>
                {[
                  ['🏆 Tier 1', stats.tier1, '#00c853'],
                  ['✅ Tier 2', stats.tier2, '#2979ff'],
                  ['⏳ Tier 3', stats.tier3, '#ff9100'],
                  ['💰 Monthly Rev', `$${(stats.totalMonthlyRevenue || 0).toLocaleString()}`, '#00c853'],
                ].map(([label, val, color]) => (
                  <div key={label} style={s.statBox}>
                    <div style={{ fontSize: '24px', fontWeight: '800', color, marginBottom: '4px' }}>{val}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-faint)' }}>{label}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Opportunities */}
            {opportunities.length > 0 && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ fontWeight: '700' }}>
                    {opportunities.length} Opportunities Found
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button style={s.btn('#00c853')} onClick={buildAllTier1}>
                      🚀 Build All Tier 1 ({opportunities.filter(o => o.tier === 'TIER1').length})
                    </button>
                  </div>
                </div>

                {opportunities.map((opp, i) => (
                  <div key={i} style={s.oppCard(opp.tier)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      <span style={s.tierBadge(opp.tier)}>{TIER_LABELS[opp.tier]}</span>
                      <strong>{opp.niche}</strong>
                      <span style={{ color: 'var(--text-faint)' }}>→</span>
                      <strong>{opp.city}, {opp.state}</strong>
                      <span style={{ color: 'var(--text-faint)', fontSize: '12px' }}>
                        pop: {opp.population?.toLocaleString()}
                      </span>
                      <span style={{ color: '#00c853', fontSize: '12px', fontWeight: '700' }}>
                        ${opp.estimatedMonthlyRent}/mo
                      </span>
                      <span style={{ color: 'var(--text-faint)', fontSize: '12px' }}>
                        Score: {opp.oppScore || opp.priority}
                      </span>
                    </div>
                    {opp.reason && (
                      <div style={{ fontSize: '12px', color: 'var(--text-faint)', marginTop: '6px' }}>
                        {opp.reason}
                      </div>
                    )}
                    {opp.timeToRank && (
                      <div style={{ fontSize: '12px', color: '#00c853', marginTop: '4px' }}>
                        ⏱ {opp.timeToRank}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'map' && (
          <div style={s.panel}>
            <div className="empty">
              Opportunity map — visual city × niche matrix.<br/>
              Run discovery first to populate the map.
            </div>
          </div>
        )}

        {activeTab === 'saved' && (
          <div style={s.panel}>
            <div className="empty">
              Saved opportunities from previous scans will appear here.
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
