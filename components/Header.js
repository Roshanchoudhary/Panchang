'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/useAuth';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function Header() {
  const { user } = useAuth();

  return (
    <header style={{ background: '#6B2A1E', color: 'white', padding: '12px 20px', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
        <Link href="/" style={{ color: 'white', textDecoration: 'none', fontSize: '1.6rem', fontWeight: 700 }}>
          🕉️ <span style={{ color: '#D4A373' }}>Maithili</span> Panchang
        </Link>
        <nav style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <Link href="/daily" style={{ color: 'white', textDecoration: 'none', padding: '5px 12px', borderRadius: 40, background: 'rgba(255,255,255,0.08)' }}>📅 दैनिक</Link>
          <Link href="/monthly" style={{ color: 'white', textDecoration: 'none', padding: '5px 12px', borderRadius: 40, background: 'rgba(255,255,255,0.08)' }}>📆 मासिक</Link>
          <Link href="/muhurt" style={{ color: 'white', textDecoration: 'none', padding: '5px 12px', borderRadius: 40, background: 'rgba(255,255,255,0.08)' }}>🪔 मुहूर्त</Link>
          <Link href="/chat" style={{ color: 'white', textDecoration: 'none', padding: '5px 12px', borderRadius: 40, background: 'rgba(255,255,255,0.08)' }}>💬 चैट</Link>
          {user ? (
            <>
              <Link href="/profile" style={{ color: 'white', textDecoration: 'none', padding: '5px 12px', borderRadius: 40, background: 'rgba(255,255,255,0.08)' }}>👤 {user.displayName || 'प्रोफाइल'}</Link>
              <button onClick={() => signOut(auth)} style={{ background: '#D4A373', color: '#6B2A1E', border: 'none', padding: '5px 14px', borderRadius: 40, fontWeight: 600, cursor: 'pointer' }}>लॉगआउट</button>
            </>
          ) : (
            <>
              <Link href="/login" style={{ color: 'white', textDecoration: 'none', padding: '5px 12px', borderRadius: 40, background: 'rgba(255,255,255,0.08)' }}>🔑 लॉगिन</Link>
              <Link href="/signup" style={{ color: '#6B2A1E', textDecoration: 'none', padding: '5px 14px', borderRadius: 40, background: '#D4A373', fontWeight: 600 }}>रजिस्टर</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
