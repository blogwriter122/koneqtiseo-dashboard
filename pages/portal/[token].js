/**
 * pages/portal/[token].js — White-label Client Portal
 * Clients access via portal link — see only THEIR site's progress
 * No login needed — the token IS the access
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';
import Head from 'next/head';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default function ClientPortal() {
  const router = useRouter();
  const { token } = router.query;
  const [client, setClient] = useState(null);
  const [agency, setAgency] = useState(null);
  const [site, setSite] = useState(null);
  const [published, setPublished] = useState([]);
  const [backlinks, setBacklinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (token) load();
  }, [token]);

  async function load() {
    setLoading(true);
    try {
      // Find client by portal token
      const { data: c } = await supabase.from('agency_clients').select('*').eq('portal_token', token).single();
      if (!c) { setError('Invalid portal link'); setLoading(false); return; }
      setClient(c);

      const [ag, st, pub, bl] = await Promise.all([
        supabase.from('agencies').select('*').eq('id', c.agency_id).single(),
        supabase.from('sites').select('*').eq('id', c.site_id).single(),
        supabase.from('published').select('*').eq('site_id', c.site_id).order('published_at', { ascending: false }).limit(50),
        supabase.from('offpage_backlinks').select('*').eq('site_id', c.site_id).eq('status', 'live'),
      ]);
      setAgency(ag.data);
      setSite(st.data);
      setPublished(pub.data || []);
      setBacklinks(bl.data || []);
    } catch (e) { setError(e.message); } finally { setLoading(false); }
  }

  const brand = agency?.brand_color || '#6c47ff';

  if (loading) return <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: '#09090f', color: '#666', fontFamily: 'system-ui' }}>Loading...</div>;
  if (error) return <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: '#09090f', color: '#f44336', fontFamily: 'system-ui' }}>{error}</div>;

  return (
    <>
      <Head><title>{agency?.name || 'SEO'} — Client Report</title></Head>
      <style>{`
        * { margin:0; padding:0; box-sizing:border-box; }
        body { background:#09090f; color:#e2e2e2; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; }
        .header { padding:24px 40px; border-bottom:1px solid #1e1e2e; display:flex; justify-content:space-between; align-items:center; }
        .agency-name { font-size:22px; font-weight:900; }
        .wrap { max-width:1000px; margin:0 auto; padding:32px 24px; }
        h1 { font-size:28px; font-weight:900; margin-bottom:6px; }
        .sub { color:#666; font-size:14px; margin-bottom:32px; }
        .stats { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-bottom:32px; }
        .stat { background:#111120; border:1px solid #1e1e3a; border-radius:12px; padding:20px; text-align:center; }
        .stat-val { font-size:32px; font-weight:900; }
        .stat-label { font-size:12px; color:#666; margin-top:4px; }
        .panel { background:#111120; border:1px solid #1e1e3a; border-radius:12px; padding:24px; margin-bottom:20px; }
        .panel-title { font-weight:700; margin-bottom:16px; }
        table { width:100%; border-collapse:collapse; font-size:13px; }
        th { text-align:left; padding:8px 12px; font-size:11px; color:#666; text-transform:uppercase; border-bottom:2px solid #1e1e3a; }
        td { padding:9px 12px; border-bottom:1px solid #1a1a2a; }
        a { color:${brand}; }
        .empty { text-align:center; color:#555; padding:32px; }
        footer { text-align:center; padding:24px; color:#444; font-size:12px; border-top:1px solid #1a1a2a; }
        @media(max-width:768px){ .stats{grid-template-columns:repeat(2,1fr);} .header{padding:16px 24px;} }
      `}</style>

      <div className="header">
        <div className="agency-name" style={{ color: brand }}>{agency?.name || 'SEO Report'}</div>
        <div style={{ fontSize: '13px', color: '#666' }}>{client?.client_name}</div>
      </div>

      <div className="wrap">
        <h1>{site?.url || 'Your Site'}</h1>
        <div className="sub">SEO Progress Report · Updated {new Date().toLocaleDateString()}</div>

        <div className="stats">
          <div className="stat"><div className="stat-val" style={{ color: brand }}>{published.length}</div><div className="stat-label">Articles Published</div></div>
          <div className="stat"><div className="stat-val" style={{ color: '#00c853' }}>{backlinks.length}</div><div className="stat-label">Backlinks Built</div></div>
          <div className="stat"><div className="stat-val" style={{ color: brand }}>{site?.health_score || '—'}</div><div className="stat-label">Health Score</div></div>
          <div className="stat"><div className="stat-val" style={{ color: '#ff9100' }}>{new Set(backlinks.map(b => b.domain)).size}</div><div className="stat-label">Referring Domains</div></div>
        </div>

        <div className="panel">
          <div className="panel-title">📝 Recently Published Content</div>
          {published.length === 0 ? <div className="empty">Content will appear here as it's published</div> : (
            <table>
              <thead><tr><th>Title</th><th>Published</th></tr></thead>
              <tbody>
                {published.slice(0, 15).map(p => (
                  <tr key={p.id}>
                    <td>{p.url ? <a href={p.url} target="_blank" rel="noreferrer">{p.keyword || p.url}</a> : (p.keyword || '—')}</td>
                    <td style={{ color: '#666' }}>{new Date(p.published_at || p.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="panel">
          <div className="panel-title">🔗 Backlinks Built</div>
          {backlinks.length === 0 ? <div className="empty">Backlinks will appear here as they're built</div> : (
            <table>
              <thead><tr><th>Source Domain</th><th>Date</th></tr></thead>
              <tbody>
                {backlinks.slice(0, 15).map(b => (
                  <tr key={b.id}>
                    <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>{b.domain}</td>
                    <td style={{ color: '#666' }}>{new Date(b.posted_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <footer>Powered by {agency?.name || 'KoneqtiSEO'} · This report is confidential</footer>
    </>
  );
}
