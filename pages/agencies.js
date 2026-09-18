/**
 * pages/agencies.js — Agency Management
 */
import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { supabase } from '../lib/api';

export default function AgenciesPage() {
  const [agencies, setAgencies] = useState([]);
  const [newAgency, setNewAgency] = useState({ name: '', email: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadAgencies(); }, []);

  async function loadAgencies() {
    const { data } = await supabase.from('agencies').select('*').order('created_at', { ascending: false });
    setAgencies(data || []);
  }

  async function addAgency() {
    if (!newAgency.name) { alert('Enter agency name'); return; }
    setLoading(true);
    const { error } = await supabase.from('agencies').insert({ name: newAgency.name, email: newAgency.email });
    if (error) alert(error.message);
    else { setNewAgency({ name: '', email: '' }); loadAgencies(); }
    setLoading(false);
  }

  const s = {
    page: { padding: '24px' },
    panel: { background: 'var(--panel)', borderRadius: '12px', padding: '20px', marginBottom: '16px' },
    input: { padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: '14px', flex: 1 },
    btn: (color = 'var(--forge)') => ({ background: color, color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '14px' }),
    row: { display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '12px' },
    table: { width: '100%', borderCollapse: 'collapse', fontSize: '13px' },
    th: { background: 'var(--bg)', padding: '8px 12px', textAlign: 'left', fontWeight: '700', borderBottom: '2px solid var(--border)', fontSize: '11px', color: 'var(--text-faint)', textTransform: 'uppercase' },
    td: { padding: '10px 12px', borderBottom: '1px solid var(--border)' },
  };

  return (
    <Layout>
      <div style={s.page}>
        <div className="page-head">
          <div>
            <div className="page-title">🏢 Agencies</div>
            <div className="page-sub">Manage client agencies — assign sites, generate reports</div>
          </div>
        </div>

        <div style={s.panel}>
          <div style={{ fontWeight: '700', marginBottom: '16px' }}>Add Agency</div>
          <div style={s.row}>
            <input style={s.input} placeholder="Agency name" value={newAgency.name} onChange={e => setNewAgency(p => ({ ...p, name: e.target.value }))} />
            <input style={s.input} placeholder="Contact email" value={newAgency.email} onChange={e => setNewAgency(p => ({ ...p, email: e.target.value }))} />
            <button style={s.btn()} onClick={addAgency} disabled={loading}>+ Add</button>
          </div>
        </div>

        <div style={s.panel}>
          <div style={{ fontWeight: '700', marginBottom: '16px' }}>Agencies ({agencies.length})</div>
          {agencies.length === 0 ? (
            <div className="empty">No agencies yet. Add your first agency above.</div>
          ) : (
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>Name</th>
                  <th style={s.th}>Email</th>
                  <th style={s.th}>Sites</th>
                  <th style={s.th}>GHL</th>
                  <th style={s.th}>Created</th>
                </tr>
              </thead>
              <tbody>
                {agencies.map(a => (
                  <tr key={a.id}>
                    <td style={{ ...s.td, fontWeight: '600' }}>{a.name}</td>
                    <td style={s.td}>{a.email || '—'}</td>
                    <td style={s.td}>—</td>
                    <td style={s.td}>{a.ghl_api_key ? '✅ Connected' : '❌ Not connected'}</td>
                    <td style={{ ...s.td, color: 'var(--text-faint)' }}>{new Date(a.created_at).toLocaleDateString()}</td>
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
