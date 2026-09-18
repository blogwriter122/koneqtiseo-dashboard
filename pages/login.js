/**
 * pages/login.js — Login + Signup Page
 * Handles auth via Supabase
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/api';
import Head from 'next/head';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState('login'); // login | signup | reset

  useEffect(() => {
    // Read mode from URL query (?mode=signup)
    if (router.query.mode) setMode(router.query.mode);
  }, [router.query.mode]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data?.session) router.push('/dashboard');
    });
  }, []);

  async function handleSubmit(e) {
    e?.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push('/dashboard');

      } else if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password,
          options: { emailRedirectTo: `${window.location.origin}/dashboard` }
        });
        if (error) throw error;
        setMessage('Check your email to confirm your account.');

      } else if (mode === 'reset') {
        const { error } = await supabase.auth.resetPasswordForEmail(email,
          { redirectTo: `${window.location.origin}/settings` });
        if (error) throw error;
        setMessage('Password reset email sent.');
      }
    } catch (e) {
      setError(e.message);
    } finally { setLoading(false); }
  }

  return (
    <>
      <Head>
        <title>{mode === 'signup' ? 'Sign Up' : 'Sign In'} — KoneqtiSEO</title>
      </Head>
      <style>{`
        * { margin:0; padding:0; box-sizing:border-box; }
        body { background:#09090f; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; }
        .wrap { min-height:100vh; display:flex; align-items:center; justify-content:center; padding:24px; }
        .card { background:#111120; border:1px solid #1e1e3a; border-radius:16px; padding:40px; width:100%; max-width:400px; }
        .logo { font-size:22px; font-weight:900; color:white; text-align:center; margin-bottom:8px; }
        .logo span { color:#6c47ff; }
        .subtitle { font-size:14px; color:#666; text-align:center; margin-bottom:32px; }
        .tabs { display:flex; gap:4px; background:#09090f; border-radius:10px; padding:4px; margin-bottom:24px; }
        .tab { flex:1; padding:8px; border:none; border-radius:8px; cursor:pointer; font-size:13px; font-weight:600; background:transparent; color:#666; }
        .tab.active { background:#6c47ff; color:white; }
        label { display:block; font-size:12px; color:#666; font-weight:600; margin-bottom:6px; }
        input { width:100%; padding:12px 14px; border-radius:10px; border:1.5px solid #1e1e3a; background:#09090f; color:white; font-size:14px; margin-bottom:16px; outline:none; }
        input:focus { border-color:#6c47ff; }
        .btn { width:100%; padding:13px; border-radius:10px; border:none; cursor:pointer; font-size:15px; font-weight:700; background:#6c47ff; color:white; margin-top:4px; }
        .btn:disabled { opacity:0.6; cursor:not-allowed; }
        .error { background:rgba(244,67,54,0.1); border:1px solid rgba(244,67,54,0.2); color:#ef5350; padding:12px; border-radius:8px; font-size:13px; margin-bottom:16px; }
        .success { background:rgba(0,200,83,0.1); border:1px solid rgba(0,200,83,0.2); color:#00c853; padding:12px; border-radius:8px; font-size:13px; margin-bottom:16px; }
        .footer { text-align:center; margin-top:24px; font-size:13px; color:#444; }
        .footer a { color:#6c47ff; text-decoration:none; }
        .reset-link { text-align:right; margin-top:-10px; margin-bottom:16px; }
        .reset-link button { background:none; border:none; color:#6c47ff; font-size:12px; cursor:pointer; }
        .divider { border:none; border-top:1px solid #1e1e3a; margin:20px 0; }
        .google-btn { width:100%; padding:12px; border-radius:10px; border:1.5px solid #1e1e3a; background:transparent; color:white; font-size:14px; font-weight:600; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:10px; }
        .google-btn:hover { border-color:#6c47ff; }
      `}</style>
      <div className="wrap">
        <div className="card">
          <div className="logo">Koneqti<span>SEO</span></div>
          <div className="subtitle">
            {mode === 'signup' ? 'Create your account' : mode === 'reset' ? 'Reset your password' : 'Welcome back'}
          </div>

          {mode !== 'reset' && (
            <div className="tabs">
              <button className={`tab ${mode === 'login' ? 'active' : ''}`} onClick={() => { setMode('login'); setError(''); setMessage(''); }}>Sign In</button>
              <button className={`tab ${mode === 'signup' ? 'active' : ''}`} onClick={() => { setMode('signup'); setError(''); setMessage(''); }}>Sign Up</button>
            </div>
          )}

          {error && <div className="error">❌ {error}</div>}
          {message && <div className="success">✅ {message}</div>}

          <form onSubmit={handleSubmit}>
            <label>Email</label>
            <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />

            {mode !== 'reset' && (
              <>
                <label>Password</label>
                <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
                {mode === 'login' && (
                  <div className="reset-link">
                    <button type="button" onClick={() => { setMode('reset'); setError(''); setMessage(''); }}>Forgot password?</button>
                  </div>
                )}
              </>
            )}

            <button className="btn" type="submit" disabled={loading}>
              {loading ? '⏳ Please wait...' : mode === 'login' ? 'Sign In →' : mode === 'signup' ? 'Create Account →' : 'Send Reset Email →'}
            </button>

            {mode === 'reset' && (
              <div style={{ textAlign: 'center', marginTop: '16px' }}>
                <button type="button" style={{ background: 'none', border: 'none', color: '#6c47ff', cursor: 'pointer', fontSize: '13px' }} onClick={() => setMode('login')}>← Back to Sign In</button>
              </div>
            )}
          </form>

          {mode !== 'reset' && (
            <>
              <hr className="divider" />
              <button className="google-btn" onClick={async () => {
                await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${window.location.origin}/dashboard` } });
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Continue with Google
              </button>
            </>
          )}

          <div className="footer">
            {mode === 'signup'
              ? <>Already have an account? <a href="/login" onClick={e => { e.preventDefault(); setMode('login'); }}>Sign in</a></>
              : mode === 'login'
                ? <>Don't have an account? <a href="/login" onClick={e => { e.preventDefault(); setMode('signup'); }}>Sign up free</a></>
                : null
            }
          </div>
        </div>
      </div>
    </>
  );
}
