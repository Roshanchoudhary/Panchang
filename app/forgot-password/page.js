'use client';

import { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Link from 'next/link';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleReset = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('✅ पासवर्ड रीसेट लिंक आपके ईमेल पर भेज दिया गया है।');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '50px auto', padding: 24, background: 'white', borderRadius: 16, boxShadow: '0 8px 30px rgba(0,0,0,0.10)' }}>
      <h2 style={{ textAlign: 'center', color: '#6B2A1E' }}>🔐 पासवर्ड भूल गए?</h2>
      {message && <p style={{ color: 'green', textAlign: 'center' }}>{message}</p>}
      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
      <form onSubmit={handleReset}>
        <input type="email" placeholder="अपना ईमेल डालें" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: 10, margin: '8px 0', border: '1px solid #ddd', borderRadius: 8 }} />
        <button type="submit" style={{ width: '100%', padding: 12, background: '#6B2A1E', color: 'white', border: 'none', borderRadius: 8, fontSize: '1rem', fontWeight: 600, cursor: 'pointer' }}>रीसेट लिंक भेजें</button>
      </form>
      <p style={{ textAlign: 'center', marginTop: 12 }}>
        <Link href="/login" style={{ color: '#C68A3C' }}>लॉगिन पर वापस जाएँ</Link>
      </p>
    </div>
  );
}
