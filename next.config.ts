import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  
  // Set build output directory to 'build' for deployment compatibility
  distDir: 'build',
  
  // Configure image domains
  images: {
    domains: [
      'img.clerk.com',  // Allow images from Clerk
      'images.clerk.dev', // Alternative Clerk image domain
      'images.unsplash.com', // Allow images from Unsplash
      'image.mux.com' // Allow images from Mux
    ],
  },
};

export default nextConfig;
