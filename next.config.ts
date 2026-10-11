import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // PostHog přes vlastní doménu, ať ho blokátory reklam nezahodí
  async rewrites() {
    return [
      { source: "/ingest/static/:path*", destination: "https://eu-assets.i.posthog.com/static/:path*" },
      { source: "/ingest/:path*", destination: "https://eu.i.posthog.com/:path*" },
    ];
  },
  skipTrailingSlashRedirect: true,
};

export default nextConfig;
