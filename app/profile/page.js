'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/useAuth';
import { updateProfile } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import AuthGuard from '@/components/AuthGuard';

export default function Profile() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.displayName || '');
  const [message, setMessage] = useState('');

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(user, { displayName: name });
      setMessage('✅ प्रोफाइल अपडेट हो गया!');
    } catch (err) {
      setMessage('❌ ' + err.message);
    }
  };

  return (
    <AuthGuard>
      <div style={{ maxWidth: 500, margin: '40px auto', padding: 24, background: 'white', borderRadius: 16, boxShadow: '0 8px 30px rgba(0,0,0,0.10)' }}>
        <h2 style={{ color: '#6B2A1E', textAlign: 'center' }}>👤 प्रोफाइल</h2>
        <p><strong>ईमेल:</strong> {user?.email}</p>
        <form onSubmit={handleUpdate}>
          <label style={{ display: 'block', marginTop: 12, fontWeight: 600 }}>पूरा नाम</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} style={{ width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 8, margin: '4px 0' }} />
          <button type="submit" style={{ width: '100%', padding: 12, background: '#6B2A1E', color: 'white', border: 'none', borderRadius: 8, fontSize: '1rem', fontWeight: 600, cursor: 'pointer', marginTop: 12 }}>प्रोफाइल अपडेट करें</button>
        </form>
        {message && <p style={{ textAlign: 'center', marginTop: 12, color: message.includes('✅') ? 'green' : 'red' }}>{message}</p>}
      </div>
    </AuthGuard>
  );
}
