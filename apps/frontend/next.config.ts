import path from 'node:path'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  transpilePackages: ['@npi/contracts'],
  turbopack: {
    root: path.join(__dirname, '../..'),
  },
}

export default nextConfig
