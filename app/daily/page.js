'use client';

import { useState, useEffect } from 'react';
import { fetchPanchangData } from '@/lib/googleSheets';
import AuthGuard from '@/components/AuthGuard';

export default function DailyPanchang() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    fetchPanchangData().then((res) => {
      if (res) setData(res);
      setLoading(false);
    });
  }, []);

  const formatDate = (d) => {
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return dd + '/' + mm + '/' + yyyy;
  };

  const todayStr = formatDate(selectedDate);
  const record = data.find(r => r.date === todayStr);

  return (
    <AuthGuard>
      <div style={{ maxWidth: 900, margin: '20px auto', padding: '0 16px' }}>
        <h1 style={{ color: '#6B2A1E', marginBottom: 16 }}>📅 दैनिक पंचांग</h1>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
          <button onClick={() => { const d = new Date(selectedDate); d.setDate(d.getDate() - 1); setSelectedDate(d); }} style={{ background: '#6B2A1E', color: 'white', border: 'none', padding: '6px 16px', borderRadius: 40, cursor: 'pointer' }}>◀</button>
          <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{selectedDate.toLocaleDateString('hi-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          <button onClick={() => { const d = new Date(selectedDate); d.setDate(d.getDate() + 1); setSelectedDate(d); }} style={{ background: '#6B2A1E', color: 'white', border: 'none', padding: '6px 16px', borderRadius: 40, cursor: 'pointer' }}>▶</button>
          <button onClick={() => setSelectedDate(new Date())} style={{ background: '#C68A3C', color: 'white', border: 'none', padding: '6px 16px', borderRadius: 40, cursor: 'pointer' }}>📅 आज</button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>⏳ लोड हो रहा...</div>
        ) : record ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, background: 'white', padding: 20, borderRadius: 16, boxShadow: '0 8px 30px rgba(0,0,0,0.10)' }}>
            {['दिन', 'महीना', 'पक्ष', 'तिथि', 'सूर्योदय', 'सूर्यास्त'].map((label) => (
              <div key={label} style={{ background: '#faf6f0', padding: 12, borderRadius: 14, borderLeft: '4px solid #D4A373' }}>
                <div style={{ fontSize: '0.7rem', color: '#5A4A3A' }}>{label === 'दिन' ? '📅' : label === 'महीना' ? '📆' : label === 'पक्ष' ? '🌗' : label === 'तिथि' ? '🗓️' : label === 'सूर्योदय' ? '🌅' : '🌇'} {label}</div>
                <div style={{ fontWeight: 700 }}>{record[label === 'दिन' ? 'day' : label === 'महीना' ? 'month' : label === 'पक्ष' ? 'paksh' : label === 'तिथि' ? 'tithi' : label === 'सूर्योदय' ? 'sunrise' : 'sunset']}</div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: 40, background: 'white', borderRadius: 16, color: '#c0392b' }}>❌ {todayStr} का डेटा नहीं मिला</div>
        )}
      </div>
    </AuthGuard>
  );
}
