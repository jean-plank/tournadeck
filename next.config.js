const url = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_POCKET_BASE_URL ?? '')
  } catch (e) {
    return undefined
  }
})()

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
  images: {
    remotePatterns: [
      url !== undefined
        ? {
            protocol: url.protocol.slice(0, -1),
            hostname: url.hostname,
            port: url.port,
          }
        : undefined,
      {
        protocol: 'https',
        hostname: 'ddragon.leagueoflegends.com',
      },
      {
        protocol: 'https',
        hostname: 'raw.communitydragon.org',
      },
    ].filter(p => p !== undefined),
  },
}

module.exports = nextConfig
