/**
 * pages/reports.js — White-label Agency Reports
 */
import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { api, fetchers } from '../lib/api';

export default function ReportsPage() {
  const [sites, setSites] = useState([]);
  const [selectedSite, setSelectedSite] = useState('');
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState([]);

  useEffect(() => { fetchers.sites().then(setSites); }, []);

  async function generateReport() {
    if (!selectedSite) { alert('Select a site first'); return; }
    setLoading(true);
    try {
      await api.generateAgencyReport({ siteId: selectedSite, agencyId: null });
      alert('Report generation started — will appear below when ready');
    } catch (e) { alert(e.message); } finally { setLoading(false); }
  }

  const s = {
    page: { padding: '24px' },
    panel: { background: 'var(--panel)', borderRadius: '12px', padding: '20px', marginBottom: '16px' },
    select: { padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: '14px' },
    btn: (color = 'var(--forge)') => ({ background: color, color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '14px' }),
    row: { display: 'flex', gap: '12px', alignItems: 'center' },
  };

  return (
    <Layout>
      <div style={s.page}>
        <div className="page-head">
          <div>
            <div className="page-title">📄 Reports</div>
            <div className="page-sub">White-label monthly SEO reports for agencies and clients</div>
          </div>
        </div>

        <div style={s.panel}>
          <div style={{ fontWeight: '700', marginBottom: '16px' }}>Generate Monthly Report</div>
          <div style={s.row}>
            <select style={s.select} value={selectedSite} onChange={e => setSelectedSite(e.target.value)}>
              <option value="">Select site</option>
              {sites.map(s => <option key={s.id} value={s.id}>{s.url || s.name}</option>)}
            </select>
            <button style={s.btn()} onClick={generateReport} disabled={loading || !selectedSite}>
              {loading ? '⏳ Generating...' : '📄 Generate Report'}
            </button>
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-faint)', marginTop: '12px' }}>
            Report includes: health score, articles published, backlinks built, rankings progress, next month plan. White-label with your agency name.
          </div>
        </div>

        <div style={s.panel}>
          <div style={{ fontWeight: '700', marginBottom: '16px' }}>Previous Reports</div>
          {reports.length === 0 ? (
            <div className="empty">No reports generated yet. Select a site and generate your first report.</div>
          ) : (
            reports.map((r, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <span>{r.filename}</span>
                <a href={r.filepath} download style={s.btn()}>⬇️ Download</a>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}
