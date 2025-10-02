import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  images:{
    domains : ["avatars.githubusercontent.com"]
  },
  eslint: {
    // ⚠️ Ignore ESLint errors during builds
    ignoreDuringBuilds: true,
  },

};



export default nextConfig;
