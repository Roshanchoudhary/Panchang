export default function Footer() {
  return (
    <footer style={{ background: '#6B2A1E', color: '#ddd', padding: '20px 0', textAlign: 'center', marginTop: 20 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 8 }}>
          <a href="#" style={{ color: 'white', textDecoration: 'none', fontSize: '1.4rem' }}>📘</a>
          <a href="#" style={{ color: 'white', textDecoration: 'none', fontSize: '1.4rem' }}>▶️</a>
          <a href="#" style={{ color: 'white', textDecoration: 'none', fontSize: '1.4rem' }}>📸</a>
        </div>
        <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>© 2026 Maithili Panchang | 🙏 सभी धर्मों का सम्मान</div>
      </div>
    </footer>
  );
}
