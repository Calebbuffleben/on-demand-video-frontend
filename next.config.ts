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
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type',
          },
          {
            key: 'X-Clerk-Bypass',
            value: 'true',
          },
          {
            key: 'X-Embed-Route',
            value: 'true',
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
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type',
          },
          {
            key: 'X-Clerk-Bypass',
            value: 'true',
          },
          {
            key: 'X-Embed-Route',
            value: 'true',
          },
        ],
      },
    ];
  },

  // Configure webpack to exclude Clerk from embed routes
  webpack: (config, { isServer, dev }) => {
    // Add a plugin to exclude Clerk from embed routes
    if (!isServer) {
      config.plugins.push(
        new (require('webpack').DefinePlugin)({
          'process.env.NEXT_PUBLIC_EMBED_ROUTE': JSON.stringify('true'),
        })
      );
    }
    return config;
  },
};

export default nextConfig;
