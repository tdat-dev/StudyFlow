/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Tắt Strict Mode để tránh double rendering
  swcMinify: true,
  output: 'export', // Enable static HTML export
  trailingSlash: true, // Add trailing slash for better compatibility
  images: {
    unoptimized: true // Disable image optimization for static export
  },

  // Cải thiện Fast Refresh
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },

  experimental: {
    optimizePackageImports: ["lucide-react"],
    esmExternals: "loose",
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
        moduleIds: "named",
        chunkIds: "named",
      };
    }
    return config;
  },
};

module.exports = nextConfig;
