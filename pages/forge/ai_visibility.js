/**
 * pages/forge/ai_visibility.js — AI Visibility Monitor Dashboard
 */

import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { api, fetchers } from '../../lib/api';

export default function AIVisibilityPage() {
  const [sites, setSites] = useState([]);
  const [selectedSite, setSelectedSite] = useState('');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [promptResult, setPromptResult] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => { fetchers.sites().then(setSites); }, []);

  async function runPromptExplorer() {
    if (!prompt) return;
    setLoading(true);
    try {
      const result = await api.promptExplorer({ prompt });
      setPromptResult(result);
    } catch (e) { alert(e.message); } finally { setLoading(false); }
  }

  const s = {
    page: { padding: '24px' },
    panel: { background: 'var(--panel)', borderRadius: '12px', padding: '20px', marginBottom: '16px' },
    tabs: { display: 'flex', gap: '8px', marginBottom: '20px' },
    tab: (a) => ({ padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: a ? 'var(--forge)' : 'var(--panel)', color: a ? 'white' : 'var(--text)', fontWeight: a ? '700' : '400', fontSize: '13px' }),
    input: { width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: '14px' },
    btn: (color = 'var(--forge)') => ({ background: color, color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '14px' }),
    metricCard: { background: 'var(--bg)', borderRadius: '10px', padding: '16px', textAlign: 'center', border: '1px solid var(--border)' },
    responseBox: { background: '#0d1117', borderRadius: '8px', padding: '16px', fontFamily: 'monospace', fontSize: '12px', color: '#7ee787', maxHeight: '200px', overflowY: 'auto', marginTop: '12px' },
  };

  return (
    <Layout>
      <div style={s.page}>
        <div className="page-head">
          <div>
            <div className="page-title">🤖 AI Visibility</div>
            <div className="page-sub">Monitor your brand across ChatGPT, Perplexity and Gemini</div>
          </div>
        </div>

        <div style={s.tabs}>
          {[['overview','📊 Overview'],['prompt','🔍 Prompt Explorer'],['citations','🔗 Citations'],['ghost','👻 Ghost Traffic']].map(([tab, label]) => (
            <button key={tab} style={s.tab(activeTab === tab)} onClick={() => setActiveTab(tab)}>{label}</button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '16px' }}>
              {[
                { label: 'Share of Voice', value: report?.shareOfVoice?.ourShareOfVoice ? `${report.shareOfVoice.ourShareOfVoice}%` : '—', icon: '📢' },
                { label: 'Cited Pages', value: report?.citedSources?.length ?? '—', icon: '🔗' },
                { label: 'Brand Mention Rate', value: report?.brandLookup?.mentionRate ? `${report.brandLookup.mentionRate}%` : '—', icon: '🏷️' },
                { label: 'Ghost Traffic', value: report?.ghostTraffic?.ghostTrafficShare ? `${report.ghostTraffic.ghostTrafficShare}%` : '—', icon: '👻' },
              ].map(m => (
                <div key={m.label} style={s.metricCard}>
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>{m.icon}</div>
                  <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--forge)' }}>{m.value}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-faint)', marginTop: '4px' }}>{m.label}</div>
                </div>
              ))}
            </div>
            <div style={s.panel}>
              <div className="empty">Connect a site and run AI Visibility report to see data</div>
            </div>
          </>
        )}

        {activeTab === 'prompt' && (
          <div style={s.panel}>
            <div style={{ fontWeight: '700', marginBottom: '8px' }}>Prompt Explorer</div>
            <div style={{ fontSize: '13px', color: 'var(--text-faint)', marginBottom: '16px' }}>
              Run the same prompt across ChatGPT, Perplexity and Gemini — see if your site gets cited.
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input style={s.input} placeholder="e.g. best air purifier for bedroom 2026" value={prompt} onChange={e => setPrompt(e.target.value)} onKeyDown={e => e.key === 'Enter' && runPromptExplorer()} />
              <button style={s.btn()} onClick={runPromptExplorer} disabled={loading || !prompt}>
                {loading ? '⏳' : '▶ Run'}
              </button>
            </div>
            {promptResult && (
              <div style={{ marginTop: '16px' }}>
                {(promptResult.results || []).map((r, i) => (
                  <div key={i} style={{ ...s.panel, marginBottom: '10px' }}>
                    <div style={{ fontWeight: '700', marginBottom: '8px' }}>{r.platform}</div>
                    {r.error ? (
                      <div style={{ color: '#f44336', fontSize: '13px' }}>❌ {r.error}</div>
                    ) : (
                      <>
                        <div style={s.responseBox}>{r.responseText?.slice(0, 500)}...</div>
                        {r.citations?.length > 0 && (
                          <div style={{ marginTop: '10px' }}>
                            <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-faint)', marginBottom: '6px' }}>CITATIONS ({r.citations.length}):</div>
                            {r.citations.map((c, j) => (
                              <div key={j} style={{ fontSize: '12px', color: 'var(--forge)', fontFamily: 'monospace' }}>→ {c.domain}</div>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'citations' && (
          <div style={s.panel}>
            <div className="empty">Run a full AI Visibility report to see which pages are being cited by AI platforms.</div>
          </div>
        )}

        {activeTab === 'ghost' && (
          <div style={s.panel}>
            <div style={{ fontWeight: '700', marginBottom: '8px' }}>Ghost Traffic</div>
            <div style={{ fontSize: '13px', color: 'var(--text-faint)', marginBottom: '16px' }}>
              Pages with high impressions but near-zero CTR — likely caused by AI Overviews stealing clicks.
            </div>
            <div className="empty">Connect GSC to see ghost traffic data.</div>
          </div>
        )}
      </div>
    </Layout>
  );
}
