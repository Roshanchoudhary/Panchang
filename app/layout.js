import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = {
  title: '🕉️ Maithili Panchang - पूर्ण पंचांग',
  description: 'Maithili Panchang - दैनिक, मासिक, मुहूर्त, चैट और बहुत कुछ',
};

export default function RootLayout({ children }) {
  return (
    <html lang="hi">
      <body>
        <Header />
        <main style={{ minHeight: 'calc(100vh - 160px)' }}>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
