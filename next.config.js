/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    // Ensure Puppeteer/Chromium binaries are server-only
    config.externals = config.externals || []
    config.externals.push('@sparticuz/chromium')
    return config
  }
}

module.exports = nextConfig
