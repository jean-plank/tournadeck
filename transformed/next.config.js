/** @type {import('next').NextConfig} */
module.exports = {
  typescript: {
    tsconfigPath: './tsconfig.next.json',
  },
  experimental: {
    typedRoutes: true,
  },
}
