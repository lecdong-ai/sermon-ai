/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/school',
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
