/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  webpack: (config) => {
    // Cấu hình webpack để hỗ trợ Fast Refresh tốt hơn
    config.experiments = {
      ...config.experiments,
      topLevelAwait: true,
    };
    return config;
  },
}

module.exports = nextConfig 