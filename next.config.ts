import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
  reactStrictMode: true,
  reactCompiler: true,
  cacheComponents: true,
  experimental: {
    optimizeCss: true,
    cssChunking: true,
    inlineCss: true,
  },
  poweredByHeader: false,
};

export default nextConfig;
