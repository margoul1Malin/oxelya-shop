import { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'Oxelya Shop - Produits',
  description: 'Produits',
  openGraph: {
    images: [
      {
        url: '/favicon.ico',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Oxelya Shop - Produits',
    description: 'Produits',
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
  applicationName: 'Oxelya Shop - Produits',
  appleWebApp: {
    title: 'Oxelya Produits',
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

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}