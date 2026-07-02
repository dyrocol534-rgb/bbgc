import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://games.bluebuff.in';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/admin/'], // Hide admin dashboard from search engines
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
