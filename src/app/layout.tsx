import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import TrackingScripts from '@/components/TrackingScripts';
import CookieConsentBanner from '@/components/CookieConsentBanner';
import WhatsAppWidget from '@/components/WhatsAppWidget';
import MaintenanceScreen from '@/components/MaintenanceScreen';
import AttributionTracker from '@/components/AttributionTracker';
import { prisma } from '@/lib/prisma';
import { DEFAULT_SITE_SETTINGS } from '@/lib/settings';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const outfit = Outfit({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-outfit',
});

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mkbloto.com';

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  verification: {
    google: 'xvfBxviX8tw5rzOJuUGr42nw5tqFS9UhDv2v4wESFIc',
    other: {
      'facebook-domain-verification': ['y8azm4d5yzp6lx3g0fmxh4oenaiuft'],
    },
  },
  title: {
    default: 'MKBL Otomotiv | Kepez Showroom & Elektrikli Araçlar',
    template: '%s | MKBL Otomotiv',
  },
  description: 'MKBL Otomotiv Antalya Kepez Showroom. %100 yerli & yenilikçi Karea elektrikli mikro araçlar. Ev tipi 220V prizden şarj, ekonomik şehir ulaşımı, test sürüşü ve yetkili servis randevusu.',
  keywords: [
    'MKBL Otomotiv',
    'Karea Fit',
    'Antalya Elektrikli Araç',
    'Kepez Showroom',
    'Elektrikli Mikro Mobilite',
    'Mini EV',
    'Elektrikli Araba Servis',
    'Test Sürüşü Antalya',
  ],
  authors: [{ name: 'MKBL Otomotiv' }],
  creator: 'MKBL Otomotiv',
  publisher: 'MKBL Otomotiv',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'MKBL Otomotiv | Yeni Nesil Şehir İçi Elektrikli Araçlar',
    description: '%100 Yerli & Yenilikçi Karea Elektrikli Araçlar. Antalya Kepez Showroomumuzda Test Sürüşüne Katılın!',
    url: baseUrl,
    siteName: 'MKBL Otomotiv',
    locale: 'tr_TR',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'MKBL Otomotiv Karea Fit Elektrikli Araç',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MKBL Otomotiv | Elektrikli Araçlar',
    description: '%100 Yerli Karea Elektrikli Araçlar Antalya Kepez Showroomunda!',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = headers();
  const pathname = headersList.get('x-pathname') || '';
  const isAdminRoute = pathname.startsWith('/admin') || pathname.startsWith('/api');

  let isMaintenance = false;
  let settingsData: any = null;

  try {
    settingsData = await prisma.siteSettings.findFirst();
    if (settingsData && settingsData.isMaintenanceMode) {
      isMaintenance = true;
    }
  } catch (e) {
    console.error('Fetch maintenance mode error:', e);
  }

  // IF MAINTENANCE MODE IS ACTIVE AND USER IS VISITING PUBLIC SITE
  if (isMaintenance && !isAdminRoute) {
    const activeSettings = { ...DEFAULT_SITE_SETTINGS, ...(settingsData || {}) };
    return (
      <html lang="tr" className={`dark ${inter.variable} ${outfit.variable}`}>
        <head>
          <title>{activeSettings.maintenanceTitle || 'Sitemiz Bakımdadır'} | MKBL Otomotiv</title>
        </head>
        <body className="bg-[#050A16] text-gray-100 antialiased font-sans">
          <MaintenanceScreen settings={activeSettings} />
        </body>
      </html>
    );
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AutoDealer',
    'name': 'MKBL Otomotiv Antalya Kepez Showroom',
    'image': `${baseUrl}/og-image.jpg`,
    '@id': `${baseUrl}/#showroom`,
    'url': baseUrl,
    'telephone': '+90 242 310 87 15',
    'email': 'info@mkbloto.com',
    'priceRange': '₺₺',
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': 'Altınova Sinan Mah. Serik Cad. No:161 Havalimanı Karşısı',
      'addressLocality': 'Kepez',
      'addressRegion': 'Antalya',
      'postalCode': '07170',
      'addressCountry': 'TR',
    },
    'geo': {
      '@type': 'GeoCoordinates',
      'latitude': 36.9200,
      'longitude': 30.7600,
    },
    'openingHoursSpecification': {
      '@type': 'OpeningHoursSpecification',
      'dayOfWeek': [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
      ],
      'opens': '09:00',
      'closes': '19:00',
    },
  };

  return (
    <html lang="tr" className={`dark ${inter.variable} ${outfit.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <meta name="google-site-verification" content="xvfBxviX8tw5rzOJuUGr42nw5tqFS9UhDv2v4wESFIc" />
        <meta name="facebook-domain-verification" content="y8azm4d5yzp6lx3g0fmxh4oenaiuft" />
        <TrackingScripts />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-[#0B0F17] text-gray-100 antialiased selection:bg-[#00F0FF] selection:text-black">
        <AttributionTracker />
        <div className="flex min-h-screen flex-col justify-between">
          {!isAdminRoute && <Navbar />}
          <main className="flex-grow">{children}</main>
          {!isAdminRoute && <Footer />}
          {!isAdminRoute && <CookieConsentBanner />}
          {!isAdminRoute && <WhatsAppWidget />}
        </div>
      </body>
    </html>
  );
}
