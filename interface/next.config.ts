import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
          // Thêm các headers bảo mật khác nếu cần
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ],
      },
    ];
  },
  // Các cấu hình khác có thể thêm ở đây
  reactStrictMode: true,
  productionBrowserSourceMaps: false, // Tắt source map production để bảo mật
};

export default nextConfig;