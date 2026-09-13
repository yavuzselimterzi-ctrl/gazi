import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'GAZİ Meclis-i Mebusan Portal',
  description: 'Dijital Osmanlı Devlet Portalı',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
