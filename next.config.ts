import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 86400, // Cache optimized thumbnails for 24h
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Allow thumbnails from GameMonetize, GameDistribution, Unsplash, etc.
      },
      {
        protocol: 'http',
        hostname: '**',
      }
    ],
  },
  devIndicators: false,
  experimental: {
    optimizeCss: true,
  },
  async headers() {
    return [
      {
        source: '/.well-known/assetlinks.json',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/json',
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
