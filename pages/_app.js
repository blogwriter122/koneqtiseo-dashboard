/**
 * pages/_app.js — App wrapper with approval system
 * pending users see waiting screen, active users get full access
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
  const [userStatus, setUserStatus] = useState(null); // pending | active | suspended

  useEffect(() => {
    const timeout = setTimeout(() => {
      setAuthChecked(true);
      if (!PUBLIC_PAGES.includes(router.pathname)) router.push('/login');
    }, 5000);

    supabase.auth.getSession().then(async ({ data }) => {
      clearTimeout(timeout);
      const session = data?.session;
      if (session?.user) {
        setUser(session.user);
        // Check user status
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('status, plan')
          .eq('id', session.user.id)
          .single();
        setUserStatus(profile?.status || 'pending');
      }
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
      <div style={{ display:'flex', height:'100vh', alignItems:'center', justifyContent:'center', background:'#09090f', color:'#666', fontFamily:'system-ui', fontSize:'14px', flexDirection:'column', gap:'12px' }}>
        <div style={{ color:'white', fontSize:'20px', fontWeight:'800' }}>Koneqti<span style={{color:'#6c47ff'}}>SEO</span></div>
        <div>Loading...</div>
        <div style={{ fontSize:'12px' }}>
          <a href="/login" style={{ color:'#6c47ff' }}>Go to login</a>
        </div>
      </div>
    );
  }

  if (PUBLIC_PAGES.includes(router.pathname)) {
    return <Component {...pageProps} />;
  }

  if (!user) return null;

  // Pending approval screen
  if (userStatus === 'pending') {
    return (
      <div style={{ display:'flex', height:'100vh', alignItems:'center', justifyContent:'center', background:'#09090f', fontFamily:'system-ui', flexDirection:'column', gap:'16px', padding:'24px', textAlign:'center' }}>
        <div style={{ fontSize:'48px' }}>⏳</div>
        <div style={{ color:'white', fontSize:'24px', fontWeight:'800' }}>Account Pending Approval</div>
        <div style={{ color:'#666', fontSize:'15px', maxWidth:'400px', lineHeight:'1.7' }}>
          Your account has been created successfully. We review all new accounts before granting access. You'll receive an email once your account is approved.
        </div>
        <div style={{ color:'#444', fontSize:'13px' }}>Logged in as: {user.email}</div>
        <button
          onClick={() => supabase.auth.signOut()}
          style={{ background:'transparent', border:'1px solid #333', color:'#666', padding:'8px 20px', borderRadius:'8px', cursor:'pointer', marginTop:'8px' }}
        >
          Sign Out
        </button>
      </div>
    );
  }

  // Suspended screen
  if (userStatus === 'suspended') {
    return (
      <div style={{ display:'flex', height:'100vh', alignItems:'center', justifyContent:'center', background:'#09090f', fontFamily:'system-ui', flexDirection:'column', gap:'16px', padding:'24px', textAlign:'center' }}>
        <div style={{ fontSize:'48px' }}>🚫</div>
        <div style={{ color:'white', fontSize:'24px', fontWeight:'800' }}>Account Suspended</div>
        <div style={{ color:'#666', fontSize:'15px' }}>Contact support for assistance.</div>
        <button onClick={() => supabase.auth.signOut()} style={{ background:'transparent', border:'1px solid #333', color:'#666', padding:'8px 20px', borderRadius:'8px', cursor:'pointer' }}>Sign Out</button>
      </div>
    );
  }

  return <Component {...pageProps} />;
}
