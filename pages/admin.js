/**
 * pages/admin.js — Admin Panel (internal use only)
 * Shows all users, plans, usage stats
 */

import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { supabase } from '../lib/api';

export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdmin();
  }, []);

  async function checkAdmin() {
    const { data: { user } } = await supabase.auth.getUser();
    const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '').split(',');
    if (!user || !adminEmails.includes(user.email)) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }
    setIsAdmin(true);
    loadUsers();
  }

  async function loadUsers() {
    const { data } = await supabase.from('user_profiles').select('*').order('created_at', { ascending: false }).limit(100);
    setUsers(data || []);
    setLoading(false);
  }

  const s = {
    page: { padding: '24px' },
    panel: { background: 'var(--panel)', borderRadius: '12px', padding: '20px', marginBottom: '16px' },
    table: { width: '100%', borderCollapse: 'collapse', fontSize: '13px' },
    th: { background: 'var(--bg)', padding: '8px 12px', textAlign: 'left', fontWeight: '700', borderBottom: '2px solid var(--border)', fontSize: '11px', color: 'var(--text-faint)', textTransform: 'uppercase' },
    td: { padding: '8px 12px', borderBottom: '1px solid var(--border)' },
    badge: (plan) => ({ background: plan === 'agency' ? '#ff9100' : plan === 'pro' ? '#6c47ff' : '#444', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '700' }),
    grid: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '16px' },
    statCard: { background: 'var(--bg)', borderRadius: '8px', padding: '14px', textAlign: 'center', border: '1px solid var(--border)' },
  };

  if (loading) return <Layout><div style={{ padding: '40px', color: 'var(--text-faint)' }}>Loading...</div></Layout>;
  if (!isAdmin) return <Layout><div style={{ padding: '40px', color: '#f44336' }}>❌ Access denied — admin only</div></Layout>;

  const planCounts = users.reduce((acc, u) => { acc[u.plan || 'starter'] = (acc[u.plan || 'starter'] || 0) + 1; return acc; }, {});

  return (
    <Layout>
      <div style={s.page}>
        <div className="page-head">
          <div>
            <div className="page-title">⚙️ Admin Panel</div>
            <div className="page-sub">Internal — all users and plans</div>
          </div>
        </div>

        <div style={s.grid}>
          {[
            { label: 'Total Users', value: users.length },
            { label: 'Starter', value: planCounts.starter || 0 },
            { label: 'Pro', value: planCounts.pro || 0 },
            { label: 'Agency', value: planCounts.agency || 0 },
          ].map(m => (
            <div key={m.label} style={s.statCard}>
              <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--forge)' }}>{m.value}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-faint)', marginTop: '4px' }}>{m.label}</div>
            </div>
          ))}
        </div>

        <div style={s.panel}>
          <div style={{ fontWeight: '700', marginBottom: '16px' }}>All Users ({users.length})</div>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>Email</th>
                <th style={s.th}>Plan</th>
                <th style={s.th}>Sites Limit</th>
                <th style={s.th}>Articles Limit</th>
                <th style={s.th}>Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td style={s.td}>{u.email || '—'}</td>
                  <td style={s.td}><span style={s.badge(u.plan)}>{u.plan || 'starter'}</span></td>
                  <td style={s.td}>{u.sites_limit || 3}</td>
                  <td style={s.td}>{u.articles_limit || 50}</td>
                  <td style={{ ...s.td, color: 'var(--text-faint)' }}>{new Date(u.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
