/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    const backendBase = process.env.BACKEND_INTERNAL_URL || 'http://backend:3000';

    return [
      {
        source: '/backend-api/:path*',
        destination: `${backendBase}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
