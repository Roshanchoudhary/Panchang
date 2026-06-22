const SHEET_ID = '1EQ1kskWtlxFGGY8Ct0QjRyfrTWEjnwTV8ZfIJrCeLSE';
const SHEET_NAME = 'data';

export async function fetchPanchangData() {
  try {
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${SHEET_NAME}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Network response was not ok');
    const csvText = await response.text();
    const rows = csvText.split('\n').filter(row => row.trim() !== '');
    if (rows.length < 2) throw new Error('No data found');
    const headers = rows[0].split(',').map(h => h.replace(/^"|"$/g, '').trim());
    const result = [];
    for (let i = 1; i < rows.length; i++) {
      const values = rows[i].split(',').map(v => v.replace(/^"|"$/g, '').trim());
      const obj = {};
      headers.forEach((header, idx) => {
        obj[header] = values[idx] || '';
      });
      obj.date = obj.दिनांक || obj.date || '';
      obj.day = obj.दिन || obj.day || '';
      obj.month = obj.महीना || obj.month || '';
      obj.paksh = obj.पक्ष || obj.paksh || '';
      obj.tithi = obj.तिथि || obj.tithi || '';
      obj.sunrise = obj.सूर्योदय || obj.sunrise || '';
      obj.sunset = obj.सूर्यास्त || obj.sunset || '';
      if (obj.date && obj.date !== '') result.push(obj);
    }
    return result;
  } catch (error) {
    console.error('❌ Google Sheet Error:', error);
    return null;
  }
}
