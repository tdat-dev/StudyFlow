/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  reactStrictMode: false, // Tắt Strict Mode để tránh double rendering
  output: 'export', // Enable static HTML export
  trailingSlash: true, // Add trailing slash for better compatibility

  // SVG handling moved to webpack config

  // ESLint configuration
  eslint: {
    ignoreDuringBuilds: false,
    dirs: ['src'],
  },

  images: {
    unoptimized: true, // Disable image optimization for static export
    domains: [
      'lh3.googleusercontent.com',
      'platform-lookaside.fbsbx.com',
      'graph.facebook.com',
      'avatars.githubusercontent.com',
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  // Cải thiện Fast Refresh
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },

  experimental: {
    optimizePackageImports: ['lucide-react'],
  },

  // Webpack configuration for Three.js and optimizations
  webpack: (config, { isServer, dev }) => {
    // Path aliases
    config.resolve.alias['@'] = path.join(__dirname, 'src');

    // Handle Three.js modules
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
    };

    // Don't externalize Three.js - let it be bundled

    if (dev && !isServer) {
      // Cải thiện Fast Refresh performance
      config.optimization = {
        ...config.optimization,
        moduleIds: 'named',
        chunkIds: 'named',
      };
    }
    return config;
  },
};

module.exports = nextConfig;
