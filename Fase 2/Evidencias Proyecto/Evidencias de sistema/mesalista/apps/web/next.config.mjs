/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'hwscwnnmtoygfndjehjv.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**'
      }
    ]
  }
}

export default nextConfig
