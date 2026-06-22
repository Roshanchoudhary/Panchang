'use client';

import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '50px auto', padding: 24, background: 'white', borderRadius: 16, boxShadow: '0 8px 30px rgba(0,0,0,0.10)' }}>
      <h2 style={{ textAlign: 'center', color: '#6B2A1E' }}>🔑 लॉगिन</h2>
      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
      <form onSubmit={handleLogin}>
        <input type="email" placeholder="ईमेल" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: 10, margin: '8px 0', border: '1px solid #ddd', borderRadius: 8 }} />
        <input type="password" placeholder="पासवर्ड" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', padding: 10, margin: '8px 0', border: '1px solid #ddd', borderRadius: 8 }} />
        <button type="submit" style={{ width: '100%', padding: 12, background: '#6B2A1E', color: 'white', border: 'none', borderRadius: 8, fontSize: '1rem', fontWeight: 600, cursor: 'pointer' }}>लॉगिन करें</button>
      </form>
      <p style={{ textAlign: 'center', marginTop: 12 }}>
        <Link href="/forgot-password" style={{ color: '#C68A3C' }}>पासवर्ड भूल गए?</Link> | <Link href="/signup" style={{ color: '#C68A3C' }}>नया खाता बनाएँ</Link>
      </p>
    </div>
  );
}
