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
        // Apply to global embed routes
        source: '/embed/:videoId*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'ALLOWALL',
          },
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors *;",
          },
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
        ],
      },
      {
        // Apply to tenant-specific embed routes
        source: '/:tenantId/embed/:videoId*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'ALLOWALL',
          },
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors *;",
          },
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
