import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Tắt kiểm tra kiểu (bỏ qua lỗi TS khi build)
  typescript: {
    ignoreBuildErrors: true,
  },

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
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'none'",
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },

  reactStrictMode: true,
  productionBrowserSourceMaps: false,

  experimental: {
    typedRoutes: false,
  },
};

export default nextConfig;
