/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true
  },
  typescript: {
    ignoreBuildErrors: true
  },
  images: {
    dangerouslyAllowSVG: true,
    domains: [
      'api.sirh.dev-tarmiz.site',
      'sirh.dev-tarmiz.site',
      'flagcdn.com'
    ],
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    unoptimized: process.env.NODE_ENV === 'development',
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'utfs.io',
        port: '',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: 'api.slingacademy.com',
        port: '',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: 'flagcdn.com',
        port: '',
        pathname: '/**'
      }
    ]
  },
  transpilePackages: ['geist']
};

module.exports = nextConfig;
