import type { NextConfig } from 'next/dist/types.d.ts'

const url = (() => {
  const pocketBaseUrl = process.env['NEXT_PUBLIC_POCKET_BASE_URL']

  if (pocketBaseUrl === undefined) return undefined

  try {
    return new URL(pocketBaseUrl)
  } catch (e) {
    return undefined
  }
})()

const nextConfig: NextConfig = {
  output: 'standalone',
  compress: false,
  poweredByHeader: false,
  logging: {
    fetches: {
      fullUrl: process.env.NODE_ENV !== 'production',
    },
  },
  serverExternalPackages: ['pino'],
  experimental: {
    typedRoutes: true,
    serverActions: {
      bodySizeLimit: '6mb', // TODO: process.env
    },
  },
  images: {
    remotePatterns: [
      ...(url !== undefined
        ? [
            {
              protocol: url.protocol.slice(0, -1) as 'https' | 'http',
              hostname: url.hostname,
              port: url.port,
            },
          ]
        : []),
      {
        protocol: 'https',
        hostname: 'raw.communitydragon.org',
      },
    ],
  },
}

export default nextConfig

//

module.exports = nextConfig
