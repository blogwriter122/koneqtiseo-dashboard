import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

const ENGINE = process.env.NEXT_PUBLIC_ENGINE_URL || 'http://localhost:3100';

async function call(path, method = 'GET', body) {
  const res = await fetch(`${ENGINE}${path}`, {
    method, headers: { 'Content-Type': 'application/json' },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status}`);
  return res.json();
}

export const api = {
  health: () => call('/api/health'),
  sites: () => call('/api/sites'),
  addSite: (s) => call('/api/sites', 'POST', s),
  updateSite: (id, f) => call(`/api/sites/${id}`, 'PATCH', f),
  verifySite: (s) => call('/api/sites/verify', 'POST', s),
  // Forge
  nicheAuto: (niche, country) => call('/api/forge/niche/auto', 'POST', { niche, country }),
  nicheManual: (url) => call('/api/forge/niche/manual', 'POST', { url }),
  nicheResults: () => call('/api/forge/niche/results'),
  battleplan: (d) => call('/api/run/battleplan', 'POST', d),
  keywords: (d) => call('/api/run/keywords', 'POST', d),
  silo: (d) => call('/api/run/silo', 'POST', d),
  trust: (d) => call('/api/run/trust', 'POST', d),
  write: (d) => call('/api/run/write', 'POST', d),
  writeSilo: (d) => call('/api/run/write-silo', 'POST', d),
  forgeMonitor: (d) => call('/api/forge/monitor', 'POST', d),
  forgeOffpage: (d) => call('/api/forge/offpage', 'POST', d),
  // Reach
  parasiteWrite: (d) => call('/api/parasite/write', 'POST', d),
  parasiteBulk: (d) => call('/api/parasite/bulk', 'POST', d),
  reachDesign: (d) => call('/api/reach/design', 'POST', d),
  reachWp: (d) => call('/api/reach/wp', 'POST', d),
  reachRevenue: () => call('/api/reach/revenue'),
  reachKeywords: () => call('/api/reach/keywords'),
  reachDiscover: (niche) => call('/api/reach/keywords/discover', 'POST', { niche }),
  reachRevenueRefresh: () => call('/api/reach/revenue/refresh', 'POST', {}),
  // Locale
  localeScore: (d) => call('/api/locale/score', 'POST', d),
  localeRun: (d) => call('/api/locale/run', 'POST', d),
  localePortfolio: () => call('/api/locale/portfolio'),
  // Keyword Studio + Niche Studio
  studioValidate: (d) => call('/api/studio/validate', 'POST', d),
  studioScanCountries: (d) => call('/api/studio/scan-countries', 'POST', d),
  studioAIOverview: (d) => call('/api/studio/ai-overview', 'POST', d),
  studioMonetization: (d) => call('/api/studio/monetization', 'POST', d),
  studioResults: (params = {}) => call(`/api/studio/results?${new URLSearchParams(params)}`),
  studioDeleteResult: (id) => call(`/api/studio/results/${id}`, 'DELETE'),
  studioTrafficScout: (d) => call('/api/studio/traffic-scout', 'POST', d),  // PATH B
  studioMarketScan: (d) => call('/api/studio/market-scan', 'POST', d),      // PATH A
  // Local Discovery Studio
  localOpportunities: (params = {}) => call(`/api/local/opportunities?${new URLSearchParams(params)}`),
  // Affiliate Clusters
  affiliateClusters: (params = {}) => call(`/api/affiliate/clusters?${new URLSearchParams(params)}`),
  // Config + bots + products
  getConfig: () => call('/api/config'),
  saveConfig: (d) => call('/api/config', 'POST', d),
  botStatus: () => call('/api/bots/status'),
  reachProduct: (d) => call('/api/reach/product', 'POST', d),
};

export const fetchers = {
  sites: async () => { const { data } = await supabase.from('sites').select('*').order('created_at', { ascending: false }); return data || []; },
  jobs: async () => { const { data } = await supabase.from('jobs').select('*').order('created_at', { ascending: false }).limit(50); return data || []; },
  published: async () => { const { data } = await supabase.from('published').select('*').order('published_at', { ascending: false }).limit(100); return data || []; },
  accounts: async () => { const { data } = await supabase.from('accounts').select('*').order('platform'); return data || []; },
  trends: async () => { const { data } = await supabase.from('trend_signals').select('*').eq('processed', false).order('score', { ascending: false }).limit(50); return data || []; },
  tools: async () => { const { data } = await supabase.from('tools').select('*').order('created_at', { ascending: false }); return data || []; },
  // Studio
  studioResults: async (verdict) => {
    let q = supabase.from('studio_results').select('*').order('created_at', { ascending: false }).limit(100);
    if (verdict) q = q.eq('verdict', verdict);
    const { data } = await q;
    return data || [];
  },
  localOpportunities: async (tier) => {
    let q = supabase.from('local_opportunities').select('*').order('opp_score', { ascending: false });
    if (tier) q = q.eq('tier', tier);
    const { data } = await q;
    return data || [];
  },
  affiliateClusters: async () => {
    const { data } = await supabase.from('affiliate_clusters').select('*').order('created_at', { ascending: false });
    return data || [];
  },
};
