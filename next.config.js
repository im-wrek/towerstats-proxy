/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: false
  },
  webpack: (config) => {
    // Puppeteer binary must be externalized
    config.externals = config.externals || []
    config.externals.push('@sparticuz/chromium')
    return config
  }
}

module.exports = nextConfig
