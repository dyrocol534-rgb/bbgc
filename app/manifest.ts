import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'Bluebuff Games';
  return {
    name: siteName,
    short_name: siteName.split(' ')[0],
    description: `Play 1000+ free online games instantly – no download, no login! ${siteName} works on PC, mobile & tablet.`,
    start_url: '/',
    display: 'standalone',
    background_color: '#09090b',
    theme_color: '#6c40ff',
    categories: ['games', 'entertainment'],
    lang: 'en',
    icons: [
      {
        src: '/logo.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/logo.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
