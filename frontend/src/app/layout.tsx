import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Aimpress - Premium AI-Powered n8n Automation Templates',
  description: 'Build AI workflows without code. Premium n8n automation templates by Aimpress LTD. Enterprise-ready solutions with expert support. Pay-as-you-go credits system.',
  keywords: 'n8n, automation, AI workflows, no-code, workflow templates, business automation, Aimpress, ai-impress.com',
  authors: [{ name: 'Aimpress LTD', url: 'https://ai-impress.com' }],
  creator: 'Aimpress LTD',
  publisher: 'Aimpress LTD',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://ai-impress.com',
    siteName: 'Aimpress n8n Marketplace',
    title: 'Aimpress - Premium AI-Powered n8n Automation Templates',
    description: 'Build AI workflows without code. Premium n8n automation templates by Aimpress LTD.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Aimpress - AI-Powered Automation',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Aimpress - Premium AI-Powered n8n Automation Templates',
    description: 'Build AI workflows without code. Premium n8n automation templates by Aimpress LTD.',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#FF6D5A" />
        <meta name="application-name" content="Aimpress Marketplace" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
