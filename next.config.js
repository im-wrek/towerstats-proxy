/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    appDir: true, // enables /app folder usage
  },
  compiler: {
    styledComponents: false, // no extra UI libraries
  },
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
