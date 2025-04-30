import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  
  // Configure image domains
  images: {
    domains: [
      'img.clerk.com',  // Allow images from Clerk
      'images.clerk.dev', // Alternative Clerk image domain
      'images.unsplash.com' // Allow images from Unsplash
    ],
  },
};

export default nextConfig;
