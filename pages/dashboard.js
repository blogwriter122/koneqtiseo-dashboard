/**
 * pages/dashboard.js — Overview (loads instantly, gateway optional)
 */

import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { api, fetchers } from '../lib/api';

export default function Dashboard() {
  const [sites, setSites] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [published, setPublished] = useState([]);
  const [engineStatus, setEngineStatus] = useState('checking');

  useEffect(() => {
    // Load data in background — never block render
    fetchers.sites().then(setSites).catch(() => {});
    fetchers.jobs().then(setJobs).catch(() => {});
    fetchers.published().then(setPublished).catch(() => {});
    api.health()
      .then(() => setEngineStatus('online'))
      .catch(() => setEngineStatus('offline'));
  }, []);

  const runningJobs = jobs.filter(j => j.status === 'running').length;
  const pendingJobs = jobs.filter(j => j.status === 'pending').length;
  const recentJobs = jobs.slice(0, 8);
  const recentPublished = published.slice(0, 8);

  const s = {
    page: { padding: '24px' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px', marginBottom: '24px' },
    card: { background: 'var(--panel)', borderRadius: '12px', padding: '20px', border: '1px solid var(--border)' },
    metricValue: { fontSize: '32px', fontWeight: '800', color: 'var(--forge)', marginBottom: '4px' },
    metricLabel: { fontSize: '12px', color: 'var(--text-faint)' },
    table: { width: '100%', borderCollapse: 'collapse', fontSize: '13px' },
    th: { background: 'var(--bg)', padding: '8px 12px', textAlign: 'left', fontWeight: '700', borderBottom: '2px solid var(--border)', fontSize: '12px', color: 'var(--text-faint)' },
    td: { padding: '8px 12px', borderBottom: '1px solid var(--border)' },
    badge: (status) => {
      const colors = { running: '#2979ff', complete: '#00c853', failed: '#f44336', pending: '#ff9100' };
      return { background: colors[status] || '#666', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '700' };
    },
    engineDot: { width: '10px', height: '10px', borderRadius: '50%', display: 'inline-block', marginRight: '6px', background: engineStatus === 'online' ? '#00c853' : engineStatus === 'offline' ? '#f44336' : '#ff9100' },
    row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  };

  return (
    <Layout>
      <div style={s.page}>
        <div className="page-head">
          <div>
            <div className="page-title">◆ Overview</div>
            <div className="page-sub">
              <span style={s.engineDot} />
              Engine {engineStatus === 'online' ? 'Online' : engineStatus === 'offline' ? 'Offline' : 'Checking...'}
            </div>
          </div>
        </div>

        <div style={s.grid}>
          {[
            { label: 'Total Sites', value: sites.length },
            { label: 'Published Articles', value: published.length },
            { label: 'Running Jobs', value: runningJobs },
            { label: 'Pending Jobs', value: pendingJobs },
            { label: 'Total Jobs', value: jobs.length },
          ].map(m => (
            <div key={m.label} style={s.card}>
              <div style={s.metricValue}>{m.value}</div>
              <div style={s.metricLabel}>{m.label}</div>
            </div>
          ))}
        </div>

        {engineStatus === 'offline' && (
          <div style={{ ...s.card, background: 'rgba(244,67,54,0.08)', border: '1px solid rgba(244,67,54,0.2)', marginBottom: '16px' }}>
            <div style={{ fontWeight: '700', color: '#ef5350', marginBottom: '4px' }}>⚠️ Engine Offline</div>
            <div style={{ fontSize: '13px', color: 'var(--text-faint)' }}>
              The processing engine is not running. Start it on your Windows VPS with: <code>pm2 start koneqtiseo-gateway</code>
            </div>
          </div>
        )}

        <div style={s.row}>
          <div style={s.card}>
            <div style={{ fontWeight: '700', marginBottom: '12px' }}>Recent Jobs</div>
            {recentJobs.length === 0 ? (
              <div className="empty">No jobs yet</div>
            ) : (
              <table style={s.table}>
                <thead>
                  <tr><th style={s.th}>Type</th><th style={s.th}>Status</th><th style={s.th}>Time</th></tr>
                </thead>
                <tbody>
                  {recentJobs.map(job => (
                    <tr key={job.id}>
                      <td style={s.td}>{job.type || 'write'}</td>
                      <td style={s.td}><span style={s.badge(job.status)}>{job.status}</span></td>
                      <td style={{ ...s.td, color: 'var(--text-faint)' }}>{new Date(job.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div style={s.card}>
            <div style={{ fontWeight: '700', marginBottom: '12px' }}>Recently Published</div>
            {recentPublished.length === 0 ? (
              <div className="empty">Nothing published yet</div>
            ) : (
              <table style={s.table}>
                <thead>
                  <tr><th style={s.th}>Keyword</th><th style={s.th}>Platform</th><th style={s.th}>Date</th></tr>
                </thead>
                <tbody>
                  {recentPublished.map(p => (
                    <tr key={p.id}>
                      <td style={s.td}>{p.keyword?.slice(0, 25) || '—'}</td>
                      <td style={s.td}>{p.platform || 'own_site'}</td>
                      <td style={{ ...s.td, color: 'var(--text-faint)' }}>{new Date(p.published_at || p.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
