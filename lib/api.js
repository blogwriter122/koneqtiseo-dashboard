import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
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
  // Sites
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
  reachProduct: (d) => call('/api/reach/product', 'POST', d),
  // Locale
  localeScore: (d) => call('/api/locale/score', 'POST', d),
  localeRun: (d) => call('/api/locale/run', 'POST', d),
  localePortfolio: () => call('/api/locale/portfolio'),
  // Keyword Studio + Niche Studio (§12)
  studioValidate: (d) => call('/api/studio/validate', 'POST', d),
  studioScanCountries: (d) => call('/api/studio/scan-countries', 'POST', d),
  studioAIOverview: (d) => call('/api/studio/ai-overview', 'POST', d),
  studioMonetization: (d) => call('/api/studio/monetization', 'POST', d),
  studioResults: (params = {}) => call(`/api/studio/results?${new URLSearchParams(params)}`),
  studioDeleteResult: (id) => call(`/api/studio/results/${id}`, 'DELETE'),
  studioTrafficScout: (d) => call('/api/studio/traffic-scout', 'POST', d),     // PATH B
  studioMarketScan: (d) => call('/api/studio/market-scan', 'POST', d),         // PATH A
  studioSeeds: (d) => call('/api/studio/seeds', 'POST', d),                    // Seed generator
  studioCommissions: (d) => call('/api/studio/commissions', 'POST', d),        // Commission scout
  studioPlan: (d) => call('/api/studio/plan', 'POST', d),                      // Content planner
  studioValidateDirect: (d) => call('/api/studio/validate-direct', 'POST', d), // PATH C single
  studioValidateBulk: (d) => call('/api/studio/validate-bulk', 'POST', d),     // PATH C bulk
  studioBlueprint: (d) => call('/api/studio/blueprint', 'POST', d),            // Full site plan
  studioBuildTool: (d) => call('/api/studio/build-tool', 'POST', d),           // Build HTML tool
  // Affiliate Cluster System (§35)
  affiliateMarkets: () => call('/api/affiliate/markets'),
  affiliateMarket: (market) => call(`/api/affiliate/market/${encodeURIComponent(market)}`),
  affiliateSearch: (q, minCommission) => call(`/api/affiliate/search?q=${encodeURIComponent(q)}&minCommission=${minCommission || 0}`),
  affiliateBuildCluster: (d) => call('/api/affiliate/build-cluster', 'POST', d),
  affiliateClusters: (params = {}) => call(`/api/affiliate/clusters?${new URLSearchParams(params)}`),
  // Local Discovery Studio (§31)
  localDiscover: (d) => call('/api/local/discover', 'POST', d),
  localScanIndustries: (d) => call('/api/local/scan-industries', 'POST', d),
  localDrillNiches: (d) => call('/api/local/drill-niches', 'POST', d),
  localScanCities: (d) => call('/api/local/scan-cities', 'POST', d),
  localRankOpportunities: (d) => call('/api/local/rank-opportunities', 'POST', d),
  localOpportunities: (params = {}) => call(`/api/local/opportunities?${new URLSearchParams(params)}`),
  // Profiles (Model A — browser identities)
  getProfiles: () => call('/api/profiles'),
  addProfile: (d) => call('/api/profiles', 'POST', d),
  updateProfile: (id, d) => call(`/api/profiles/${id}`, 'PATCH', d),
  deleteProfile: (id) => call(`/api/profiles/${id}`, 'DELETE'),
  openProfile: (id) => call(`/api/profiles/${id}/open`, 'POST'),
  // Accounts (platform logins)
  addAccount: (d) => call('/api/accounts', 'POST', d),
  updateAccount: (id, d) => call(`/api/accounts/${id}`, 'PATCH', d),
  deleteAccount: (id) => call(`/api/accounts/${id}`, 'DELETE'),
  // Off-page domains
  getDomains: (q = {}) => call(`/api/domains?${new URLSearchParams(q)}`),
  getDomainStats: () => call('/api/domains/stats'),
  importDomains: (rows) => call('/api/domains/import', 'POST', { rows }),
  discoverDomains: (niche) => call('/api/domains/discover', 'POST', { niche }),
  deleteDomain: (id) => call(`/api/domains/${id}`, 'DELETE'),
  getBacklinks: (siteId) => call(`/api/backlinks/${siteId}`),
  // GSC Intelligence
  analyzeGSC: (d) => call('/api/gsc/analyze', 'POST', d),
  // AI Visibility
  promptExplorer: (d) => call('/api/ai-visibility/prompt', 'POST', d),
  aiVisibilityReport: (d) => call('/api/ai-visibility/report', 'POST', d),
  ghostTraffic: (d) => call('/api/ai-visibility/ghost-traffic', 'POST', d),
  // Off-page
  getOffpageStats: (siteId) => call(`/api/offpage/stats/${siteId}`),
  runCrossLink: (d) => call('/api/offpage/cross-link', 'POST', d),
  runDirectories: (d) => call('/api/offpage/directories', 'POST', d),
  runBacklinkAudit: (d) => call('/api/offpage/audit', 'POST', d),
  // CWV
  auditCWV: (d) => call('/api/cwv/audit', 'POST', d),
  // Campaign
  startCampaign: (d) => call('/api/campaign/start', 'POST', d),
  getCampaign: (id) => call(`/api/campaign/${id}`),
  onboardBusiness: (d) => call('/api/campaign/onboard', 'POST', d),
  reviewRequest: (d) => call('/api/campaign/review-request', 'POST', d),
  // Config + bots
  getConfig: () => call('/api/config'),
  saveConfig: (d) => call('/api/config', 'POST', d),
  botStatus: () => call('/api/bots/status'),
};

export const fetchers = {
  sites: async () => { const { data } = await supabase.from('sites').select('*').order('created_at', { ascending: false }); return data || []; },
  jobs: async () => { const { data } = await supabase.from('jobs').select('*').order('created_at', { ascending: false }).limit(50); return data || []; },
  published: async () => { const { data } = await supabase.from('published').select('*').order('published_at', { ascending: false }).limit(100); return data || []; },
  accounts: async () => { const { data } = await supabase.from('accounts').select('*').order('platform'); return data || []; },
  trends: async () => { const { data } = await supabase.from('trend_signals').select('*').eq('processed', false).order('score', { ascending: false }).limit(50); return data || []; },
  tools: async () => { const { data } = await supabase.from('tools').select('*').order('created_at', { ascending: false }); return data || []; },
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
