/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["sharp"],
  },

  eslint: {
    ignoreDuringBuilds: true, // ✅ Ignore ESLint errors during build
  },

  typescript: {
    ignoreBuildErrors: true, // ✅ Ignore TypeScript errors during build
  },
};

module.exports = nextConfig;