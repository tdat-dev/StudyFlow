/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  reactStrictMode: false, // Tắt Strict Mode để tránh double rendering
  swcMinify: true,
  output: 'export', // Enable static HTML export
  trailingSlash: true, // Add trailing slash for better compatibility

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

  // Webpack config for path aliases
  webpack: config => {
    config.resolve.alias['@'] = path.join(__dirname, 'src');
    return config;
  },

  // Cải thiện Fast Refresh
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },

  experimental: {
    optimizePackageImports: ['lucide-react'],
    esmExternals: 'loose',
  },

  webpack: (config, { isServer, dev }) => {
    if (dev && !isServer) {
      // Cải thiện Fast Refresh performance
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };

      // Giảm kích thước bundle để Fast Refresh nhanh hơn
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
