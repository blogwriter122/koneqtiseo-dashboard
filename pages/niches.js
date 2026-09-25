/**
 * forge/studio/niche_store.js — Niche Catalog Store
 *
 * Mined niches accumulate here → browse 1000s (Amazon-style tree) →
 * click any → full plan (cached, instant).
 *
 * MASTER_PLAN §12 — browsable niche catalog
 */

'use strict';

const db = require('../../shared/db');

/**
 * Save discovered niches (from vertical/market/competitor mining)
 */
async function saveNiches(niches, meta = {}, userId = null, onLog = console.log) {
  const { vertical, subcategory, nicheType, country, language } = meta;
  let saved = 0;

  for (const n of niches) {
    try {
      await db.supabase.from('niches').upsert({
        user_id: userId,
        vertical: vertical || null,
        subcategory: subcategory || null,
        niche_type: nicheType || 'info',
        country: country || 'US',
        language: language || 'english',
        keyword: n.keyword,
        volume: n.sourceVolume || n.volume || null,
        difficulty: n.difficulty || null,
        rankability: n.rankability || null,
        serp_weakness: n.serpWeakness || null,
        verdict: n.verdict || null,
        best_country: n.bestCountry || null,
        status: 'discovered',
      }, { onConflict: 'user_id,keyword,country' });
      saved++;
    } catch (_) {}
  }
  onLog(`  💾 Saved ${saved} niches to catalog`);
  return saved;
}

/**
 * Browse the niche catalog (tree + filters)
 */
async function browseNiches(options = {}, userId = null) {
  const { vertical, subcategory, nicheType, country, minScore, verdict, sortBy = 'rankability', limit = 100, offset = 0 } = options;

  let q = db.supabase.from('niches').select('*');
  if (userId) q = q.or(`user_id.eq.${userId},user_id.is.null`);
  if (vertical) q = q.eq('vertical', vertical);
  if (subcategory) q = q.eq('subcategory', subcategory);
  if (nicheType) q = q.eq('niche_type', nicheType);
  if (country) q = q.eq('country', country);
  if (minScore) q = q.gte('rankability', minScore);
  if (verdict) q = q.eq('verdict', verdict);

  const orderCol = sortBy === 'volume' ? 'volume' : sortBy === 'score' ? 'total_score' : 'rankability';
  q = q.order(orderCol, { ascending: false, nullsFirst: false }).range(offset, offset + limit - 1);

  const { data } = await q;
  return data || [];
}

/**
 * Get the catalog tree (verticals → subcategories → counts)
 */
async function getCatalogTree(userId = null) {
  let q = db.supabase.from('niches').select('vertical, subcategory, verdict');
  if (userId) q = q.or(`user_id.eq.${userId},user_id.is.null`);
  const { data } = await q;

  const tree = {};
  for (const n of (data || [])) {
    const v = n.vertical || 'other';
    if (!tree[v]) tree[v] = { vertical: v, count: 0, winnable: 0, subcategories: {} };
    tree[v].count++;
    if (['GOLDMINE', 'STRONG'].includes(n.verdict)) tree[v].winnable++;
    const sub = n.subcategory || 'general';
    if (!tree[v].subcategories[sub]) tree[v].subcategories[sub] = { name: sub, count: 0 };
    tree[v].subcategories[sub].count++;
  }

  return Object.values(tree).map(v => ({
    ...v,
    subcategories: Object.values(v.subcategories),
  }));
}

/**
 * Get one niche's full plan (validate + build cluster/silo if not cached)
 */
async function getNichePlan(nicheId, page = null, onLog = console.log) {
  const { data: niche } = await db.supabase.from('niches').select('*').eq('id', nicheId).single();
  if (!niche) throw new Error('Niche not found');

  // If plan already cached, return it
  if (niche.blueprint && niche.cluster && niche.silo) {
    return { niche, cached: true };
  }

  // Otherwise generate the full plan now (validate + blueprint)
  if (page) {
    const { validateNiche } = require('./validator');
    const validation = await validateNiche(page, {
      keyword: niche.keyword, nicheType: niche.niche_type,
      country: niche.country, language: niche.language,
    }, onLog).catch(() => null);

    let blueprint = null;
    if (validation && ['GOLDMINE', 'STRONG', 'MODERATE'].includes(validation.verdict)) {
      const { generateBlueprint } = require('./blueprint_generator');
      blueprint = await generateBlueprint(page, validation, onLog).catch(() => null);
    }

    // Cache the plan
    await db.supabase.from('niches').update({
      total_score: validation?.totalScore,
      verdict: validation?.verdict,
      score_traffic: validation?.scores?.trafficProof,
      score_competition: validation?.scores?.competition,
      score_monetization: validation?.scores?.monetization,
      score_sustainability: validation?.scores?.sustainability,
      score_cluster: validation?.scores?.cluster,
      cluster: blueprint?.section4_cluster || null,
      silo: blueprint?.section6_structure || null,
      blueprint: blueprint || null,
      status: 'validated',
      validated_at: new Date().toISOString(),
    }).eq('id', nicheId).catch(() => {});

    return { niche: { ...niche, validation, blueprint }, validation, blueprint, cached: false };
  }

  return { niche, cached: false };
}

/**
 * Catalog stats
 */
async function catalogStats(userId = null) {
  let q = db.supabase.from('niches').select('verdict, niche_type');
  if (userId) q = q.or(`user_id.eq.${userId},user_id.is.null`);
  const { data } = await q;
  const niches = data || [];
  return {
    total: niches.length,
    goldmine: niches.filter(n => n.verdict === 'GOLDMINE').length,
    strong: niches.filter(n => n.verdict === 'STRONG').length,
    winnable: niches.filter(n => ['GOLDMINE', 'STRONG'].includes(n.verdict)).length,
  };
}

module.exports = { saveNiches, browseNiches, getCatalogTree, getNichePlan, catalogStats };
