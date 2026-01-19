/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    runtime: "nodejs"
  },
  turbopack: {} // disable warnings
}

module.exports = nextConfig;
