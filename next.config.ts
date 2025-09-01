import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'tpdjnzkbsqf0k5kz.public.blob.vercel-storage.com',
        port: '',
        pathname: '/**',
      },
    ],
    // Permettre les data URLs (base64) pour les images uploadées
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    // Autoriser les data URLs
    unoptimized: false,
    formats: ['image/webp', 'image/avif'],
    // Optimiser les images locales
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // Optimize for header size issues
  serverExternalPackages: ['@prisma/client'],
  // Add headers configuration to handle large headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ]
  },
};

export default nextConfig;
