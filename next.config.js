/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    // Các tính năng thử nghiệm hợp lệ
    optimizePackageImports: ['lucide-react'],
  },
  webpack: (config, { isServer, dev }) => {
    // Cấu hình webpack để hỗ trợ Fast Refresh tốt hơn
    if (dev && !isServer) {
      // Chỉ áp dụng cho môi trường phát triển ở phía client
      config.experiments = {
        ...config.experiments,
        topLevelAwait: true,
      };
    }
    return config;
  },
}

module.exports = nextConfig 