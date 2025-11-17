import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://rankup.com';

  // Static pages
  const staticPages = [
    '',
    '/stocklist',
    '/news',
    '/stockboard',
    '/search',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // TODO: Add dynamic pages (posts, news, stocks) from database
  // This would require fetching from the API or database

  return staticPages;
}
