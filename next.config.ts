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
  experimental: {
    optimizeCss: true,
  },
};

export default nextConfig;
