import { Metadata, Viewport } from 'next';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { CartProvider } from '../components/cart/CartProvider';
import { CartClearListener } from '../components/cart/CartClearListener';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { Inter } from 'next/font/google'
import { AuthProvider } from '../providers/AuthProvider';

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Oxelya Shop',
  description: 'Hardware, Software, Services',
  openGraph: {
    images: [
      {
        url: '/favicon.ico',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Oxelya Shop',
    description: 'Hardware, Software, Services',
    images: ['/favicon.ico'],
  },
  manifest: '/manifest.json',
  alternates: {
    canonical: 'https://oxelya-shop.fr',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  metadataBase: new URL('https://oxelya-shop.fr'),
  applicationName: 'Oxelya Shop',
  appleWebApp: {
    title: 'Oxelya Shop',
    statusBarStyle: 'black-translucent',
  },
  keywords: ['Oxelya', 'Shop', 'Hardware', 'Software', 'Services', 'Dev Web', 'Dev Mobile', 'Dev IA', 'Dev Cloud', 'Dev Sécurité', 'Dev Data', 'Dev Design', 'Dev Marketing', 'Dev SEO', 'Dev SMM', 'Dev Content', 'Dev Copywriting', 'Dev Community', 'Dev Social', 'Dev Community Management', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager', 'Dev Community Manager']
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, 
  themeColor: '#000000',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <AuthProvider>
          <CartProvider>
            <CartClearListener />
            <Navbar />
            <div className="min-h-screen pt-16">
              {children}
            </div>
            <Footer />
          </CartProvider>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
} 