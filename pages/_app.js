/**
 * pages/_app.js — Ultra simple auth
 * No hanging getSession() call
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import '../styles/globals.css';
import { supabase } from '../lib/api';

const PUBLIC_PAGES = ['/', '/login', '/pricing', '/signup'];

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const isPublic = PUBLIC_PAGES.includes(router.pathname);

    // Check localStorage for existing Supabase session (instant, no network)
    try {
      const keys = Object.keys(localStorage);
      const sessionKey = keys.find(k => k.includes('auth-token'));
      if (sessionKey) {
        const session = JSON.parse(localStorage.getItem(sessionKey));
        if (session?.user) {
          setUser(session.user);
          setReady(true);
          return;
        }
      }
    } catch (_) {}

    // No local session found
    setReady(true);
    if (!isPublic) router.push('/login');

    // Background auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      if (event === 'SIGNED_OUT') router.push('/login');
      if (event === 'SIGNED_IN' && isPublic) router.push('/dashboard');
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!ready) {
    return (
      <div style={{ display:'flex', height:'100vh', alignItems:'center', justifyContent:'center', background:'#09090f', color:'#666', fontFamily:'system-ui', flexDirection:'column', gap:'12px' }}>
        <div style={{ color:'white', fontSize:'22px', fontWeight:'900' }}>Koneqti<span style={{color:'#6c47ff'}}>SEO</span></div>
        <div style={{ fontSize:'13px' }}>Loading...</div>
        <a href="/login" style={{ color:'#6c47ff', fontSize:'12px', marginTop:'4px' }}>Click here if stuck</a>
      </div>
    );
  }

  if (PUBLIC_PAGES.includes(router.pathname)) return <Component {...pageProps} />;
  if (!user) return null;
  return <Component {...pageProps} />;
}
