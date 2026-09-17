/**
 * pages/studio.js — Keyword Studio + Niche Studio
 *
 * THE START BUTTON. Two tabs:
 *   NICHE STUDIO: find/validate niches (affiliate/APK/menu/ecommerce/tool/info/parasite)
 *   LOCAL STUDIO: find city × niche opportunities (rank & rent)
 *
 * Three discovery paths:
 *   PATH A: broad market → authority site → weak SERPs
 *   PATH B: competitor site → top traffic pages → proven keywords
 *   PATH C: direct keyword input (single or bulk)
 *
 * MASTER_PLAN §12
 */

import { useState } from 'react';
import Layout from '../components/Layout';
import { api } from '../lib/api';

// Countries with their display names
const COUNTRIES = [
  { code: 'US', label: '🇺🇸 United States' },
  { code: 'UK', label: '🇬🇧 United Kingdom' },
  { code: 'PK', label: '🇵🇰 Pakistan' },
  { code: 'IN', label: '🇮🇳 India' },
  { code: 'UAE', label: '🇦🇪 UAE' },
  { code: 'CA', label: '🇨🇦 Canada' },
  { code: 'AU', label: '🇦🇺 Australia' },
  { code: 'SA', label: '🇸🇦 Saudi Arabia' },
  { code: 'DE', label: '🇩🇪 Germany' },
  { code: 'FR', label: '🇫🇷 France' },
];

const LANGUAGES = [
  { code: 'english', label: 'English' },
  { code: 'urdu', label: 'اردو Urdu' },
  { code: 'arabic', label: 'عربي Arabic' },
  { code: 'hindi', label: 'हिन्दी Hindi' },
  { code: 'german', label: 'Deutsch German' },
  { code: 'french', label: 'Français French' },
  { code: 'spanish', label: 'Español Spanish' },
  { code: 'persian', label: 'فارسی Persian' },
];

const NICHE_TYPES = [
  { value: 'affiliate', label: '🛒 Affiliate', desc: 'Amazon/merchant products' },
  { value: 'APK', label: '📱 APK', desc: 'App download sites' },
  { value: 'menu', label: '🍔 Menu', desc: 'Restaurant menu sites' },
  { value: 'ecommerce', label: '🏪 Ecommerce', desc: 'Product category stores' },
  { value: 'tool+info', label: '🔧 Tool+Info', desc: 'Free tools (AI-proof)' },
  { value: 'info', label: '📚 Info', desc: 'Informational sites' },
  { value: 'parasite', label: '🔗 Parasite', desc: 'Platform publishing' },
];

const VERDICT_COLORS = {
  GOLDMINE: '#00c853',
  STRONG: '#2979ff',
  MODERATE: '#ff9100',
  SKIP: '#f44336',
  ERROR: '#9e9e9e',
};

const AI_BADGES = {
  1: { label: '🟢 SAFE', color: '#00c853' },
  2: { label: '🟡 AEO-FIRST', color: '#ff9100' },
  3: { label: '🔴 HIGH RISK', color: '#f44336' },
  4: { label: '🟢 SAFE', color: '#00c853' },
  5: { label: '🔴 INDUSTRY', color: '#f44336' },
};

export default function StudioPage() {
  const [activeTab, setActiveTab] = useState('niche'); // niche | local | affiliate
  const [path, setPath] = useState('C'); // A | B | C
  const [nicheType, setNicheType] = useState('affiliate');
  const [country, setCountry] = useState('US');
  const [language, setLanguage] = useState('english');
  const [keyword, setKeyword] = useState('');
  const [bulkKeywords, setBulkKeywords] = useState('');
  const [siteUrl, setSiteUrl] = useState('');
  const [market, setMarket] = useState('');
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [results, setResults] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);
  const [blueprint, setBlueprint] = useState(null);
  const [blueprintLoading, setBlueprintLoading] = useState(false);

  const addLog = (msg) => setLogs(prev => [...prev.slice(-50), msg]);

  async function runDiscovery() {
    if (loading) return;
    setLoading(true);
    setLogs([]);
    setResults([]);
    setSelectedResult(null);
    setBlueprint(null);

    try {
      let result;

      if (path === 'A') {
        if (!market.trim()) { alert('Enter a broad market keyword'); setLoading(false); return; }
        addLog(`PATH A: Scanning market "${market}"...`);
        result = await api.studioMarketScan({ market, country, nicheType });
        if (result.opportunities) {
          // Validate top opportunities
          const validated = [];
          for (const opp of result.opportunities.slice(0, 5)) {
            addLog(`Validating: "${opp.keyword}"...`);
            const v = await api.studioValidateDirect({ keyword: opp.keyword, nicheType, country, language });
            validated.push(v);
          }
          setResults(validated);
        }
      } else if (path === 'B') {
        if (!siteUrl.trim()) { alert('Enter a competitor site URL'); setLoading(false); return; }
        addLog(`PATH B: Scouting traffic from ${siteUrl}...`);
        result = await api.studioTrafficScout({ siteUrl, country });
        if (result.opportunities) {
          const validated = [];
          for (const opp of result.opportunities.slice(0, 5)) {
            addLog(`Validating: "${opp.keyword}"...`);
            const v = await api.studioValidateDirect({ keyword: opp.keyword, nicheType, country, language });
            validated.push(v);
          }
          setResults(validated);
        }
      } else {
        // PATH C
        if (bulkKeywords.trim()) {
          addLog(`PATH C: Bulk validating ${bulkKeywords.split('\n').filter(k => k.trim()).length} keywords...`);
          result = await api.studioValidateBulk({
            keywordsRaw: bulkKeywords,
            nicheType, country, language,
          });
          setResults(result.results || []);
          addLog(`Done: ${result.summary?.goldmines || 0} GOLDMINE | ${result.summary?.strong || 0} STRONG | ${result.summary?.skip || 0} SKIP`);
        } else if (keyword.trim()) {
          addLog(`PATH C: Validating "${keyword}"...`);
          result = await api.studioValidateDirect({ keyword, nicheType, country, language });
          setResults([result]);
        } else {
          alert('Enter a keyword or paste keywords in bulk');
          setLoading(false);
          return;
        }
      }
    } catch (e) {
      addLog(`Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function generateBlueprint(result) {
    setBlueprintLoading(true);
    setBlueprint(null);
    try {
      addLog(`Generating full site plan for "${result.keyword}"...`);
      const bp = await api.studioBlueprint({ validationResult: result });
      setBlueprint(bp);
      addLog(`✅ Blueprint ready: ${bp.section5_contentPlan?.totalArticles} articles planned`);
    } catch (e) {
      addLog(`Blueprint error: ${e.message}`);
    } finally {
      setBlueprintLoading(false);
    }
  }

  async function generateSeeds() {
    setLoading(true);
    addLog('Generating seed ideas...');
    try {
      const result = await api.studioSeeds({ nicheType, market: market || undefined, maxCandidates: 50 });
      addLog(`Generated ${result.total} seed ideas`);
      // Auto-fill bulk textarea with strong action gap seeds
      const strong = result.seeds.filter(s => s.actionGap?.strength === 'strong').slice(0, 20);
      setBulkKeywords(strong.map(s => s.keyword).join('\n'));
      setPath('C');
      addLog(`${strong.length} strong action gap seeds → pasted to bulk input`);
    } catch (e) {
      addLog(`Seeds error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  const s = {
    page: { padding: '24px' },
    tabs: { display: 'flex', gap: '8px', marginBottom: '24px' },
    tab: (active) => ({
      padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer',
      background: active ? 'var(--forge)' : 'var(--panel)',
      color: active ? 'white' : 'var(--text)',
      fontWeight: active ? '700' : '400',
    }),
    panel: { background: 'var(--panel)', borderRadius: '12px', padding: '20px', marginBottom: '16px' },
    row: { display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-start' },
    col: (flex = 1) => ({ flex }),
    label: { fontSize: '12px', color: 'var(--text-faint)', fontWeight: '600', marginBottom: '4px', display: 'block' },
    select: { width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: '14px' },
    input: { width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: '14px' },
    textarea: { width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: '13px', fontFamily: 'monospace', minHeight: '100px', resize: 'vertical' },
    btn: (color = 'var(--forge)') => ({ background: color, color: 'white', border: 'none', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '14px' }),
    btnSm: { background: 'var(--panel)', color: 'var(--text)', border: '1px solid var(--border)', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' },
    pathBtn: (active) => ({ padding: '8px 16px', borderRadius: '8px', border: `2px solid ${active ? 'var(--forge)' : 'var(--border)'}`, background: active ? 'rgba(var(--forge-rgb),0.1)' : 'transparent', cursor: 'pointer', fontSize: '13px', fontWeight: active ? '700' : '400', color: 'var(--text)' }),
    nicheBtn: (active) => ({ padding: '8px 14px', borderRadius: '8px', border: `2px solid ${active ? 'var(--forge)' : 'var(--border)'}`, background: active ? 'rgba(var(--forge-rgb),0.1)' : 'transparent', cursor: 'pointer', fontSize: '12px', textAlign: 'left' }),
    resultCard: (verdict) => ({ background: 'var(--panel)', borderRadius: '10px', padding: '16px', borderLeft: `4px solid ${VERDICT_COLORS[verdict] || '#ccc'}`, cursor: 'pointer', marginBottom: '10px' }),
    verdictBadge: (verdict) => ({ background: VERDICT_COLORS[verdict] || '#ccc', color: 'white', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' }),
    logBox: { background: '#0d1117', borderRadius: '8px', padding: '12px', maxHeight: '150px', overflowY: 'auto', fontFamily: 'monospace', fontSize: '12px', color: '#7ee787' },
    blueprintSection: { background: 'var(--bg)', borderRadius: '8px', padding: '16px', marginBottom: '12px', border: '1px solid var(--border)' },
  };

  return (
    <Layout>
      <div style={s.page}>
        <div className="page-head">
          <div>
            <div className="page-title">🎯 Niche Studio</div>
            <div className="page-sub">Find niches → validate → generate full site plan → build</div>
          </div>
        </div>

        {/* Tabs */}
        <div style={s.tabs}>
          {[['niche', '🔍 Niche Studio'], ['local', '📍 Local Studio'], ['affiliate', '📦 Affiliate Clusters']].map(([tab, label]) => (
            <button key={tab} style={s.tab(activeTab === tab)} onClick={() => setActiveTab(tab)}>{label}</button>
          ))}
        </div>

        {/* ── NICHE STUDIO TAB ── */}
        {activeTab === 'niche' && (
          <>
            {/* Step 0: Country + Language */}
            <div style={s.panel}>
              <div style={{ fontWeight: '700', marginBottom: '12px' }}>Step 0 — Target Country + Language</div>
              <div style={s.row}>
                <div style={s.col()}>
                  <label style={s.label}>Country</label>
                  <select style={s.select} value={country} onChange={e => setCountry(e.target.value)}>
                    {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
                  </select>
                </div>
                <div style={s.col()}>
                  <label style={s.label}>Language</label>
                  <select style={s.select} value={language} onChange={e => setLanguage(e.target.value)}>
                    {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-faint)', marginTop: '8px' }}>
                💡 Same niche in Pakistan (Urdu) = DA&lt;5 competition, no AI Overview. Same in US = DA40+ overcrowded.
              </div>
            </div>

            {/* Niche Type */}
            <div style={s.panel}>
              <div style={{ fontWeight: '700', marginBottom: '12px' }}>Niche Type</div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {NICHE_TYPES.map(t => (
                  <button key={t.value} style={s.nicheBtn(nicheType === t.value)} onClick={() => setNicheType(t.value)}>
                    <div>{t.label}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-faint)' }}>{t.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Discovery Path */}
            <div style={s.panel}>
              <div style={{ fontWeight: '700', marginBottom: '12px' }}>Discovery Path</div>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                <button style={s.pathBtn(path === 'A')} onClick={() => setPath('A')}>
                  PATH A — Broad Market<br/><span style={{ fontSize: '11px', opacity: 0.7 }}>Find from market keyword</span>
                </button>
                <button style={s.pathBtn(path === 'B')} onClick={() => setPath('B')}>
                  PATH B — Site Traffic<br/><span style={{ fontSize: '11px', opacity: 0.7 }}>Analyze competitor site</span>
                </button>
                <button style={s.pathBtn(path === 'C')} onClick={() => setPath('C')}>
                  PATH C — Direct Input<br/><span style={{ fontSize: '11px', opacity: 0.7 }}>I have keywords</span>
                </button>
              </div>

              {path === 'A' && (
                <div>
                  <label style={s.label}>Broad Market Keyword</label>
                  <div style={s.row}>
                    <input style={{ ...s.input, flex: 1 }} placeholder="e.g. photography, home fitness, cooking..." value={market} onChange={e => setMarket(e.target.value)} />
                    <button style={s.btnSm} onClick={generateSeeds} disabled={loading}>💡 Generate Seeds</button>
                  </div>
                </div>
              )}

              {path === 'B' && (
                <div>
                  <label style={s.label}>Competitor Site URL</label>
                  <input style={s.input} placeholder="e.g. https://petapixel.com or petmd.com" value={siteUrl} onChange={e => setSiteUrl(e.target.value)} />
                </div>
              )}

              {path === 'C' && (
                <div style={s.row}>
                  <div style={s.col()}>
                    <label style={s.label}>Single Keyword</label>
                    <input style={s.input} placeholder="e.g. best air purifier for allergies" value={keyword} onChange={e => setKeyword(e.target.value)} />
                  </div>
                  <div style={s.col(2)}>
                    <label style={s.label}>Bulk Keywords (one per line)</label>
                    <textarea style={s.textarea} placeholder={'best air purifier\nair purifier for allergies\nair purifier for pets\nair purifier under $100'} value={bulkKeywords} onChange={e => setBulkKeywords(e.target.value)} />
                  </div>
                </div>
              )}
            </div>

            {/* Run button */}
            <button style={s.btn()} onClick={runDiscovery} disabled={loading}>
              {loading ? '⏳ Validating...' : '🔍 Find & Validate Niches'}
            </button>

            {/* Logs */}
            {logs.length > 0 && (
              <div style={{ ...s.logBox, marginTop: '16px' }}>
                {logs.map((log, i) => <div key={i}>{log}</div>)}
              </div>
            )}

            {/* Results */}
            {results.length > 0 && (
              <div style={{ marginTop: '24px' }}>
                <div style={{ fontWeight: '700', marginBottom: '12px' }}>
                  Results ({results.length}) — sorted by score
                </div>
                {results.sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0)).map((r, i) => (
                  <div key={i} style={s.resultCard(r.verdict)} onClick={() => setSelectedResult(r === selectedResult ? null : r)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      <span style={s.verdictBadge(r.verdict)}>{r.verdict}</span>
                      <strong>{r.keyword}</strong>
                      <span style={{ color: 'var(--text-faint)', fontSize: '13px' }}>{r.totalScore}/100</span>
                      {r.aiOverview && (
                        <span style={{ ...s.verdictBadge('MODERATE'), background: (AI_BADGES[r.aiOverview.type] || {}).color || '#ccc', fontSize: '11px' }}>
                          {(AI_BADGES[r.aiOverview.type] || {}).label}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-faint)', marginTop: '6px' }}>
                      {r.recommendation}
                    </div>

                    {selectedResult === r && (
                      <div style={{ marginTop: '14px', borderTop: '1px solid var(--border)', paddingTop: '14px' }}>
                        {/* Scores breakdown */}
                        {r.scores && (
                          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '14px' }}>
                            {Object.entries(r.scores).map(([k, v]) => (
                              <div key={k} style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--forge)' }}>{v}</div>
                                <div style={{ fontSize: '11px', color: 'var(--text-faint)' }}>{k}</div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Action buttons */}
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <button
                            style={s.btn()}
                            onClick={(e) => { e.stopPropagation(); generateBlueprint(r); }}
                            disabled={blueprintLoading}
                          >
                            {blueprintLoading ? '⏳ Generating...' : '📋 Generate Full Plan'}
                          </button>
                          <button style={s.btnSm} onClick={(e) => { e.stopPropagation(); window.open(`/forge/quickwrite?keyword=${encodeURIComponent(r.keyword)}`, '_blank'); }}>
                            ✍️ Quick Write
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Blueprint */}
            {blueprint && (
              <div style={{ marginTop: '24px' }}>
                <div style={{ fontWeight: '700', fontSize: '18px', marginBottom: '16px' }}>
                  📋 Site Blueprint: {blueprint.keyword}
                </div>

                {/* Summary */}
                <div style={{ ...s.blueprintSection, background: 'rgba(var(--forge-rgb),0.05)', borderColor: 'var(--forge)' }}>
                  <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                    <div><strong>{blueprint.summary?.totalArticles}</strong><div style={{ fontSize: '12px', color: 'var(--text-faint)' }}>Articles</div></div>
                    <div><strong>{blueprint.summary?.totalKeywords}</strong><div style={{ fontSize: '12px', color: 'var(--text-faint)' }}>Keywords</div></div>
                    <div><strong>{blueprint.summary?.languageVersions}</strong><div style={{ fontSize: '12px', color: 'var(--text-faint)' }}>Languages</div></div>
                    <div><strong>{blueprint.summary?.estimatedLaunchWeeks}w</strong><div style={{ fontSize: '12px', color: 'var(--text-faint)' }}>To Launch</div></div>
                    <div><strong>{blueprint.summary?.estimatedFirstRevenue}</strong><div style={{ fontSize: '12px', color: 'var(--text-faint)' }}>First Revenue</div></div>
                    {blueprint.summary?.isAIProof && <div style={{ color: '#00c853', fontWeight: '700' }}>✅ AI-PROOF</div>}
                  </div>
                </div>

                {/* Domain suggestions */}
                <div style={s.blueprintSection}>
                  <strong>Domain Suggestions</strong>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                    {blueprint.section3_branding?.domainSuggestions?.map(d => (
                      <span key={d} style={{ background: 'var(--panel)', padding: '4px 12px', borderRadius: '20px', fontSize: '13px', fontFamily: 'monospace' }}>{d}</span>
                    ))}
                  </div>
                </div>

                {/* Tool spec */}
                {blueprint.section2_tool?.name && (
                  <div style={s.blueprintSection}>
                    <strong>🔧 {blueprint.section2_tool.name}</strong>
                    <div style={{ fontSize: '13px', color: 'var(--text-faint)', marginTop: '6px' }}>{blueprint.section2_tool.description}</div>
                    <div style={{ marginTop: '8px', fontSize: '12px' }}>
                      <span style={{ background: 'var(--panel)', padding: '3px 8px', borderRadius: '4px', marginRight: '6px' }}>Complexity: {blueprint.section2_tool.complexity}</span>
                      <span style={{ background: 'var(--panel)', padding: '3px 8px', borderRadius: '4px' }}>Stack: {blueprint.section2_tool.techStack}</span>
                    </div>
                  </div>
                )}

                {/* Content plan preview */}
                <div style={s.blueprintSection}>
                  <strong>Content Plan ({blueprint.section5_contentPlan?.totalArticles} articles)</strong>
                  <div style={{ marginTop: '10px', maxHeight: '200px', overflowY: 'auto' }}>
                    {blueprint.section5_contentPlan?.articles?.slice(0, 10).map((a, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-faint)', minWidth: '40px' }}>Wk {a.week}</span>
                        <span style={{ fontSize: '11px', background: a.type === 'revenue' ? 'rgba(0,200,83,0.1)' : 'var(--panel)', color: a.type === 'revenue' ? '#00c853' : 'var(--text-faint)', padding: '2px 6px', borderRadius: '4px' }}>{a.type}</span>
                        <span style={{ fontSize: '13px' }}>{a.title}</span>
                      </div>
                    ))}
                    {blueprint.section5_contentPlan?.totalArticles > 10 && (
                      <div style={{ fontSize: '12px', color: 'var(--text-faint)', marginTop: '8px', textAlign: 'center' }}>
                        + {blueprint.section5_contentPlan.totalArticles - 10} more articles
                      </div>
                    )}
                  </div>
                </div>

                {/* Multilingual */}
                <div style={s.blueprintSection}>
                  <strong>🌍 Multilingual Plan</strong>
                  <div style={{ fontSize: '13px', marginTop: '8px' }}>
                    <div style={{ color: '#00c853', marginBottom: '4px' }}>
                      Primary: {blueprint.section9_multilingual?.recommendedLanguages?.join(', ')}
                    </div>
                    <div style={{ color: 'var(--text-faint)' }}>
                      {blueprint.section9_multilingual?.trafficMultiplier} traffic potential
                    </div>
                  </div>
                </div>

                {/* Launch checklist preview */}
                <div style={s.blueprintSection}>
                  <strong>🚀 Week 1 Launch Steps</strong>
                  <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
                    {blueprint.section10_checklist?.week1?.map((step, i) => (
                      <li key={i} style={{ fontSize: '13px', marginBottom: '4px' }}>{step}</li>
                    ))}
                  </ul>
                </div>

                {/* Build button */}
                <button style={s.btn('#00c853')} onClick={() => {
                  if (confirm(`Build this site for "${blueprint.keyword}"? This will start the Forge engine.`)) {
                    alert('Build queued! Go to Forge → Sites to monitor progress.');
                  }
                }}>
                  🚀 Build This Site
                </button>
              </div>
            )}
          </>
        )}

        {/* ── LOCAL STUDIO TAB ── */}
        {activeTab === 'local' && (
          <div style={s.panel}>
            <div className="empty">
              📍 Local Discovery Studio coming soon.<br />
              Will autonomously discover city × niche opportunities<br />
              from GBP categories → micro niches → city opportunity matrix.<br />
              <span style={{ fontSize: '12px', color: 'var(--text-faint)' }}>MASTER_PLAN §31</span>
            </div>
          </div>
        )}

        {/* ── AFFILIATE CLUSTERS TAB ── */}
        {activeTab === 'affiliate' && (
          <AffiliateTab api={api} s={s} addLog={addLog} logs={logs} />
        )}
      </div>
    </Layout>
  );
}

function AffiliateTab({ api, s, addLog, logs }) {
  const [markets, setMarkets] = useState(null);
  const [selectedMarket, setSelectedMarket] = useState(null);
  const [clusters, setClusters] = useState([]);
  const [dbStats, setDbStats] = useState(null);
  const [loading, setLoading] = useState(false);

  async function loadMarkets() {
    setLoading(true);
    try {
      const data = await api.affiliateMarkets();
      setMarkets(data.markets);
      setDbStats(data.stats);
    } catch (e) {
      addLog(`Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function loadMarketClusters(market) {
    setSelectedMarket(market);
    setLoading(true);
    try {
      const data = await api.affiliateMarket(market);
      setClusters(data.clusters || []);
    } catch (e) {
      addLog(`Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {!markets ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '32px', marginBottom: '16px' }}>📦</div>
          <div style={{ fontWeight: '700', marginBottom: '8px' }}>Affiliate Cluster System</div>
          <div style={{ color: 'var(--text-faint)', marginBottom: '24px', fontSize: '14px' }}>
            Sultan's 1M keyword system. 2,250+ clusters across 10 Amazon markets.<br/>
            Commission-first: highest paying categories built first.
          </div>
          <button style={s.btn()} onClick={loadMarkets} disabled={loading}>
            {loading ? '⏳ Loading...' : '📦 Load Amazon Markets'}
          </button>
        </div>
      ) : (
        <div>
          {dbStats && (
            <div style={{ ...s.panel, display: 'flex', gap: '24px', flexWrap: 'wrap', marginBottom: '16px' }}>
              <div><strong>{dbStats.totalMarkets}</strong><div style={{ fontSize: '12px', color: 'var(--text-faint)' }}>Markets</div></div>
              <div><strong>{dbStats.totalCategories}</strong><div style={{ fontSize: '12px', color: 'var(--text-faint)' }}>Clusters</div></div>
              <div><strong>{dbStats.totalKeywords?.toLocaleString()}</strong><div style={{ fontSize: '12px', color: 'var(--text-faint)' }}>Min Articles</div></div>
            </div>
          )}

          <div style={s.row}>
            {/* Market list */}
            <div style={{ ...s.panel, flex: '0 0 200px', padding: '12px' }}>
              <div style={{ fontWeight: '700', marginBottom: '12px', fontSize: '13px' }}>MARKETS</div>
              {markets.map(m => (
                <div
                  key={m.market}
                  style={{ padding: '8px', borderRadius: '6px', cursor: 'pointer', marginBottom: '4px', background: selectedMarket === m.market ? 'rgba(var(--forge-rgb),0.1)' : 'transparent', borderLeft: selectedMarket === m.market ? '3px solid var(--forge)' : '3px solid transparent' }}
                  onClick={() => loadMarketClusters(m.market)}
                >
                  <div style={{ fontSize: '13px', fontWeight: '600' }}>{m.market}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-faint)' }}>{m.commission}% | {m.totalCategories} clusters</div>
                </div>
              ))}
            </div>

            {/* Cluster grid */}
            <div style={{ flex: 1 }}>
              {selectedMarket && (
                <>
                  <div style={{ fontWeight: '700', marginBottom: '12px' }}>{selectedMarket} — {clusters.length} clusters</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '10px' }}>
                    {clusters.map(c => (
                      <div key={c.category} style={{ ...s.panel, padding: '12px', cursor: 'pointer' }}>
                        <div style={{ fontWeight: '600', fontSize: '13px', marginBottom: '6px' }}>{c.category}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-faint)', marginBottom: '8px' }}>{c.keywords?.length || 8} articles</div>
                        <div style={{ height: '4px', background: 'var(--border)', borderRadius: '2px' }}>
                          <div style={{ height: '100%', width: '0%', background: 'var(--forge)', borderRadius: '2px' }} />
                        </div>
                        <div style={{ fontSize: '10px', color: 'var(--text-faint)', marginTop: '4px' }}>not started</div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
