/**
 * pages/studio.js — Unified Discovery → Opportunity → Build Wizard (Option B)
 *
 * ONE flow, 4 steps:
 *   1. Discovery method (market / competitor / keyword / category)
 *   2. Find seeds
 *   3. Opportunity engine analyzes all → ranked results
 *   4. Pick winner → blueprint → build
 */

import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { api } from '../lib/api';

const DISCOVERY = [
  { id: 'keyword',    icon: '🔑', label: 'I have a keyword',      desc: 'Type keyword(s) directly', field: 'keyword' },
  { id: 'market',     icon: '🌐', label: 'Explore a market',       desc: 'Broad market → mine authority sites', field: 'market' },
  { id: 'competitor', icon: '🏆', label: 'Beat a competitor',      desc: 'Their site → steal their keywords', field: 'site' },
  { id: 'category',   icon: '🛒', label: 'Amazon category',        desc: 'Pick category → buyer keywords', field: 'category' },
];

const NICHE_TYPES = [
  { value: 'affiliate', label: '🛒 Affiliate' }, { value: 'apk', label: '📱 APK' },
  { value: 'menu', label: '🍔 Menu' }, { value: 'tool', label: '🔧 Tool+Info' },
  { value: 'info', label: '📚 Info' }, { value: 'ecommerce', label: '🏪 Ecommerce' },
  { value: 'rank_rent', label: '📍 Local Rank&Rent' },
];

// Fallback countries (shown if API not reachable yet)
const FALLBACK_COUNTRIES = [
  { code: 'US', name: 'USA', score: 84 }, { code: 'DE', name: 'Germany', score: 90 },
  { code: 'JP', name: 'Japan', score: 88 }, { code: 'UK', name: 'UK', score: 82 },
  { code: 'FR', name: 'France', score: 81 }, { code: 'ES', name: 'Spain', score: 76 },
  { code: 'CA', name: 'Canada', score: 78 }, { code: 'KR', name: 'South Korea', score: 84 },
  { code: 'CZ', name: 'Czechia', score: 84 }, { code: 'AU', name: 'Australia', score: 74 },
  { code: 'IT', name: 'Italy', score: 68 }, { code: 'NL', name: 'Netherlands', score: 68 },
  { code: 'PL', name: 'Poland', score: 72 }, { code: 'BR', name: 'Brazil', score: 68 },
  { code: 'TR', name: 'Turkey', score: 72 }, { code: 'RU', name: 'Russia', score: 72 },
  { code: 'IN', name: 'India', score: 72 }, { code: 'PK', name: 'Pakistan', score: 74 },
  { code: 'AE', name: 'UAE', score: 72 }, { code: 'SA', name: 'Saudi Arabia', score: 72 },
];

export default function StudioPage() {
  const [step, setStep] = useState(1);
  const [method, setMethod] = useState('keyword');
  const [nicheType, setNicheType] = useState('affiliate');
  const [country, setCountry] = useState('US');
  const [scanAllCountries, setScanAllCountries] = useState(false);  // find easiest country
  const [countryScan, setCountryScan] = useState(null);
  const [countries, setCountries] = useState(FALLBACK_COUNTRIES);
  const [language, setLanguage] = useState('english');
  // inputs per method
  const [keyword, setKeyword] = useState('');
  const [market, setMarket] = useState('');
  const [site, setSite] = useState('');
  const [category, setCategory] = useState('');
  // flow state
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [seeds, setSeeds] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [selected, setSelected] = useState(null);
  const [blueprint, setBlueprint] = useState(null);

  useEffect(() => {
    api.getCountryScores({ limit: 20 }).then(r => {
      if (r.countries?.length) setCountries(r.countries);
    }).catch(() => {});
  }, []);

  const addLog = (m) => setLogs(p => [...p, m]);

  // STEP 2 → find seeds based on method
  async function findSeeds() {
    setLoading(true); setLogs([]); setSeeds([]); setOpportunities([]); setCountryScan(null);
    try {
      // Multi-country scan mode (keyword only) — find easiest country
      if (scanAllCountries && method === 'keyword') {
        const kw = keyword.split('\n').map(k => k.trim()).filter(Boolean)[0];
        if (!kw) { addLog('Enter a keyword'); setLoading(false); return; }
        addLog(`🌍 Scanning "${kw}" across countries to find the easiest...`);
        const scan = await api.multiCountryScan({ keyword: kw });
        setCountryScan(scan);
        addLog(`✅ Easiest: ${scan.best?.country} (rankability ${scan.best?.rankability})`);
        setStep(3);
        setLoading(false);
        return;
      }

      let seedList = [];
      if (method === 'keyword') {
        seedList = keyword.split('\n').map(k => k.trim()).filter(Boolean);
        addLog(`Using ${seedList.length} keyword(s)`);
      } else if (method === 'market') {
        addLog(`Mining market "${market}"...`);
        const r = await api.studioMarketScan({ market, country, nicheType });
        seedList = (r.opportunities || []).map(o => o.keyword);
        addLog(`Found ${seedList.length} seeds from authority sites`);
      } else if (method === 'competitor') {
        addLog(`Reverse engineering ${site}...`);
        const r = await api.mineWinnerSite({ domain: site, country });
        // winner mining already returns opportunities with rankability
        if (r.opportunities?.length) {
          setOpportunities(r.opportunities.sort((a, b) => b.rankability - a.rankability));
          addLog(`✅ ${r.winnable || 0} winnable opportunities`);
          setStep(3); setLoading(false); return;
        }
        seedList = [];
        if (r.note) addLog(`⚠️ ${r.note}`);
      } else if (method === 'category') {
        addLog(`Mining Amazon buyer keywords for "${category}"...`);
        const r = await api.affiliateBestKeywords({ category, country });
        seedList = (r.keywords || []).map(k => typeof k === 'string' ? k : k.keyword);
        addLog(`Found ${seedList.length} buyer keywords`);
      }
      setSeeds(seedList);
      if (seedList.length) { await analyzeSeeds(seedList); }
      else { addLog('No seeds found'); setLoading(false); }
    } catch (e) { addLog(`Error: ${e.message}`); setLoading(false); }
  }

  // STEP 3 → run opportunity engine on all seeds
  async function analyzeSeeds(seedList) {
    addLog(`Analyzing ${seedList.length} keywords through opportunity engine...`);
    const opps = [];
    for (const kw of seedList.slice(0, 20)) {
      try {
        const opp = await api.analyzeOpportunity({ keyword: kw, country });
        opps.push(opp);
        addLog(`  ${kw}: rankability ${opp.rankability} (${opp.verdict})`);
      } catch (_) {}
    }
    opps.sort((a, b) => b.rankability - a.rankability);
    setOpportunities(opps);
    setStep(3);
    setLoading(false);
  }

  // STEP 4 → blueprint for selected
  async function buildBlueprint(opp) {
    setSelected(opp);
    setLoading(true);
    addLog(`Building blueprint for "${opp.keyword}"...`);
    try {
      const bp = await api.studioBlueprint({ validationResult: { keyword: opp.keyword, nicheType, country, language, rankability: opp.rankability } });
      setBlueprint(bp);
      setStep(4);
    } catch (e) { addLog(`Error: ${e.message}`); } finally { setLoading(false); }
  }

  const s = {
    page: { padding: '24px' },
    panel: { background: 'var(--panel)', borderRadius: '12px', padding: '20px', marginBottom: '16px' },
    steps: { display: 'flex', gap: '8px', marginBottom: '20px' },
    stepChip: (active, done) => ({ flex: 1, padding: '10px', borderRadius: '8px', textAlign: 'center', fontSize: '12px', fontWeight: '700', background: done ? '#00c853' : active ? 'var(--forge)' : 'var(--bg)', color: done || active ? 'white' : 'var(--text-faint)', border: '1px solid var(--border)' }),
    methodGrid: { display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '12px' },
    methodCard: (a) => ({ padding: '18px', borderRadius: '12px', border: `2px solid ${a ? 'var(--forge)' : 'var(--border)'}`, background: a ? 'rgba(108,71,255,0.08)' : 'var(--bg)', cursor: 'pointer' }),
    input: { width: '100%', padding: '11px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: '14px' },
    textarea: { width: '100%', minHeight: '100px', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: '13px', fontFamily: 'monospace' },
    select: { padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: '14px' },
    btn: (c = 'var(--forge)') => ({ background: c, color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '14px' }),
    label: { fontSize: '12px', color: 'var(--text-faint)', fontWeight: '600', marginBottom: '6px', display: 'block' },
    logBox: { background: '#0d1117', borderRadius: '8px', padding: '12px', fontFamily: 'monospace', fontSize: '12px', color: '#7ee787', maxHeight: '140px', overflowY: 'auto', marginTop: '12px' },
    table: { width: '100%', borderCollapse: 'collapse', fontSize: '13px' },
    th: { background: 'var(--bg)', padding: '8px 12px', textAlign: 'left', fontWeight: '700', borderBottom: '2px solid var(--border)', fontSize: '11px', color: 'var(--text-faint)', textTransform: 'uppercase' },
    td: { padding: '10px 12px', borderBottom: '1px solid var(--border)' },
    badge: (v) => ({ background: v === 'STRONG' ? '#00c853' : v === 'MODERATE' ? '#ff9100' : v === 'WEAK' ? '#e0a000' : '#f44336', color: 'white', padding: '2px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '700' }),
  };

  return (
    <Layout>
      <div style={s.page}>
        <div className="page-head">
          <div>
            <div className="page-title">🎯 Niche Studio</div>
            <div className="page-sub">Discover → analyze opportunity → build. One flow.</div>
          </div>
        </div>

        {/* Step indicator */}
        <div style={s.steps}>
          {['1. Discover', '2. Find Seeds', '3. Opportunities', '4. Build'].map((label, i) => (
            <div key={i} style={s.stepChip(step === i + 1, step > i + 1)}>{label}</div>
          ))}
        </div>

        {/* STEP 1: Discovery method */}
        {step === 1 && (
          <div style={s.panel}>
            <div style={{ fontWeight: '700', marginBottom: '16px' }}>How do you want to find niches?</div>
            <div style={s.methodGrid}>
              {DISCOVERY.map(d => (
                <div key={d.id} style={s.methodCard(method === d.id)} onClick={() => setMethod(d.id)}>
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>{d.icon}</div>
                  <div style={{ fontWeight: '700', marginBottom: '4px' }}>{d.label}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-faint)' }}>{d.desc}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '20px', flexWrap: 'wrap' }}>
              <div><label style={s.label}>Niche Type</label>
                <select style={s.select} value={nicheType} onChange={e => setNicheType(e.target.value)}>
                  {NICHE_TYPES.map(n => <option key={n.value} value={n.value}>{n.label}</option>)}
                </select>
              </div>
              <div><label style={s.label}>Country</label>
                <select style={s.select} value={country} onChange={e => setCountry(e.target.value)} disabled={scanAllCountries}>
                  {countries.map(c => <option key={c.code} value={c.code}>{c.name} ({c.score})</option>)}
                </select>
              </div>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '14px', fontSize: '13px', cursor: 'pointer', color: 'var(--text)' }}>
              <input type="checkbox" checked={scanAllCountries} onChange={e => setScanAllCountries(e.target.checked)} />
              🌍 Find the EASIEST country to rank (scan across markets) — best for a single keyword
            </label>
            <button style={{ ...s.btn(), marginTop: '20px' }} onClick={() => setStep(2)}>Next →</button>
          </div>
        )}

        {/* STEP 2: Input for the method */}
        {step === 2 && (
          <div style={s.panel}>
            <div style={{ fontWeight: '700', marginBottom: '16px' }}>{DISCOVERY.find(d => d.id === method)?.label}</div>
            {method === 'keyword' && (
              <div><label style={s.label}>Keywords (one per line)</label>
                <textarea style={s.textarea} placeholder={"best air purifier\nair purifier for pets"} value={keyword} onChange={e => setKeyword(e.target.value)} />
              </div>
            )}
            {method === 'market' && (
              <div><label style={s.label}>Broad market</label>
                <input style={s.input} placeholder="photography, home fitness, coffee" value={market} onChange={e => setMarket(e.target.value)} />
              </div>
            )}
            {method === 'competitor' && (
              <div><label style={s.label}>Competitor domain</label>
                <input style={s.input} placeholder="competitor.com" value={site} onChange={e => setSite(e.target.value)} />
              </div>
            )}
            {method === 'category' && (
              <div><label style={s.label}>Amazon category</label>
                <input style={s.input} placeholder="Air Purifiers, Espresso Machines" value={category} onChange={e => setCategory(e.target.value)} />
              </div>
            )}
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button style={s.btn('#444')} onClick={() => setStep(1)}>← Back</button>
              <button style={s.btn()} onClick={findSeeds} disabled={loading}>{loading ? '⏳ Working...' : '🔍 Find & Analyze →'}</button>
            </div>
            {logs.length > 0 && <div style={s.logBox}>{logs.map((l, i) => <div key={i}>{l}</div>)}</div>}
          </div>
        )}

        {/* STEP 3: Opportunities ranked */}
        {step === 3 && (
          <div style={s.panel}>
            {/* Multi-country scan result */}
            {countryScan && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontWeight: '700', marginBottom: '4px' }}>🌍 Best country to rank for "{countryScan.keyword}"</div>
                <div style={{ fontSize: '12px', color: 'var(--text-faint)', marginBottom: '12px' }}>
                  Easiest: <strong style={{ color: '#00c853' }}>{countryScan.best?.country}</strong> — build there first
                </div>
                <table style={s.table}>
                  <thead><tr><th style={s.th}>Country</th><th style={s.th}>Rankability</th><th style={s.th}>SERP Weak</th><th style={s.th}>Volume</th><th style={s.th}>Opportunity</th><th style={s.th}>Verdict</th></tr></thead>
                  <tbody>
                    {countryScan.countries?.map((c, i) => (
                      <tr key={i} style={{ background: i === 0 ? 'rgba(0,200,83,0.06)' : 'transparent' }}>
                        <td style={{ ...s.td, fontWeight: i === 0 ? '700' : '400' }}>{i === 0 && '🏆 '}{c.country}</td>
                        <td style={{ ...s.td, fontWeight: '700', color: c.rankability >= 50 ? '#00c853' : 'var(--text)' }}>{c.rankability}</td>
                        <td style={s.td}>{c.serpWeakness ?? '—'}</td>
                        <td style={s.td}>{c.volume?.toLocaleString() ?? '—'}</td>
                        <td style={{ ...s.td, fontWeight: '700' }}>{c.opportunityScore}</td>
                        <td style={s.td}><span style={s.badge(c.verdict)}>{c.verdict}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button style={{ ...s.btn(), marginTop: '12px' }} onClick={() => {
                  setCountry(countryScan.best?.country);
                  setScanAllCountries(false);
                  setKeyword(countryScan.keyword);
                  findSeeds();
                }}>
                  Analyze "{countryScan.keyword}" in {countryScan.best?.country} →
                </button>
              </div>
            )}

            {!countryScan && (<>
            <div style={{ fontWeight: '700', marginBottom: '4px' }}>Opportunities (ranked by rankability)</div>
            <div style={{ fontSize: '12px', color: 'var(--text-faint)', marginBottom: '16px' }}>
              {opportunities.filter(o => o.rankability >= 50).length} winnable of {opportunities.length} analyzed. Click one to build.
            </div>
            {opportunities.length === 0 ? <div className="empty">No opportunities. Try another method.</div> : (
              <table style={s.table}>
                <thead><tr><th style={s.th}>Keyword</th><th style={s.th}>Rankability</th><th style={s.th}>SERP Weak</th><th style={s.th}>Beatable</th><th style={s.th}>Verdict</th><th style={s.th}></th></tr></thead>
                <tbody>
                  {opportunities.map((o, i) => (
                    <tr key={i}>
                      <td style={s.td}>{o.keyword}</td>
                      <td style={{ ...s.td, fontWeight: '700', color: o.rankability >= 50 ? '#00c853' : 'var(--text)' }}>{o.rankability}</td>
                      <td style={s.td}>{o.serpWeakness ?? '—'}</td>
                      <td style={s.td}>{o.beatablePages ?? '—'}</td>
                      <td style={s.td}><span style={s.badge(o.verdict)}>{o.verdict}</span></td>
                      <td style={s.td}><button style={{ ...s.btn(), padding: '5px 14px', fontSize: '12px' }} onClick={() => buildBlueprint(o)} disabled={loading}>Build →</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            </>)}
            <button style={{ ...s.btn('#444'), marginTop: '16px' }} onClick={() => setStep(2)}>← Back</button>
          </div>
        )}

        {/* STEP 4: Blueprint → build */}
        {step === 4 && blueprint && (
          <div style={s.panel}>
            <div style={{ fontWeight: '700', marginBottom: '8px' }}>📐 Blueprint: {selected?.keyword}</div>
            <div style={{ fontSize: '13px', color: 'var(--text-faint)', marginBottom: '16px' }}>
              Rankability {selected?.rankability} · {nicheType} · {country}
            </div>
            <div style={{ background: 'var(--bg)', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
              <div style={{ fontSize: '13px', marginBottom: '8px' }}>
                <strong>Silo:</strong> {blueprint.silo?.pillars?.length || 0} pillars, {blueprint.silo?.totalArticles || blueprint.articleCount || '?'} articles planned
              </div>
              {blueprint.clusters && <div style={{ fontSize: '13px' }}><strong>Clusters:</strong> {blueprint.clusters.length || Object.keys(blueprint.clusters).length}</div>}
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button style={s.btn('#444')} onClick={() => setStep(3)}>← Back to opportunities</button>
              <button style={s.btn('#00c853')} onClick={() => alert('Add a domain in Sites, then Start Campaign (new_site mode) to build this.')}>
                🚀 Build This Site
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
