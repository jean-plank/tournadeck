/** @type {import('next').NextConfig} */
const nextConfig = {
  logging: {
    fetches: {
      fullUrl: process.env.NODE_ENV !== 'production',
    },
  },
  experimental: {
    typedRoutes: true,
    serverComponentsExternalPackages: ['pino'],
  },
}

module.exports = nextConfig
