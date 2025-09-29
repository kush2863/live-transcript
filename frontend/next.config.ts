import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Skip ESLint errors during production builds (still runnable via npm run lint)
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
