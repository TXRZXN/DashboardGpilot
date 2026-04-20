/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/gateway/sub/:path*',
        destination: 'http://localhost:8001/api/gateway/sub/:path*',
      },
      {
        source: '/api/gateway/gpilot/:path*',
        destination: 'http://localhost:8000/api/gateway/gpilot/:path*',
      },
    ];
  },
};

export default nextConfig;
