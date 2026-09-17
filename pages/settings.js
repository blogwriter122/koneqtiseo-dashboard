/**
 * pages/settings.js — User Settings + API Key Page
 *
 * User comes here to:
 *   1. Get their API key (to paste into launcher)
 *   2. Download the launcher
 *   3. Manage account settings
 */

import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { supabase } from '../lib/api';

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState('');
  const [copied, setCopied] = useState(false);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('launcher');

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user));
    // Generate or fetch API key
    generateAPIKey();
  }, []);

  async function generateAPIKey() {
    // For now use user ID as simple key (will be replaced with proper key generation)
    const { data } = await supabase.auth.getUser();
    if (data?.user) {
      // Create a readable API key from user ID
      const key = 'ks_' + data.user.id.replace(/-/g, '').slice(0, 32);
      setApiKey(key);
    }
  }

  function copyKey() {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const LAUNCHER_DOWNLOADS = [
    { os: 'Windows', icon: '🪟', file: 'KoneqtiSEO-Launcher-Setup.exe', url: 'https://github.com/blogwriter122/koneqtiseo-launcher/releases/latest/download/KoneqtiSEO-Launcher-Setup.exe' },
    { os: 'macOS', icon: '🍎', file: 'KoneqtiSEO-Launcher.dmg', url: 'https://github.com/blogwriter122/koneqtiseo-launcher/releases/latest/download/KoneqtiSEO-Launcher.dmg' },
    { os: 'Linux', icon: '🐧', file: 'KoneqtiSEO-Launcher.AppImage', url: 'https://github.com/blogwriter122/koneqtiseo-launcher/releases/latest/download/KoneqtiSEO-Launcher.AppImage' },
  ];

  const s = {
    page: { padding: '24px' },
    tabs: { display: 'flex', gap: '8px', marginBottom: '20px' },
    tab: (a) => ({ padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: a ? 'var(--forge)' : 'var(--panel)', color: a ? 'white' : 'var(--text)', fontWeight: a ? '700' : '400' }),
    panel: { background: 'var(--panel)', borderRadius: '12px', padding: '24px', marginBottom: '16px' },
    label: { fontSize: '12px', color: 'var(--text-faint)', fontWeight: '600', marginBottom: '6px', display: 'block' },
    keyBox: { display: 'flex', gap: '8px', alignItems: 'center' },
    keyInput: { flex: 1, padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontFamily: 'monospace', fontSize: '14px' },
    btn: (color = 'var(--forge)') => ({ background: color, color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '14px', whiteSpace: 'nowrap' }),
    downloadCard: { background: 'var(--bg)', borderRadius: '10px', padding: '20px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' },
    step: { display: 'flex', gap: '16px', alignItems: 'flex-start', padding: '16px 0', borderBottom: '1px solid var(--border)' },
    stepNum: { width: '32px', height: '32px', borderRadius: '50%', background: 'var(--forge)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '14px', flexShrink: 0 },
  };

  return (
    <Layout>
      <div style={s.page}>
        <div className="page-head">
          <div>
            <div className="page-title">⚙️ Settings</div>
            <div className="page-sub">Launcher setup, API key, account</div>
          </div>
        </div>

        <div style={s.tabs}>
          {[['launcher','🚀 Launcher Setup'],['api','🔑 API Key'],['account','👤 Account']].map(([tab, label]) => (
            <button key={tab} style={s.tab(activeTab === tab)} onClick={() => setActiveTab(tab)}>{label}</button>
          ))}
        </div>

        {/* ── LAUNCHER TAB ── */}
        {activeTab === 'launcher' && (
          <>
            <div style={s.panel}>
              <div style={{ fontWeight: '700', fontSize: '18px', marginBottom: '8px' }}>Setup Guide</div>
              <div style={{ color: 'var(--text-faint)', fontSize: '14px', marginBottom: '24px' }}>
                The launcher connects your Chrome browser to the KoneqtiSEO engine. Setup takes 2 minutes.
              </div>

              {[
                { title: 'Download the Launcher', body: 'Choose your operating system below and download the installer.' },
                { title: 'Install and Open', body: 'Run the installer. The app opens automatically after install.' },
                { title: 'Paste Your API Key', body: 'Go to the API Key tab, copy your key, paste it into the launcher, and click Connect.' },
                { title: 'Keep It Running', body: 'Leave the launcher running while using KoneqtiSEO. It minimizes to your system tray.' },
              ].map((step, i) => (
                <div key={i} style={s.step}>
                  <div style={s.stepNum}>{i + 1}</div>
                  <div>
                    <div style={{ fontWeight: '700', marginBottom: '4px' }}>{step.title}</div>
                    <div style={{ fontSize: '14px', color: 'var(--text-faint)' }}>{step.body}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={s.panel}>
              <div style={{ fontWeight: '700', marginBottom: '16px' }}>Download Launcher</div>
              {LAUNCHER_DOWNLOADS.map(d => (
                <div key={d.os} style={s.downloadCard}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '28px' }}>{d.icon}</span>
                    <div>
                      <div style={{ fontWeight: '700' }}>{d.os}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-faint)' }}>{d.file}</div>
                    </div>
                  </div>
                  <a href={d.url} download style={{ ...s.btn(), textDecoration: 'none' }}>
                    ⬇️ Download
                  </a>
                </div>
              ))}
              <div style={{ fontSize: '12px', color: 'var(--text-faint)', marginTop: '12px' }}>
                Requires Google Chrome to be installed. Windows 10+, macOS 11+.
              </div>
            </div>
          </>
        )}

        {/* ── API KEY TAB ── */}
        {activeTab === 'api' && (
          <div style={s.panel}>
            <div style={{ fontWeight: '700', fontSize: '18px', marginBottom: '8px' }}>Your API Key</div>
            <div style={{ color: 'var(--text-faint)', fontSize: '14px', marginBottom: '24px' }}>
              Paste this key into the KoneqtiSEO Launcher to connect your Chrome browser.
              Keep it secret — do not share it publicly.
            </div>

            <label style={s.label}>API Key</label>
            <div style={s.keyBox}>
              <input
                style={s.keyInput}
                type="text"
                value={apiKey || 'Loading...'}
                readOnly
              />
              <button style={s.btn(copied ? '#00c853' : undefined)} onClick={copyKey}>
                {copied ? '✅ Copied!' : '📋 Copy Key'}
              </button>
            </div>

            <div style={{ marginTop: '24px', background: 'var(--bg)', borderRadius: '8px', padding: '16px', border: '1px solid var(--border)' }}>
              <div style={{ fontWeight: '700', marginBottom: '8px' }}>How to use in the Launcher:</div>
              <ol style={{ paddingLeft: '20px', lineHeight: '2', fontSize: '14px', color: 'var(--text-faint)' }}>
                <li>Open KoneqtiSEO Launcher on your PC</li>
                <li>Click the API Key field</li>
                <li>Paste your key (Ctrl+V / Cmd+V)</li>
                <li>Click <strong>Connect</strong></li>
                <li>Green dot = you're connected ✅</li>
              </ol>
            </div>

            <div style={{ marginTop: '16px' }}>
              <button style={s.btn('#f44336')} onClick={generateAPIKey}>
                🔄 Regenerate Key
              </button>
              <div style={{ fontSize: '12px', color: 'var(--text-faint)', marginTop: '8px' }}>
                ⚠️ Regenerating will disconnect any active launcher sessions.
              </div>
            </div>
          </div>
        )}

        {/* ── ACCOUNT TAB ── */}
        {activeTab === 'account' && (
          <div style={s.panel}>
            <div style={{ fontWeight: '700', fontSize: '18px', marginBottom: '16px' }}>Account</div>
            {user && (
              <div style={{ fontSize: '14px', lineHeight: '2' }}>
                <div><strong>Email:</strong> {user.email}</div>
                <div><strong>User ID:</strong> <span style={{ fontFamily: 'monospace', fontSize: '12px' }}>{user.id}</span></div>
                <div><strong>Plan:</strong> Starter</div>
              </div>
            )}
            <div style={{ marginTop: '24px' }}>
              <button style={s.btn('#f44336')} onClick={() => supabase.auth.signOut()}>
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
