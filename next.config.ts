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
    ],
    // Permettre les data URLs (base64) pour les images uploadées
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    // Autoriser les data URLs
    unoptimized: false,
    formats: ['image/webp'],
  },
  // Optimize for header size issues
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },
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
