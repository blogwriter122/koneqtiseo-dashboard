/**
 * pages/signup.js — Signup redirect to login with signup mode
 */
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function SignupRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace('/login?mode=signup'); }, []);
  return null;
}
