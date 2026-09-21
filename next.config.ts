import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [new URL("https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@*/exercises/**")],
  },
};

export default nextConfig;
