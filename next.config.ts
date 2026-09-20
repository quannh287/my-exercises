import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [new URL("https://static.exercisedb.dev/media/**")],
  },
};

export default nextConfig;
