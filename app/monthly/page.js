'use client';

import { useState, useEffect } from 'react';
import { fetchPanchangData } from '@/lib/googleSheets';
import AuthGuard from '@/components/AuthGuard';

export default function MonthlyPanchang() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchPanchangData().then((res) => {
      if (res) setData(res);
      setLoading(false);
    });
  }, []);

  const monthNames = ['जनवरी', 'फरवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'];
  const dayNames = ['रवि', 'सोम', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि'];

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const formatDate = (d, m, y) => {
    const dd = String(d).padStart(2, '0');
    const mm = String(m + 1).padStart(2, '0');
    const yy = String(y);
    return dd + '/' + mm + '/' + yy;
  };

  return (
    <AuthGuard>
      <div style={{ maxWidth: 1000, margin: '20px auto', padding: '0 16px' }}>
        <h1 style={{ color: '#6B2A1E', marginBottom: 16 }}>📆 मासिक पंचांग</h1>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
          <button onClick={() => { if (month === 0) { setMonth(11); setYear(year - 1); } else { setMonth(month - 1); } }} style={{ background: '#6B2A1E', color: 'white', border: 'none', padding: '6px 16px', borderRadius: 40, cursor: 'pointer' }}>◀</button>
          <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{monthNames[month]} {year}</span>
          <button onClick={() => { if (month === 11) { setMonth(0); setYear(year + 1); } else { setMonth(month + 1); } }} style={{ background: '#6B2A1E', color: 'white', border: 'none', padding: '6px 16px', borderRadius: 40, cursor: 'pointer' }}>▶</button>
          <button onClick={() => { const d = new Date(); setMonth(d.getMonth()); setYear(d.getFullYear()); }} style={{ background: '#C68A3C', color: 'white', border: 'none', padding: '6px 16px', borderRadius: 40, cursor: 'pointer' }}>📅 आज</button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>⏳ लोड हो रहा...</div>
        ) : (
          <div style={{ background: 'white', borderRadius: 16, overflow: 'hidden', boxShadow: '0 8px 30px rgba(0,0,0,0.10)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, padding: 12 }}>
              {dayNames.map((d) => (
                <div key={d} style={{ textAlign: 'center', fontWeight: 700, padding: 8, background: '#f5ede4', borderRadius: 8, color: '#6B2A1E' }}>{d}</div>
              ))}
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} style={{ textAlign: 'center', padding: 8 }}></div>
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const d = i + 1;
                const dateStr = formatDate(d, month, year);
                const record = data.find(r => r.date === dateStr);
                return (
                  <div key={d} style={{ textAlign: 'center', padding: 8, background: '#faf6f0', borderRadius: 8, border: '1px solid #eee' }}>
                    <div style={{ fontWeight: 700 }}>{d}</div>
                    <div style={{ fontSize: '0.6rem', color: '#5A4A3A' }}>{record ? record.tithi : '--'}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
