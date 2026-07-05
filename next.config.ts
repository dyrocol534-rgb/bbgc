import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
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
