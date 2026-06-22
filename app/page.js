'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/useAuth';

export default function Home() {
  const { user } = useAuth();

  return (
    <div style={{ maxWidth: 1000, margin: '40px auto', padding: '0 20px', textAlign: 'center' }}>
      <h1 style={{ fontSize: '2.8rem', color: '#6B2A1E' }}>🕉️ स्वागत है Maithili Panchang में</h1>
      <p style={{ fontSize: '1.2rem', color: '#5A4A3A', margin: '16px 0' }}>
        दैनिक, मासिक पंचांग, शुभ मुहूर्त, और रियल-टाइम चैट – सब कुछ एक जगह
      </p>
      
      {!user && (
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginTop: 20 }}>
          <Link href="/login" style={{ background: '#6B2A1E', color: 'white', padding: '12px 28px', borderRadius: 40, textDecoration: 'none', fontWeight: 600 }}>🔑 लॉगिन करें</Link>
          <Link href="/signup" style={{ background: '#D4A373', color: '#6B2A1E', padding: '12px 28px', borderRadius: 40, textDecoration: 'none', fontWeight: 600 }}>📝 नया खाता बनाएँ</Link>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginTop: 30 }}>
        {['daily', 'monthly', 'muhurt', 'chat'].map((page) => (
          <Link key={page} href={`/${page}`} style={{ background: 'white', padding: 16, borderRadius: 16, boxShadow: '0 4px 15px rgba(0,0,0,0.08)', textDecoration: 'none', color: '#2D1B12', transition: 'transform 0.2s', border: '1px solid #eee' }}>
            <div style={{ fontSize: '2rem' }}>{page === 'daily' ? '📅' : page === 'monthly' ? '📆' : page === 'muhurt' ? '🪔' : '💬'}</div>
            <div style={{ fontWeight: 600, marginTop: 8 }}>{page === 'daily' ? 'दैनिक पंचांग' : page === 'monthly' ? 'मासिक पंचांग' : page === 'muhurt' ? 'शुभ मुहूर्त' : 'लाइव चैट'}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
