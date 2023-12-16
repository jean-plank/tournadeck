/** @type {import('next').NextConfig} */

const url = new URL(process.env.NEXT_PUBLIC_POCKET_BASE_URL)
console.log(url)
const nextConfig = {
  experimental: {
    typedRoutes: true,
    serverComponentsExternalPackages: ['pino'],
  },
  images: {
    remotePatterns: [
      {
        protocol: url.protocol.slice(0, -1),
        hostname: '127.0.0.1',
        port: url.port,
        pathname: url.pathname,
      },
    ],
  },
}

module.exports = nextConfig
