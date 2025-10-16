import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Header from '@/components/Header';
import { Toaster } from 'react-hot-toast';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'StacksHaven - The Ultimate Yield Aggregator on Stacks',
  description: 'Maximize your STX returns with automated yield farming across multiple strategies. Deposit once, allocate smartly, and watch your vault shares grow through transparent, on-chain yield generation.',
  keywords: ['Stacks', 'STX', 'DeFi', 'yield farming', 'yield aggregator', 'Bitcoin', 'smart contracts', 'automated yield'],
  authors: [{ name: 'StacksHaven Team' }],
  creator: 'StacksHaven',
  publisher: 'StacksHaven',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://stackshaven.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'StacksHaven - The Ultimate Yield Aggregator on Stacks',
    description: 'Maximize your STX returns with automated yield farming across multiple strategies.',
    url: 'https://stackshaven.com',
    siteName: 'StacksHaven',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'StacksHaven - Yield Aggregator on Stacks',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'StacksHaven - The Ultimate Yield Aggregator on Stacks',
    description: 'Maximize your STX returns with automated yield farming across multiple strategies.',
    images: ['/og-image.jpg'],
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-indigo-950 text-white">
          <Header />
          <main className=" mx-auto px-4 py-8">
            {children}
          </main>
        </div>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#1e1b4b',
              color: '#fff',
              border: '1px solid rgba(139, 92, 246, 0.3)',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </body>
    </html>
  );
}