/**
 * pages/agencies.js — Agency Management
 * Create agencies, add clients, assign sites, generate portal links
 */

import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { supabase } from '../lib/api';

export default function AgenciesPage() {
  const [agencies, setAgencies] = useState([]);
  const [clients, setClients] = useState([]);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('agencies');
  const [showAddAgency, setShowAddAgency] = useState(false);
  const [showAddClient, setShowAddClient] = useState(false);
  const [newAgency, setNewAgency] = useState({ name: '', email: '', brand_color: '#6c47ff' });
  const [newClient, setNewClient] = useState({ agency_id: '', client_name: '', client_email: '', site_id: '', can_edit: false });

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const [a, c, s] = await Promise.all([
        supabase.from('agencies').select('*').order('created_at', { ascending: false }),
        supabase.from('agency_clients').select('*').order('created_at', { ascending: false }),
        supabase.from('sites').select('*'),
      ]);
      setAgencies(a.data || []);
      setClients(c.data || []);
      setSites(s.data || []);
    } catch (_) {} finally { setLoading(false); }
  }

  async function addAgency() {
    if (!newAgency.name) { alert('Agency name required'); return; }
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('agencies').insert({ ...newAgency, owner_id: user.id });
    if (error) alert(error.message);
    else { setNewAgency({ name: '', email: '', brand_color: '#6c47ff' }); setShowAddAgency(false); load(); }
  }

  async function addClient() {
    if (!newClient.agency_id || !newClient.site_id) { alert('Agency and site required'); return; }
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('agency_clients').insert({ ...newClient, owner_id: user.id });
    if (error) alert(error.message);
    else { setNewClient({ agency_id: '', client_name: '', client_email: '', site_id: '', can_edit: false }); setShowAddClient(false); load(); }
  }

  async function deleteAgency(id) {
    if (!confirm('Delete agency and all its clients?')) return;
    await supabase.from('agencies').delete().eq('id', id);
    load();
  }

  async function deleteClient(id) {
    if (!confirm('Remove this client?')) return;
    await supabase.from('agency_clients').delete().eq('id', id);
    load();
  }

  function portalLink(token) {
    return `${window.location.origin}/portal/${token}`;
  }

  const s = {
    page: { padding: '24px' },
    panel: { background: 'var(--panel)', borderRadius: '12px', padding: '20px', marginBottom: '16px' },
    tabs: { display: 'flex', gap: '8px', marginBottom: '20px' },
    tab: (a) => ({ padding: '8px 18px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: a ? 'var(--forge)' : 'var(--panel)', color: a ? 'white' : 'var(--text)', fontWeight: a ? '700' : '500', fontSize: '13px' }),
    btn: (c = 'var(--forge)') => ({ background: c, color: 'white', border: 'none', padding: '9px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '13px' }),
    smBtn: (c = '#f44336') => ({ background: c, color: 'white', border: 'none', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '11px' }),
    table: { width: '100%', borderCollapse: 'collapse', fontSize: '13px' },
    th: { background: 'var(--bg)', padding: '8px 12px', textAlign: 'left', fontWeight: '700', borderBottom: '2px solid var(--border)', fontSize: '11px', color: 'var(--text-faint)', textTransform: 'uppercase' },
    td: { padding: '10px 12px', borderBottom: '1px solid var(--border)', verticalAlign: 'middle' },
    input: { width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: '13px' },
    label: { fontSize: '12px', color: 'var(--text-faint)', fontWeight: '600', marginBottom: '4px', display: 'block' },
    field: { marginBottom: '12px' },
    modal: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '24px' },
    modalCard: { background: 'var(--panel)', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '440px' },
    copyBtn: { background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--forge)', padding: '3px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontFamily: 'monospace' },
  };

  return (
    <Layout>
      <div style={s.page}>
        <div className="page-head">
          <div>
            <div className="page-title">🏢 Agencies</div>
            <div className="page-sub">Manage client agencies · assign sites · white-label portals</div>
          </div>
        </div>

        <div style={s.tabs}>
          <button style={s.tab(tab === 'agencies')} onClick={() => setTab('agencies')}>Agencies ({agencies.length})</button>
          <button style={s.tab(tab === 'clients')} onClick={() => setTab('clients')}>Clients ({clients.length})</button>
        </div>

        {/* AGENCIES */}
        {tab === 'agencies' && (
          <>
            <div style={{ ...s.panel, display: 'flex', justifyContent: 'flex-end', padding: '14px 20px' }}>
              <button style={s.btn()} onClick={() => setShowAddAgency(true)}>+ Add Agency</button>
            </div>
            <div style={s.panel}>
              {loading ? <div className="empty">Loading...</div> : agencies.length === 0 ? (
                <div className="empty">No agencies yet. Add your first agency to manage clients.</div>
              ) : (
                <table style={s.table}>
                  <thead><tr><th style={s.th}>Name</th><th style={s.th}>Email</th><th style={s.th}>Brand</th><th style={s.th}>Clients</th><th style={s.th}>GHL</th><th style={s.th}></th></tr></thead>
                  <tbody>
                    {agencies.map(a => (
                      <tr key={a.id}>
                        <td style={{ ...s.td, fontWeight: '600' }}>{a.name}</td>
                        <td style={s.td}>{a.email || '—'}</td>
                        <td style={s.td}><span style={{ display: 'inline-block', width: '16px', height: '16px', borderRadius: '4px', background: a.brand_color, verticalAlign: 'middle' }} /></td>
                        <td style={s.td}>{clients.filter(c => c.agency_id === a.id).length}</td>
                        <td style={s.td}>{a.ghl_api_key ? '✅' : '—'}</td>
                        <td style={s.td}><button style={s.smBtn()} onClick={() => deleteAgency(a.id)}>Del</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        {/* CLIENTS */}
        {tab === 'clients' && (
          <>
            <div style={{ ...s.panel, display: 'flex', justifyContent: 'flex-end', padding: '14px 20px' }}>
              <button style={s.btn()} onClick={() => setShowAddClient(true)} disabled={agencies.length === 0}>+ Add Client</button>
            </div>
            {agencies.length === 0 && (
              <div style={{ ...s.panel, background: 'rgba(255,145,0,0.08)', border: '1px solid rgba(255,145,0,0.2)' }}>
                <div style={{ fontSize: '13px', color: '#ff9100' }}>⚠️ Create an agency first before adding clients.</div>
              </div>
            )}
            <div style={s.panel}>
              {clients.length === 0 ? (
                <div className="empty">No clients yet.</div>
              ) : (
                <table style={s.table}>
                  <thead><tr><th style={s.th}>Client</th><th style={s.th}>Agency</th><th style={s.th}>Site</th><th style={s.th}>Access</th><th style={s.th}>Portal Link</th><th style={s.th}></th></tr></thead>
                  <tbody>
                    {clients.map(c => {
                      const agency = agencies.find(a => a.id === c.agency_id);
                      const site = sites.find(st => st.id === c.site_id);
                      return (
                        <tr key={c.id}>
                          <td style={s.td}>{c.client_name || c.client_email || '—'}</td>
                          <td style={s.td}>{agency?.name || '—'}</td>
                          <td style={{ ...s.td, fontFamily: 'monospace', fontSize: '12px' }}>{site?.url || '—'}</td>
                          <td style={s.td}>{c.can_edit ? '✏️ Edit' : '👁️ View'}</td>
                          <td style={s.td}>
                            <button style={s.copyBtn} onClick={() => { navigator.clipboard.writeText(portalLink(c.portal_token)); alert('Portal link copied!'); }}>
                              📋 Copy link
                            </button>
                          </td>
                          <td style={s.td}><button style={s.smBtn()} onClick={() => deleteClient(c.id)}>Del</button></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </div>

      {/* Add Agency Modal */}
      {showAddAgency && (
        <div style={s.modal} onClick={() => setShowAddAgency(false)}>
          <div style={s.modalCard} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: '18px', fontWeight: '800', marginBottom: '20px' }}>Add Agency</div>
            <div style={s.field}><label style={s.label}>Agency Name</label><input style={s.input} value={newAgency.name} onChange={e => setNewAgency(p => ({ ...p, name: e.target.value }))} /></div>
            <div style={s.field}><label style={s.label}>Contact Email</label><input style={s.input} value={newAgency.email} onChange={e => setNewAgency(p => ({ ...p, email: e.target.value }))} /></div>
            <div style={s.field}><label style={s.label}>Brand Color</label><input style={s.input} type="color" value={newAgency.brand_color} onChange={e => setNewAgency(p => ({ ...p, brand_color: e.target.value }))} /></div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
              <button style={{ ...s.btn(), flex: 1 }} onClick={addAgency}>Create</button>
              <button style={{ ...s.btn('#444'), flex: 1 }} onClick={() => setShowAddAgency(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Client Modal */}
      {showAddClient && (
        <div style={s.modal} onClick={() => setShowAddClient(false)}>
          <div style={s.modalCard} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: '18px', fontWeight: '800', marginBottom: '20px' }}>Add Client</div>
            <div style={s.field}><label style={s.label}>Agency</label>
              <select style={s.input} value={newClient.agency_id} onChange={e => setNewClient(p => ({ ...p, agency_id: e.target.value }))}>
                <option value="">Select agency</option>
                {agencies.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
            <div style={s.field}><label style={s.label}>Client Name</label><input style={s.input} value={newClient.client_name} onChange={e => setNewClient(p => ({ ...p, client_name: e.target.value }))} /></div>
            <div style={s.field}><label style={s.label}>Client Email</label><input style={s.input} value={newClient.client_email} onChange={e => setNewClient(p => ({ ...p, client_email: e.target.value }))} /></div>
            <div style={s.field}><label style={s.label}>Assign Site</label>
              <select style={s.input} value={newClient.site_id} onChange={e => setNewClient(p => ({ ...p, site_id: e.target.value }))}>
                <option value="">Select site</option>
                {sites.map(st => <option key={st.id} value={st.id}>{st.url || st.name}</option>)}
              </select>
            </div>
            <div style={s.field}>
              <label style={{ ...s.label, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input type="checkbox" checked={newClient.can_edit} onChange={e => setNewClient(p => ({ ...p, can_edit: e.target.checked }))} />
                Allow client to edit (default: view only)
              </label>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
              <button style={{ ...s.btn(), flex: 1 }} onClick={addClient}>Add Client</button>
              <button style={{ ...s.btn('#444'), flex: 1 }} onClick={() => setShowAddClient(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
