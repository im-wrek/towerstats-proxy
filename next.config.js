/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    turbo: false // disables Turbopack for Node runtime + Puppeteer
  },
  typescript: {
    ignoreBuildErrors: false
  },
  eslint: {
    ignoreDuringBuilds: false
  },
  webpack: (config) => {
    // Necessary to allow Puppeteer binaries in serverless
    config.externals = config.externals || []
    config.externals.push('@sparticuz/chromium')
    return config
  }
}

module.exports = nextConfig
