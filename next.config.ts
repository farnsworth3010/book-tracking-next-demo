import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // json-server runs on 3001 (`npm run api`); the app calls /api/* on its own origin, so no CORS
  async rewrites() {
    return [{ source: '/api/:path*', destination: 'http://localhost:3001/:path*' }]
  },
}

export default nextConfig
