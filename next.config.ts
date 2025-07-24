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

  // Configure headers to allow iframe embedding
  async headers() {
    return [
      {
        // Apply to new embed routes
        source: '/embed/:videoId',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'ALLOWALL',
          },
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors *;",
          },
        ],
      },
      {
        // Apply to legacy embed routes for backward compatibility
        source: '/:orgId/embed/:videoId',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'ALLOWALL',
          },
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors *;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
