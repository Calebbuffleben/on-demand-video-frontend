import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  distDir: 'build',
  images: {
    domains: [
      'img.clerk.com',
      'images.clerk.dev',
      'images.unsplash.com',
      'image.mux.com'
    ],
  },
  async headers() {
    return [
      {
        source: '/embed/:videoId*',
        headers: [
          { key: 'X-Frame-Options', value: 'ALLOWALL' },
          { key: 'Content-Security-Policy', value: "frame-ancestors *;" },
          // ULTRA AGGRESSIVE ANTI-CACHE HEADERS
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate, proxy-revalidate, no-transform, private, max-age=0' },
          { key: 'Pragma', value: 'no-cache' },
          { key: 'Expires', value: '0' },
          { key: 'Surrogate-Control', value: 'no-store' },
          { key: 'Vary', value: '*' },
          { key: 'X-Accel-Expires', value: '0' },
          { key: 'X-Cache-Status', value: 'BYPASS' },
          { key: 'X-Embed-Config', value: 'nocache' },
        ],
      },
      {
        source: '/:tenantId/embed/:videoId*',
        headers: [
          { key: 'X-Frame-Options', value: 'ALLOWALL' },
          { key: 'Content-Security-Policy', value: "frame-ancestors *;" },
          // ULTRA AGGRESSIVE ANTI-CACHE HEADERS
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate, proxy-revalidate, no-transform, private, max-age=0' },
          { key: 'Pragma', value: 'no-cache' },
          { key: 'Expires', value: '0' },
          { key: 'Surrogate-Control', value: 'no-store' },
          { key: 'Vary', value: '*' },
          { key: 'X-Accel-Expires', value: '0' },
          { key: 'X-Cache-Status', value: 'BYPASS' },
          { key: 'X-Embed-Config', value: 'nocache' },
        ],
      },
      // FORCE NO CACHE for any test files
      {
        source: '/test-:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
          { key: 'Pragma', value: 'no-cache' },
          { key: 'Expires', value: '0' },
        ],
      },
    ];
  },
  // DISABLE caching for embed routes in development
  ...(process.env.NODE_ENV === 'development' && {
    onDemandEntries: {
      // period (in ms) where the server will keep pages in the buffer
      maxInactiveAge: 25 * 1000,
      // number of pages that should be kept simultaneously without being disposed
      pagesBufferLength: 2,
    },
    generateEtags: false,
  }),
};

export default nextConfig;
