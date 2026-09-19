/**
 * pages/_app.js — Simple auth wrapper
 * Logged in = access. Admin controls via admin panel.
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import '../styles/globals.css';
import { supabase } from '../lib/api';

const PUBLIC_PAGES = ['/', '/login', '/pricing', '/signup'];

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setAuthChecked(true);
      if (!PUBLIC_PAGES.includes(router.pathname)) router.push('/login');
    }, 5000);

    supabase.auth.getSession().then(({ data }) => {
      clearTimeout(timeout);
      const session = data?.session;
      setUser(session?.user || null);
      setAuthChecked(true);
      if (!session && !PUBLIC_PAGES.includes(router.pathname)) {
        router.push('/login');
      }
    }).catch(() => {
      clearTimeout(timeout);
      setAuthChecked(true);
      if (!PUBLIC_PAGES.includes(router.pathname)) router.push('/login');
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      if (event === 'SIGNED_OUT') router.push('/login');
      if (event === 'SIGNED_IN' && PUBLIC_PAGES.includes(router.pathname)) router.push('/dashboard');
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!authChecked) {
    return (
      <div style={{ display:'flex', height:'100vh', alignItems:'center', justifyContent:'center', background:'#09090f', color:'#666', fontFamily:'system-ui', fontSize:'14px', flexDirection:'column', gap:'12px' }}>
        <div style={{ color:'white', fontSize:'22px', fontWeight:'900' }}>Koneqti<span style={{color:'#6c47ff'}}>SEO</span></div>
        <div>Loading...</div>
        <a href="/login" style={{ color:'#6c47ff', fontSize:'12px', marginTop:'8px' }}>Go to login</a>
      </div>
    );
  }

  if (PUBLIC_PAGES.includes(router.pathname)) return <Component {...pageProps} />;
  if (!user) return null;
  return <Component {...pageProps} />;
}
