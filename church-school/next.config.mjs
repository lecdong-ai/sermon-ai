/** @type {import('next').NextConfig} */
const isProd = process.env.VERCEL_ENV === 'production' || process.env.VERCEL === '1'
const nextConfig = {
  basePath: isProd ? '/school' : '',
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
