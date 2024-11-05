/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: '15mb'
    }
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      // Uncomment and adjust these as needed
      // {
      //   protocol: "https",
      //   hostname: "**.public.blob.vercel-storage.com",
      // },
      // {
      //   protocol: "https",
      //   hostname: "screenshot.openstat.us",
      // },
      // {
      //   protocol: "https",
      //   hostname: "www.openstatus.dev",
      // },
    ]
  }
}

export default nextConfig
