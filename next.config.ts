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
};

export default nextConfig;
