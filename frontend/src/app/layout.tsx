import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Kripto Sinyal Analiz Botu | AI Trading Signals',
  description: 'AI destekli kripto para sinyal analiz sistemi. KuCoin API ile gerçek zamanlı piyasa analizi.',
  keywords: 'kripto, bitcoin, ethereum, trading, signals, AI, technical analysis, KuCoin',
  authors: [{ name: 'Analiz Team' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
  openGraph: {
    title: 'Kripto Sinyal Analiz Botu',
    description: 'AI destekli kripto para sinyal analiz sistemi',
    type: 'website',
    locale: 'tr_TR',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className={`${inter.className} bg-gray-900 text-white antialiased`}>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
          <div className="absolute inset-0 bg-crypto-pattern opacity-10"></div>
          <div className="relative z-10">
            {children}
          </div>
        </div>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            className: 'bg-gray-800 text-white border border-gray-700',
          }}
        />
      </body>
    </html>
  );
}
