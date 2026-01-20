import { Header } from '@/shared/components/layout/server/Header';
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'WordBeetle',
  description: 'あなたの語学学習をサポート',
  icons: {
    icon: '/logo.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className={`font-sans antialiased`}>
        <Header />
        {children}
      </body>
    </html>
  );
}
