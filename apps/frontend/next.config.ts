import type { NextConfig } from 'next'

const apiUrl = process.env.API_URL ?? 'http://localhost:3000'

const nextConfig: NextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  transpilePackages: ['@npi/contracts'],
  rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/api/:path*`,
      },
    ]
  },
}

export default nextConfig
