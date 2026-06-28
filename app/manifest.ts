import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Bluebuff Games',
    short_name: 'Bluebuff',
    description: 'Play the best free online HTML5 and Unity WebGL games directly in your browser. No downloads, instant play!',
    start_url: '/',
    display: 'standalone',
    background_color: '#09090b',
    theme_color: '#6c40ff',
    icons: [
      {
        src: '/logo.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/logo.png',
        sizes: '512x512',
        type: 'image/png',
      }
    ],
  };
}
