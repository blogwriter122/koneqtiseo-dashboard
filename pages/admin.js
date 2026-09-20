/**
 * pages/admin.js — Full Admin Dashboard
 */

import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { supabase, api } from '../lib/api';

const ADMIN_EMAILS = ['awanksa@gmail.com'];

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [sites, setSites] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [published, setPublished] = useState([]);
  const [engineStatus, setEngineStatus] = useState('checking');
  const [userFilter, setUserFilter] = useState('all');

  useEffect(() => { checkAdmin(); }, []);

  async function checkAdmin() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      // Admin if email matches OR is_admin flag is true
      let admin = ADMIN_EMAILS.includes(user.email);
      if (!admin) {
        const { data: profile } = await supabase.from('user_profiles').select('is_admin').eq('id', user.id).single();
        admin = !!profile?.is_admin;
      }
      if (admin) { setIsAdmin(true); loadAll(); }
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  async function loadAll() {
    supabase.from('user_profiles').select('*').order('created_at', { ascending: false }).then(({ data }) => setUsers(data || []));
    supabase.from('sites').select('*').then(({ data }) => setSites(data || []));
    supabase.from('jobs').select('*').order('created_at', { ascending: false }).limit(200).then(({ data }) => setJobs(data || []));
    supabase.from('published').select('*').then(({ data }) => setPublished(data || []));
    api.health().then(() => setEngineStatus('online')).catch(() => setEngineStatus('offline'));
  }

  async function approveUser(id, plan) {
    await supabase.from('user_profiles').update({ status: 'active', plan, approved_at: new Date().toISOString() }).eq('id', id);
    loadAll();
  }
  async function suspendUser(id) {
    await supabase.from('user_profiles').update({ status: 'suspended' }).eq('id', id);
    loadAll();
  }
  async function setPlan(id, plan) {
    await supabase.from('user_profiles').update({ plan }).eq('id', id);
    loadAll();
  }

  const s = {
    page: { padding: '24px' },
    tabs: { display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' },
    tab: (a) => ({ padding: '8px 18px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: a ? 'var(--forge)' : 'var(--panel)', color: a ? 'white' : 'var(--text)', fontWeight: a ? '700' : '500', fontSize: '13px' }),
    panel: { background: 'var(--panel)', borderRadius: '12px', padding: '20px', marginBottom: '16px' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px', marginBottom: '16px' },
    statCard: { background: 'var(--bg)', borderRadius: '10px', padding: '18px', border: '1px solid var(--border)' },
    statVal: { fontSize: '28px', fontWeight: '800' },
    statLabel: { fontSize: '12px', color: 'var(--text-faint)', marginTop: '4px' },
    table: { width: '100%', borderCollapse: 'collapse', fontSize: '13px' },
    th: { background: 'var(--bg)', padding: '8px 12px', textAlign: 'left', fontWeight: '700', borderBottom: '2px solid var(--border)', fontSize: '11px', color: 'var(--text-faint)', textTransform: 'uppercase' },
    td: { padding: '10px 12px', borderBottom: '1px solid var(--border)', verticalAlign: 'middle' },
    badge: (st) => { const c = { pending: '#ff9100', active: '#00c853', suspended: '#f44336' }; return { background: c[st] || '#444', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '700' }; },
    planBadge: (p) => { const c = { starter: '#555', pro: '#6c47ff', agency: '#ff9100', pending: '#333' }; return { background: c[p] || '#333', color: 'white', padding: '2px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '700' }; },
    btn: (c = '#6c47ff') => ({ background: c, color: 'white', border: 'none', padding: '5px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '12px' }),
    select: { padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: '12px' },
    dot: (on) => ({ width: '10px', height: '10px', borderRadius: '50%', display: 'inline-block', marginRight: '8px', background: on ? '#00c853' : '#f44336' }),
  };

  if (loading) return <Layout><div style={{ padding: '40px', color: 'var(--text-faint)' }}>Loading...</div></Layout>;
  if (!isAdmin) return <Layout><div style={{ padding: '40px', color: '#f44336' }}>❌ Access denied — admin only</div></Layout>;

  const pending = users.filter(u => u.status === 'pending');
  const active = users.filter(u => u.status === 'active');
  const proUsers = users.filter(u => ['pro', 'agency'].includes(u.plan));
  const mrr = users.reduce((sum, u) => sum + ({ starter: 49, pro: 149, agency: 399 }[u.plan] || 0), 0);
  const runningJobs = jobs.filter(j => j.status === 'running').length;
  const completedJobs = jobs.filter(j => ['completed', 'done'].includes(j.status)).length;
  const failedJobs = jobs.filter(j => j.status === 'failed').length;
  const filteredUsers = userFilter === 'all' ? users : users.filter(u => u.status === userFilter);

  return (
    <Layout>
      <div style={s.page}>
        <div className="page-head">
          <div>
            <div className="page-title">⚙️ Admin Dashboard</div>
            <div className="page-sub"><span style={s.dot(engineStatus === 'online')} />Engine {engineStatus} · {users.length} users · ${mrr}/mo MRR</div>
          </div>
        </div>

        <div style={s.tabs}>
          {[['overview', '📊 Overview'], ['users', '👥 Users'], ['revenue', '💰 Revenue'], ['system', '🖥️ System'], ['activity', '📋 Activity']].map(([id, label]) => (
            <button key={id} style={s.tab(tab === id)} onClick={() => setTab(id)}>{label}</button>
          ))}
        </div>

        {tab === 'overview' && (
          <>
            <div style={s.grid}>
              {[
                { label: 'Total Users', value: users.length, color: 'var(--forge)' },
                { label: 'Pending Approval', value: pending.length, color: '#ff9100' },
                { label: 'Active Users', value: active.length, color: '#00c853' },
                { label: 'Pro+ Users', value: proUsers.length, color: '#6c47ff' },
                { label: 'MRR', value: `$${mrr}`, color: '#00c853' },
                { label: 'Total Sites', value: sites.length, color: 'var(--forge)' },
                { label: 'Articles Published', value: published.length, color: 'var(--forge)' },
                { label: 'Jobs Running', value: runningJobs, color: '#2979ff' },
              ].map(m => (
                <div key={m.label} style={s.statCard}>
                  <div style={{ ...s.statVal, color: m.color }}>{m.value}</div>
                  <div style={s.statLabel}>{m.label}</div>
                </div>
              ))}
            </div>
            {pending.length > 0 && (
              <div style={s.panel}>
                <div style={{ fontWeight: '700', marginBottom: '16px', color: '#ff9100' }}>⏳ {pending.length} Users Awaiting Approval</div>
                <table style={s.table}>
                  <thead><tr><th style={s.th}>Email</th><th style={s.th}>Joined</th><th style={s.th}>Actions</th></tr></thead>
                  <tbody>
                    {pending.map(u => (
                      <tr key={u.id}>
                        <td style={s.td}>{u.email}</td>
                        <td style={{ ...s.td, color: 'var(--text-faint)' }}>{new Date(u.created_at).toLocaleDateString()}</td>
                        <td style={s.td}>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button style={s.btn('#00c853')} onClick={() => approveUser(u.id, 'starter')}>✅ Starter</button>
                            <button style={s.btn('#6c47ff')} onClick={() => approveUser(u.id, 'pro')}>⚡ Pro</button>
                            <button style={s.btn('#ff9100')} onClick={() => approveUser(u.id, 'agency')}>🏢 Agency</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {tab === 'users' && (
          <>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              {['all', 'pending', 'active', 'suspended'].map(f => (
                <button key={f} style={s.tab(userFilter === f)} onClick={() => setUserFilter(f)}>{f} ({f === 'all' ? users.length : users.filter(u => u.status === f).length})</button>
              ))}
            </div>
            <div style={s.panel}>
              <table style={s.table}>
                <thead><tr><th style={s.th}>Email</th><th style={s.th}>Status</th><th style={s.th}>Plan</th><th style={s.th}>Sites</th><th style={s.th}>Limit</th><th style={s.th}>Joined</th><th style={s.th}>Actions</th></tr></thead>
                <tbody>
                  {filteredUsers.map(u => {
                    const userSites = sites.filter(site => site.user_id === u.id).length;
                    return (
                      <tr key={u.id}>
                        <td style={s.td}>{u.email}</td>
                        <td style={s.td}><span style={s.badge(u.status)}>{u.status}</span></td>
                        <td style={s.td}>
                          <select style={s.select} value={u.plan || 'pending'} onChange={e => setPlan(u.id, e.target.value)}>
                            <option value="pending">Pending</option><option value="starter">Starter</option><option value="pro">Pro</option><option value="agency">Agency</option>
                          </select>
                        </td>
                        <td style={s.td}>{userSites}</td>
                        <td style={s.td}>{u.sites_limit || 3}</td>
                        <td style={{ ...s.td, color: 'var(--text-faint)' }}>{new Date(u.created_at).toLocaleDateString()}</td>
                        <td style={s.td}>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            {u.status === 'pending' && <button style={s.btn('#00c853')} onClick={() => approveUser(u.id, 'starter')}>Approve</button>}
                            {u.status === 'active' && <button style={s.btn('#f44336')} onClick={() => suspendUser(u.id)}>Suspend</button>}
                            {u.status === 'suspended' && <button style={s.btn('#00c853')} onClick={() => approveUser(u.id, u.plan || 'starter')}>Restore</button>}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {tab === 'revenue' && (
          <>
            <div style={s.grid}>
              {[
                { label: 'MRR', value: `$${mrr}`, color: '#00c853' },
                { label: 'ARR (projected)', value: `$${mrr * 12}`, color: '#00c853' },
                { label: 'Starter ($49)', value: users.filter(u => u.plan === 'starter').length, color: '#555' },
                { label: 'Pro ($149)', value: users.filter(u => u.plan === 'pro').length, color: '#6c47ff' },
                { label: 'Agency ($399)', value: users.filter(u => u.plan === 'agency').length, color: '#ff9100' },
                { label: 'Avg Rev/User', value: `$${active.length ? Math.round(mrr / active.length) : 0}`, color: 'var(--forge)' },
              ].map(m => (
                <div key={m.label} style={s.statCard}>
                  <div style={{ ...s.statVal, color: m.color }}>{m.value}</div>
                  <div style={s.statLabel}>{m.label}</div>
                </div>
              ))}
            </div>
            <div style={s.panel}>
              <div style={{ fontWeight: '700', marginBottom: '12px' }}>Revenue Breakdown</div>
              {[['Starter', 'starter', 49], ['Pro', 'pro', 149], ['Agency', 'agency', 399]].map(([name, plan, price]) => {
                const count = users.filter(u => u.plan === plan).length;
                return (
                  <div key={plan} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                    <span><span style={s.planBadge(plan)}>{name}</span> × {count}</span>
                    <span style={{ fontWeight: '700', color: '#00c853' }}>${count * price}/mo</span>
                  </div>
                );
              })}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0 0', fontWeight: '800', fontSize: '16px' }}>
                <span>Total MRR</span><span style={{ color: '#00c853' }}>${mrr}/mo</span>
              </div>
            </div>
          </>
        )}

        {tab === 'system' && (
          <>
            <div style={s.grid}>
              {[
                { label: 'Engine Status', value: engineStatus === 'online' ? '🟢 Online' : '🔴 Offline', color: engineStatus === 'online' ? '#00c853' : '#f44336' },
                { label: 'Total Jobs', value: jobs.length, color: 'var(--forge)' },
                { label: 'Running', value: runningJobs, color: '#2979ff' },
                { label: 'Completed', value: completedJobs, color: '#00c853' },
                { label: 'Failed', value: failedJobs, color: '#f44336' },
                { label: 'Success Rate', value: `${jobs.length ? Math.round((completedJobs / jobs.length) * 100) : 0}%`, color: '#00c853' },
              ].map(m => (
                <div key={m.label} style={s.statCard}>
                  <div style={{ ...s.statVal, color: m.color, fontSize: '22px' }}>{m.value}</div>
                  <div style={s.statLabel}>{m.label}</div>
                </div>
              ))}
            </div>
            <div style={s.panel}>
              <div style={{ fontWeight: '700', marginBottom: '12px' }}>Infrastructure</div>
              {[
                ['Dashboard (Linux VPS)', 'koneqtiseo.com', true],
                ['Gateway (Windows VPS)', 'gateway.koneqtiseo.com', engineStatus === 'online'],
                ['Database', 'Supabase', true],
              ].map(([name, url, on]) => (
                <div key={name} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                  <span><span style={s.dot(on)} />{name}</span>
                  <span style={{ color: 'var(--text-faint)', fontSize: '12px' }}>{url}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === 'activity' && (
          <div style={s.panel}>
            <div style={{ fontWeight: '700', marginBottom: '16px' }}>Recent Jobs ({jobs.length})</div>
            {jobs.length === 0 ? <div className="empty">No activity yet</div> : (
              <table style={s.table}>
                <thead><tr><th style={s.th}>Type</th><th style={s.th}>Status</th><th style={s.th}>Site</th><th style={s.th}>Time</th></tr></thead>
                <tbody>
                  {jobs.slice(0, 50).map(j => (
                    <tr key={j.id}>
                      <td style={s.td}>{j.type || 'job'}</td>
                      <td style={s.td}><span style={s.badge(j.status === 'done' ? 'active' : j.status === 'failed' ? 'suspended' : 'pending')}>{j.status}</span></td>
                      <td style={{ ...s.td, color: 'var(--text-faint)' }}>{j.site_id?.slice(0, 8) || '—'}</td>
                      <td style={{ ...s.td, color: 'var(--text-faint)' }}>{new Date(j.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
