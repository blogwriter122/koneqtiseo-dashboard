/**
 * pages/taxonomy.js — Amazon Taxonomy Browser (Affiliate + Ecommerce banks)
 *
 * Pick market → category → build keyword bank (affiliate OR ecommerce)
 * → validate → saves to niche catalog.
 */

import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { api } from '../lib/api';

export default function TaxonomyPage() {
  const [markets, setMarkets] = useState([]);
  const [selMarket, setSelMarket] = useState(null);
  const [bank, setBank] = useState('affiliate');   // affiliate | ecommerce
  const [country, setCountry] = useState('US');
  const [loading, setLoading] = useState(false);
  const [building, setBuilding] = useState('');
  const [result, setResult] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.getTaxonomy().then(r => setMarkets(r.markets || [])).catch(() => {});
  }, []);

  async function buildBank(category) {
    setBuilding(category);
    setResult(null);
    try {
      const r = bank === 'affiliate'
        ? await api.affiliateKeywords({ category, country, vertical: selMarket?.market })
        : await api.ecommerceKeywords({ category, country, vertical: selMarket?.market });
      setResult({ category, ...r });
    } catch (e) { alert(e.message); } finally { setBuilding(''); }
  }

  const s = {
    page: { padding: '24px' },
    panel: { background: 'var(--panel)', borderRadius: '12px', padding: '20px', marginBottom: '16px' },
    bankToggle: { display: 'flex', gap: '8px', marginBottom: '16px' },
    bankBtn: (a) => ({ padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: a ? 'var(--forge)' : 'var(--bg)', color: a ? 'white' : 'var(--text)', fontWeight: '700', fontSize: '14px', border: `1px solid ${a ? 'var(--forge)' : 'var(--border)'}` }),
    layout: { display: 'grid', gridTemplateColumns: '260px 1fr', gap: '16px' },
    marketList: { background: 'var(--panel)', borderRadius: '12px', padding: '12px', maxHeight: '70vh', overflowY: 'auto' },
    marketItem: (a) => ({ padding: '10px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', background: a ? 'var(--forge)' : 'transparent', color: a ? 'white' : 'var(--text)', display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }),
    catGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px,1fr))', gap: '8px' },
    catCard: { background: 'var(--bg)', borderRadius: '8px', padding: '12px', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' },
    buildBtn: { background: 'var(--forge)', color: 'white', border: 'none', padding: '4px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '11px' },
    select: { padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: '13px' },
    input: { padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: '13px', width: '100%', marginBottom: '10px' },
    resultBox: { background: 'rgba(0,200,83,0.06)', border: '1px solid rgba(0,200,83,0.2)', borderRadius: '8px', padding: '14px', marginTop: '12px' },
    chip: { display: 'inline-block', background: 'var(--panel)', padding: '3px 10px', borderRadius: '12px', fontSize: '11px', margin: '2px', border: '1px solid var(--border)' },
  };

  const filteredCats = selMarket
    ? selMarket.categories.filter(c => !search || c.toLowerCase().includes(search.toLowerCase()))
    : [];

  return (
    <Layout>
      <div style={s.page}>
        <div className="page-head">
          <div>
            <div className="page-title">🛒 Amazon Taxonomy</div>
            <div className="page-sub">Pick market → category → build keyword bank → validate → catalog</div>
          </div>
        </div>

        {/* Bank + country */}
        <div style={{ ...s.panel, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={s.bankToggle}>
            <button style={s.bankBtn(bank === 'affiliate')} onClick={() => setBank('affiliate')}>
              🔗 Affiliate (best/review/vs)
            </button>
            <button style={s.bankBtn(bank === 'ecommerce')} onClick={() => setBank('ecommerce')}>
              🛒 Ecommerce (buy/price/deals)
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-faint)' }}>Country:</span>
            <select style={s.select} value={country} onChange={e => setCountry(e.target.value)}>
              {['US', 'UK', 'DE', 'FR', 'ES', 'IT', 'CA', 'IN', 'AU', 'JP'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div style={{ fontSize: '12px', color: 'var(--text-faint)', marginBottom: '12px' }}>
          {bank === 'affiliate'
            ? '🔗 Affiliate: category seeds → "best X", "X review", "X vs Y" (research intent)'
            : '🛒 Ecommerce: category → "buy X", "X price" + Amazon buyer suggestions (purchase intent)'}
        </div>

        <div style={s.layout}>
          {/* Markets */}
          <div style={s.marketList}>
            <div style={{ fontWeight: '700', fontSize: '12px', color: 'var(--text-faint)', marginBottom: '8px', textTransform: 'uppercase' }}>Markets ({markets.length})</div>
            {markets.map(m => (
              <div key={m.market} style={s.marketItem(selMarket?.market === m.market)} onClick={() => { setSelMarket(m); setSearch(''); }}>
                <span>{m.market}</span>
                <span style={{ color: 'var(--text-faint)', fontSize: '11px' }}>{m.categoryCount}</span>
              </div>
            ))}
            {markets.length === 0 && <div style={{ fontSize: '12px', color: 'var(--text-faint)', padding: '10px' }}>Loading markets...</div>}
          </div>

          {/* Categories */}
          <div style={s.panel}>
            {!selMarket ? (
              <div className="empty">Pick a market to see categories</div>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ fontWeight: '700' }}>{selMarket.market} — {filteredCats.length} categories ({selMarket.commission}% commission)</div>
                </div>
                <input style={s.input} placeholder="Search categories..." value={search} onChange={e => setSearch(e.target.value)} />
                <div style={s.catGrid}>
                  {filteredCats.map(cat => (
                    <div key={cat} style={s.catCard}>
                      <span>{cat}</span>
                      <button style={s.buildBtn} onClick={() => buildBank(cat)} disabled={building === cat}>
                        {building === cat ? '⏳' : 'Build'}
                      </button>
                    </div>
                  ))}
                </div>

                {result && (
                  <div style={s.resultBox}>
                    <div style={{ fontWeight: '700', marginBottom: '6px' }}>
                      ✅ {result.category} → {result.saved} niches saved to catalog ({result.bank} bank)
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-faint)', marginBottom: '8px' }}>
                      {result.keywords?.length} keywords built, {result.opportunities?.length} validated
                    </div>
                    <div>
                      {(result.keywords || []).slice(0, 12).map((k, i) => (
                        <span key={i} style={s.chip}>{typeof k === 'string' ? k : k.keyword}</span>
                      ))}
                    </div>
                    <a href="/niches" style={{ display: 'inline-block', marginTop: '10px', fontSize: '13px', color: 'var(--forge)' }}>
                      → View in Niche Catalog
                    </a>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
