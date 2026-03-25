import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  devIndicators: {
    appIsrStatus: false,
  },
  turbopack: {}, // Placeholder to allow custom webpack config in Next.js 16
  experimental: {
    serverActions: {
      bodySizeLimit: "52mb", // Allow encrypted evidence up to ~50MB (encryption adds small overhead)
    },
  },
  typescript: {
    ignoreBuildErrors: process.env.NEXT_PUBLIC_IGNORE_BUILD_ERROR === "true",
  },
  webpack: config => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    config.externals.push("pino-pretty", "lokijs", "encoding");
    config.module.exprContextCritical = false;
    return config;
  },
};

const isIpfs = process.env.NEXT_PUBLIC_IPFS_BUILD === "true";

if (isIpfs) {
  nextConfig.output = "export";
  nextConfig.trailingSlash = true;
  nextConfig.images = {
    unoptimized: true,
  };
}

module.exports = nextConfig;
