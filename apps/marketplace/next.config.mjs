/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@cemvp/auth-ui"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
