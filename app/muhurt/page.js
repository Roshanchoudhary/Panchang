'use client';

import { useState, useEffect } from 'react';
import { fetchPanchangData } from '@/lib/googleSheets';
import AuthGuard from '@/components/AuthGuard';

const MUHURT_COLUMNS = [
  'उपनयनक दिन',
  'विवाहक दिन',
  'द्विरागमनक दिन',
  'मुण्डनक दिन',
  'गृहारम्भक दिन',
  'गृहप्रवेशक दिन'
];

const MUHURT_EMOJI = {
  'उपनयनक दिन': '📿',
  'विवाहक दिन': '💍',
  'द्विरागमनक दिन': '🔄',
  'मुण्डनक दिन': '✂️',
  'गृहारम्भक दिन': '🏗️',
  'गृहप्रवेशक दिन': '🏠'
};

export default function Muhurt() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchPanchangData().then((res) => {
      if (res) setData(res);
      setLoading(false);
    });
  }, []);

  const getFilteredData = () => {
    const result = [];
    data.forEach(record => {
      if (filter === 'all') {
        MUHURT_COLUMNS.forEach(col => {
          if (record[col]) {
            result.push({ date: record.date, day: record.day, tithi: record.tithi, muhurt: col, emoji: MUHURT_EMOJI[col] });
          }
        });
      } else {
        if (record[filter]) {
          result.push({ date: record.date, day: record.day, tithi: record.tithi, muhurt: filter, emoji: MUHURT_EMOJI[filter] });
        }
      }
    });
    return result;
  };

  const filteredData = getFilteredData();

  return (
    <AuthGuard>
      <div style={{ maxWidth: 900, margin: '20px auto', padding: '0 16px' }}>
        <h1 style={{ color: '#6B2A1E', marginBottom: 16 }}>🪔 शुभ मुहूर्त</h1>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 20, background: 'white', padding: '14px 20px', borderRadius: 50, boxShadow: '0 4px 15px rgba(0,0,0,0.08)' }}>
          <label style={{ fontWeight: 600 }}>🔍 मुहूर्त चुनें:</label>
          <select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ padding: '6px 16px', border: '2px solid #D4A373', borderRadius: 40, fontSize: '1rem', background: 'white' }}>
            <option value="all">✨ सभी मुहूर्त</option>
            {MUHURT_COLUMNS.map((col) => (
              <option key={col} value={col}>{MUHURT_EMOJI[col]} {col}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>⏳ लोड हो रहा...</div>
        ) : filteredData.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, background: 'white', borderRadius: 16, color: '#c0392b' }}>😔 इस मुहूर्त के लिए कोई तारीख नहीं मिली</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
            {filteredData.map((item, idx) => (
              <div key={idx} style={{ background: 'white', padding: 16, borderRadius: 16, boxShadow: '0 4px 15px rgba(0,0,0,0.08)', borderTop: '4px solid #C68A3C' }}>
                <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#6B2A1E' }}>{item.emoji} {item.date}</div>
                <div style={{ color: '#5A4A3A' }}>📅 {item.day}</div>
                <div style={{ color: '#5A4A3A', fontSize: '0.9rem' }}>🗓️ {item.tithi}</div>
                <div style={{ fontSize: '0.8rem', color: '#C68A3C', fontWeight: 600, marginTop: 4 }}>{item.muhurt}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
