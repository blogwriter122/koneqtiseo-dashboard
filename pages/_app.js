/**
 * pages/_app.js — App wrapper
 * Fixed: faster timeout + better session handling
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
    // Fast timeout — 3 seconds max
    const timeout = setTimeout(() => {
      setAuthChecked(true);
      if (!PUBLIC_PAGES.includes(router.pathname)) {
        router.push('/login');
      }
    }, 3000);

    supabase.auth.getSession().then(({ data }) => {
      clearTimeout(timeout);
      const session = data?.session;
      setUser(session?.user || null);
      setAuthChecked(true);
      const isPublic = PUBLIC_PAGES.includes(router.pathname);
      if (!session && !isPublic) router.push('/login');
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
      <div style={{
        display: 'flex', height: '100vh', alignItems: 'center',
        justifyContent: 'center', background: '#09090f', color: '#666',
        fontFamily: 'system-ui', fontSize: '14px', flexDirection: 'column', gap: '12px',
      }}>
        <div>Loading KoneqtiSEO...</div>
        <div style={{ fontSize: '12px', color: '#444' }}>
          If stuck, <a href="/login" style={{ color: '#6c47ff' }}>click here</a>
        </div>
      </div>
    );
  }

  if (PUBLIC_PAGES.includes(router.pathname)) {
    return <Component {...pageProps} />;
  }

  if (!user) return null;

  return <Component {...pageProps} />;
}
