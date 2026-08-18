import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mkbloto.com';

  // Base static routes
  const routes = [
    '',
    '/models',
    '/service',
    '/contact',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  // Fetch dynamic vehicle models for sitemap
  const vehicles = await prisma.vehicle.findMany({
    where: { isPublished: true },
    select: { id: true, updatedAt: true },
  }).catch(() => []);

  const vehicleRoutes = vehicles.map((v) => ({
    url: `${baseUrl}/models/${v.id}`,
    lastModified: v.updatedAt.toISOString(),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  // Fetch published custom pages for sitemap
  const customPages = await prisma.customPage.findMany({
    where: { isPublished: true, isIndexable: true },
    select: { slug: true, path: true, updatedAt: true },
  }).catch(() => []);

  const customPageRoutes = customPages
    .filter((p) => p.path && p.path !== '/' && !p.path.startsWith('/mkbl-kontrol-77'))
    .map((p) => ({
      url: `${baseUrl}${p.path.startsWith('/') ? p.path : `/${p.path}`}`,
      lastModified: p.updatedAt.toISOString(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

  return [...routes, ...vehicleRoutes, ...customPageRoutes];
}
