import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuración para PWA y Service Workers
  serverExternalPackages: [],
  
  // Ignorar errores de ESLint durante el build (solo warnings)
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Ignorar errores de TypeScript durante el build
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Headers para Service Worker
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
        ],
      },
    ];
  },

  // Configuración para PWA
  async rewrites() {
    return [
      {
        source: '/sw.js',
        destination: '/api/sw',
      },
    ];
  },
};

export default nextConfig;
