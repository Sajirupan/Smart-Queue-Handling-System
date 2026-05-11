import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import Providers from './Providers';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
});

export const metadata: Metadata = {
  title: 'SmartQueue | Modern Queue Management',
  description: 'The world\'s most advanced digital queue orchestration platform.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <body className="bg-surface-50 text-slate-900 selection:bg-brand-primary/10">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
