/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    appDir: true, // Enables the /app directory
  },
  swcMinify: true, // Fast minification
};

module.exports = nextConfig;
