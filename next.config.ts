import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'www.heinekenafrica.com' },
      { protocol: 'https', hostname: 'www.heinekenrussia.com' },
      { protocol: 'https', hostname: 'www.skol.rw' },
      { protocol: 'https', hostname: 'inyangeindustries.com' },
    ],
  },
};

export default nextConfig;
