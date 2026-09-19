/**
 * pages/admin.js — Admin Panel
 * Approve users, set plans, suspend accounts
 */

import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { supabase } from '../lib/api';

const ADMIN_EMAILS = ['awanksa@gmail.com']; // Replace with your email

export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [filter, setFilter] = useState('pending');

  useEffect(() => { checkAdmin(); }, []);

  async function checkAdmin() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    // Check if admin (you can set this via email or a flag in DB)
    const { data: profile } = await supabase.from('user_profiles').select('is_admin').eq('id', user.id).single();
    if (profile?.is_admin || ADMIN_EMAILS.includes(user.email)) {
      setIsAdmin(true);
      loadUsers('pending');
    }
    setLoading(false);
  }

  async function loadUsers(status) {
    setFilter(status);
    let q = supabase.from('user_profiles').select('*').order('created_at', { ascending: false });
    if (status !== 'all') q = q.eq('status', status);
    const { data } = await q;
    setUsers(data || []);
  }

  async function approveUser(userId, plan = 'starter') {
    await supabase.from('user_profiles').update({
      status: 'active',
      plan,
      approved_at: new Date().toISOString(),
    }).eq('id', userId);
    loadUsers(filter);
  }

  async function suspendUser(userId) {
    await supabase.from('user_profiles').update({ status: 'suspended' }).eq('id', userId);
    loadUsers(filter);
  }

  async function setPlan(userId, plan) {
    await supabase.from('user_profiles').update({ plan }).eq('id', userId);
    loadUsers(filter);
  }

  const s = {
    page: { padding: '24px' },
    panel: { background: 'var(--panel)', borderRadius: '12px', padding: '20px', marginBottom: '16px' },
    table: { width: '100%', borderCollapse: 'collapse', fontSize: '13px' },
    th: { background: 'var(--bg)', padding: '8px 12px', textAlign: 'left', fontWeight: '700', borderBottom: '2px solid var(--border)', fontSize: '11px', color: 'var(--text-faint)', textTransform: 'uppercase' },
    td: { padding: '10px 12px', borderBottom: '1px solid var(--border)', verticalAlign: 'middle' },
    badge: (status) => {
      const colors = { pending: '#ff9100', active: '#00c853', suspended: '#f44336' };
      return { background: colors[status] || '#444', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '700' };
    },
    planBadge: (plan) => {
      const colors = { starter: '#444', pro: '#6c47ff', agency: '#ff9100', pending: '#333' };
      return { background: colors[plan] || '#333', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '700' };
    },
    btn: (color = '#6c47ff') => ({ background: color, color: 'white', border: 'none', padding: '5px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '12px' }),
    tabs: { display: 'flex', gap: '8px', marginBottom: '16px' },
    tab: (a) => ({ padding: '7px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: a ? 'var(--forge)' : 'var(--panel)', color: a ? 'white' : 'var(--text)', fontWeight: a ? '700' : '400', fontSize: '13px' }),
    select: { padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: '12px' },
    grid4: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '16px' },
    statCard: { background: 'var(--bg)', borderRadius: '8px', padding: '14px', textAlign: 'center', border: '1px solid var(--border)' },
  };

  if (loading) return <Layout><div style={{ padding: '40px', color: 'var(--text-faint)' }}>Loading...</div></Layout>;
  if (!isAdmin) return <Layout><div style={{ padding: '40px', color: '#f44336' }}>❌ Access denied</div></Layout>;

  const pending = users.filter(u => u.status === 'pending').length;
  const active = users.filter(u => u.status === 'active').length;

  return (
    <Layout>
      <div style={s.page}>
        <div className="page-head">
          <div>
            <div className="page-title">⚙️ Admin Panel</div>
            <div className="page-sub">Approve users, manage plans and access</div>
          </div>
        </div>

        <div style={s.grid4}>
          {[
            { label: 'Pending Approval', value: pending, color: '#ff9100' },
            { label: 'Active Users', value: active, color: '#00c853' },
            { label: 'Total Users', value: users.length || '—' },
            { label: 'Pro+ Users', value: users.filter(u => ['pro','agency'].includes(u.plan)).length },
          ].map(m => (
            <div key={m.label} style={s.statCard}>
              <div style={{ fontSize: '28px', fontWeight: '800', color: m.color || 'var(--forge)' }}>{m.value}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-faint)', marginTop: '4px' }}>{m.label}</div>
            </div>
          ))}
        </div>

        <div style={s.tabs}>
          {[['pending','⏳ Pending'],['active','✅ Active'],['suspended','🚫 Suspended'],['all','All']].map(([val, label]) => (
            <button key={val} style={s.tab(filter === val)} onClick={() => loadUsers(val)}>{label}</button>
          ))}
        </div>

        <div style={s.panel}>
          {users.length === 0 ? (
            <div className="empty">No {filter} users</div>
          ) : (
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>Email</th>
                  <th style={s.th}>Status</th>
                  <th style={s.th}>Plan</th>
                  <th style={s.th}>Joined</th>
                  <th style={s.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td style={s.td}>{u.email || '—'}</td>
                    <td style={s.td}><span style={s.badge(u.status)}>{u.status}</span></td>
                    <td style={s.td}>
                      <select style={s.select} value={u.plan || 'pending'} onChange={e => setPlan(u.id, e.target.value)}>
                        <option value="pending">Pending</option>
                        <option value="starter">Starter</option>
                        <option value="pro">Pro</option>
                        <option value="agency">Agency</option>
                      </select>
                    </td>
                    <td style={{ ...s.td, color: 'var(--text-faint)' }}>{new Date(u.created_at).toLocaleDateString()}</td>
                    <td style={s.td}>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {u.status === 'pending' && (
                          <>
                            <button style={s.btn('#00c853')} onClick={() => approveUser(u.id, 'starter')}>✅ Approve Starter</button>
                            <button style={s.btn('#6c47ff')} onClick={() => approveUser(u.id, 'pro')}>⚡ Approve Pro</button>
                          </>
                        )}
                        {u.status === 'active' && (
                          <button style={s.btn('#f44336')} onClick={() => suspendUser(u.id)}>🚫 Suspend</button>
                        )}
                        {u.status === 'suspended' && (
                          <button style={s.btn('#00c853')} onClick={() => approveUser(u.id, u.plan || 'starter')}>✅ Restore</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </Layout>
  );
}
