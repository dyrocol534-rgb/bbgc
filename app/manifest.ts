import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'Bluebuff Games';
  return {
    id: '/?source=pwa',
    name: siteName,
    short_name: siteName.split(' ')[0],
    description: `Play 1000+ free online games instantly – no download, no login! ${siteName} works on PC, mobile & tablet.`,
    start_url: '/?source=pwa',
    scope: '/',
    display: 'standalone',
    orientation: 'any',
    background_color: '#09090b',
    theme_color: '#09090b',
    categories: ['games', 'entertainment'],
    lang: 'en',
    icons: [
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-maskable-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-maskable-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    shortcuts: [
      {
        name: 'Search Games',
        short_name: 'Search',
        description: 'Quickly search 1000+ online games',
        url: '/search',
        icons: [{ src: '/icons/icon-192x192.png', sizes: '192x192' }],
      },
      {
        name: 'Leaderboard',
        short_name: 'Leaderboard',
        description: 'Check top players and rankings',
        url: '/leaderboard',
        icons: [{ src: '/icons/icon-192x192.png', sizes: '192x192' }],
      },
      {
        name: 'Daily Rewards',
        short_name: 'Rewards',
        description: 'Claim daily XP and check streaks',
        url: '/rewards',
        icons: [{ src: '/icons/icon-192x192.png', sizes: '192x192' }],
      },
      {
        name: 'My Profile',
        short_name: 'Profile',
        description: 'View favorites and recently played games',
        url: '/profile',
        icons: [{ src: '/icons/icon-192x192.png', sizes: '192x192' }],
      },
    ],
    screenshots: [
      {
        src: '/screenshots/desktop.png',
        sizes: '1280x720',
        type: 'image/png',
        form_factor: 'wide',
        label: `${siteName} Desktop Experience`,
      },
      {
        src: '/screenshots/mobile.png',
        sizes: '750x1334',
        type: 'image/png',
        form_factor: 'narrow',
        label: `${siteName} Mobile Experience`,
      },
    ],
  };
}
