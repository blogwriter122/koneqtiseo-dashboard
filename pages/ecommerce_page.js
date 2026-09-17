/**
 * pages/forge/ecommerce.js — Ecommerce Store Performance Dashboard
 *
 * Shows per-site ecommerce metrics:
 *   - Orders (today, week, month)
 *   - Revenue by product/category
 *   - Top sellers + worst performers
 *   - Affiliate vs direct store revenue (Type C)
 *   - Traffic → conversion per product page
 *
 * MASTER_PLAN §36
 */

import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { fetchers } from '../../lib/api';

export default function EcommercePage() {
  const [sites, setSites] = useState([]);
  const [selectedSite, setSelectedSite] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchers.sites().then(sites => {
      const ecomSites = sites.filter(s => s.mode === 'ecommerce' || s.niche_type === 'ecommerce');
      setSites(ecomSites.length ? ecomSites : sites);
    });
  }, []);

  const s = {
    page: { padding: '24px' },
    tabs: { display: 'flex', gap: '8px', marginBottom: '20px' },
    tab: (a) => ({ padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: a ? 'var(--forge)' : 'var(--panel)', color: a ? 'white' : 'var(--text)', fontWeight: a ? '700' : '400' }),
    panel: { background: 'var(--panel)', borderRadius: '12px', padding: '20px', marginBottom: '16px' },
    select: { padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: '14px', marginBottom: '16px' },
    metricCard: { background: 'var(--bg)', borderRadius: '10px', padding: '16px', textAlign: 'center', border: '1px solid var(--border)' },
    metricValue: { fontSize: '28px', fontWeight: '800', color: 'var(--forge)', marginBottom: '4px' },
    metricLabel: { fontSize: '12px', color: 'var(--text-faint)' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px', marginBottom: '16px' },
  };

  const metrics = [
    { label: 'Orders Today', value: '—', icon: '📦' },
    { label: 'Revenue This Month', value: '—', icon: '💰' },
    { label: 'Conversion Rate', value: '—', icon: '📈' },
    { label: 'Affiliate Earnings', value: '—', icon: '🔗' },
    { label: 'Avg Order Value', value: '—', icon: '🛒' },
    { label: 'Products Live', value: '—', icon: '✅' },
  ];

  return (
    <Layout>
      <div style={s.page}>
        <div className="page-head">
          <div>
            <div className="page-title">🏪 Ecommerce</div>
            <div className="page-sub">Store performance — orders, revenue, products</div>
          </div>
        </div>

        <select style={s.select} value={selectedSite} onChange={e => setSelectedSite(e.target.value)}>
          <option value="">-- select site --</option>
          {sites.map(s => <option key={s.id} value={s.id}>{s.url || s.name}</option>)}
        </select>

        <div style={s.tabs}>
          {[['overview','📊 Overview'],['products','📦 Products'],['orders','🛒 Orders'],['affiliate','🔗 Affiliate']].map(([tab, label]) => (
            <button key={tab} style={s.tab(activeTab === tab)} onClick={() => setActiveTab(tab)}>{label}</button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <>
            <div style={s.grid}>
              {metrics.map((m, i) => (
                <div key={i} style={s.metricCard}>
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>{m.icon}</div>
                  <div style={s.metricValue}>{m.value}</div>
                  <div style={s.metricLabel}>{m.label}</div>
                </div>
              ))}
            </div>

            <div style={s.panel}>
              {!selectedSite ? (
                <div className="empty">Select a site to view ecommerce metrics</div>
              ) : (
                <div className="empty">
                  Connect WooCommerce API keys in site settings to see live metrics.<br/>
                  <span style={{ fontSize: '12px', color: 'var(--text-faint)' }}>
                    WooCommerce → Settings → Advanced → REST API
                  </span>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'products' && (
          <div style={s.panel}>
            <div className="empty">
              Products will appear here after connecting your WooCommerce store.
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div style={s.panel}>
            <div className="empty">
              Orders will appear here after connecting your WooCommerce store.
            </div>
          </div>
        )}

        {activeTab === 'affiliate' && (
          <div style={s.panel}>
            <div className="empty">
              Affiliate revenue tracking coming soon.<br/>
              Tracks Amazon Associates earnings per page.
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
