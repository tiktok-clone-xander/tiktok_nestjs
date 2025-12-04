/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  productionBrowserSourceMaps: false,

  // Optimize module imports to reduce bundle size
  modularizeImports: {
    'react-icons': {
      transform: 'react-icons/{{member}}',
    },
    lodash: {
      transform: 'lodash/{{member}}',
    },
  },

  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
  },

  // Optimize build performance
  experimental: {
    optimizePackageImports: ['react-icons', 'lucide-react', '@heroicons/react'],
  },

  serverExternalPackages: ['canvas'],

  // Turbopack configuration for Next.js 16
  turbopack: {
    rules: {
      '*.node': {
        loaders: ['raw-loader'],
        as: '*.js',
      },
    },
    resolveAlias: {
      canvas: './empty-module.js',
    },
  },

  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '4000',
        pathname: '/uploads/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  outputFileTracingRoot: __dirname,
}

module.exports = nextConfig
