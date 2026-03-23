import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  turbopack: {},
  serverExternalPackages: ['jspdf'],
};

export default nextConfig;
