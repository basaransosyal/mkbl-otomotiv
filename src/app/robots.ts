import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mkbloto.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/mkbl-kontrol-77/', '/api/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
