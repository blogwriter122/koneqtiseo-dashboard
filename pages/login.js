/**
 * pages/login.js — Login + Signup + Reset
 * Uses inline Supabase client — no lib/api import
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (router.query.mode) setMode(router.query.mode);
  }, [router.query.mode]);

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
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage('Account created! You can now sign in.');
        setMode('login');
      } else if (mode === 'reset') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/settings`,
        });
        if (error) throw error;
        setMessage('Password reset email sent. Check your inbox.');
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Head><title>Sign In — KoneqtiSEO</title></Head>
      <style>{`
        * { margin:0; padding:0; box-sizing:border-box; }
        body { background:#09090f; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; }
        .wrap { min-height:100vh; display:flex; align-items:center; justify-content:center; padding:24px; }
        .card { background:#111120; border:1px solid #1e1e3a; border-radius:16px; padding:40px; width:100%; max-width:400px; }
        .logo { font-size:22px; font-weight:900; color:white; text-align:center; margin-bottom:28px; }
        .logo span { color:#6c47ff; }
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
        .link-btn { background:none; border:none; color:#6c47ff; font-size:12px; cursor:pointer; }
        .reset-row { text-align:right; margin-top:-10px; margin-bottom:16px; }
        .home-link { text-align:center; margin-top:20px; font-size:13px; color:#444; }
        .home-link a { color:#6c47ff; text-decoration:none; }
      `}</style>
      <div className="wrap">
        <div className="card">
          <div className="logo">Koneqti<span>SEO</span></div>

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
                  <div className="reset-row">
                    <button type="button" className="link-btn" onClick={() => { setMode('reset'); setError(''); setMessage(''); }}>Forgot password?</button>
                  </div>
                )}
              </>
            )}

            <button className="btn" type="submit" disabled={loading}>
              {loading ? 'Please wait...' : mode === 'login' ? 'Sign In →' : mode === 'signup' ? 'Create Account →' : 'Send Reset Email →'}
            </button>

            {mode === 'reset' && (
              <div style={{ textAlign:'center', marginTop:'16px' }}>
                <button type="button" className="link-btn" onClick={() => setMode('login')}>← Back to Sign In</button>
              </div>
            )}
          </form>

          <div className="home-link"><a href="/">← Back to homepage</a></div>
        </div>
      </div>
    </>
  );
}
