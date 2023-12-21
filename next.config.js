const url = new URL(process.env.NEXT_PUBLIC_POCKET_BASE_URL)

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true,
    serverComponentsExternalPackages: ['pino'],
  },
  images: {
    remotePatterns: [
      {
        protocol: url.protocol.slice(0, -1),
        hostname: url.hostname,
        port: url.port,
      },
      {
        protocol: 'https',
        hostname: 'raw.communitydragon.org',
      },
    ],
  },
}

module.exports = nextConfig
