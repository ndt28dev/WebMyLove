import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    ignoreDuringBuilds: true, // ⬅️ bỏ qua ESLint trên Vercel/CI
  },
};

export default nextConfig;
