import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Use default distDir ('.next') to avoid runtime path issues with manifests
  images: {
    domains: [
      'img.clerk.com',
      'images.clerk.dev',
      'images.unsplash.com',
      'image.mux.com',
      'localhost'
    ],
  },
  async headers() {
    return [
      // 🌐 CROSS-DOMAIN EMBED ROUTES - Global embed
      {
        source: '/embed/:videoId*',
        headers: [
          { key: 'X-Frame-Options', value: 'ALLOWALL' },
          { key: 'Content-Security-Policy', value: "frame-ancestors *; default-src * data: blob:; script-src * 'unsafe-inline' 'unsafe-eval'; style-src * 'unsafe-inline';" },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, OPTIONS, HEAD' },
          { key: 'Access-Control-Allow-Headers', value: '*' },
          { key: 'Access-Control-Allow-Credentials', value: 'false' },
          // ULTRA AGGRESSIVE ANTI-CACHE HEADERS
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate, proxy-revalidate, no-transform, private, max-age=0' },
          { key: 'Pragma', value: 'no-cache' },
          { key: 'Expires', value: '0' },
          { key: 'Surrogate-Control', value: 'no-store' },
          { key: 'Vary', value: 'Origin, Referer, Host' },
          { key: 'X-Accel-Expires', value: '0' },
          { key: 'X-Cache-Status', value: 'BYPASS' },
          { key: 'X-Embed-Config', value: 'cross-domain' },
          { key: 'X-Cross-Domain-Ready', value: 'true' },
        ],
      },
      // 🌐 CROSS-DOMAIN EMBED ROUTES - Tenant-specific
      {
        source: '/:tenantId/embed/:videoId*',
        headers: [
          { key: 'X-Frame-Options', value: 'ALLOWALL' },
          { key: 'Content-Security-Policy', value: "frame-ancestors *; default-src * data: blob:; script-src * 'unsafe-inline' 'unsafe-eval'; style-src * 'unsafe-inline';" },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, OPTIONS, HEAD' },
          { key: 'Access-Control-Allow-Headers', value: '*' },
          { key: 'Access-Control-Allow-Credentials', value: 'false' },
          // ULTRA AGGRESSIVE ANTI-CACHE HEADERS
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate, proxy-revalidate, no-transform, private, max-age=0' },
          { key: 'Pragma', value: 'no-cache' },
          { key: 'Expires', value: '0' },
          { key: 'Surrogate-Control', value: 'no-store' },
          { key: 'Vary', value: 'Origin, Referer, Host' },
          { key: 'X-Accel-Expires', value: '0' },
          { key: 'X-Cache-Status', value: 'BYPASS' },
          { key: 'X-Embed-Config', value: 'cross-domain-tenant' },
          { key: 'X-Cross-Domain-Ready', value: 'true' },
        ],
      },
      // 🌐 CROSS-DOMAIN EMBED ROUTES - Videos embed
      {
        source: '/videos/embed/:uid*',
        headers: [
          { key: 'X-Frame-Options', value: 'ALLOWALL' },
          { key: 'Content-Security-Policy', value: "frame-ancestors *; default-src * data: blob:; script-src * 'unsafe-inline' 'unsafe-eval'; style-src * 'unsafe-inline';" },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, OPTIONS, HEAD' },
          { key: 'Access-Control-Allow-Headers', value: '*' },
          { key: 'Access-Control-Allow-Credentials', value: 'false' },
          // ULTRA AGGRESSIVE ANTI-CACHE HEADERS
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate, proxy-revalidate, no-transform, private, max-age=0' },
          { key: 'Pragma', value: 'no-cache' },
          { key: 'Expires', value: '0' },
          { key: 'Surrogate-Control', value: 'no-store' },
          { key: 'Vary', value: 'Origin, Referer, Host' },
          { key: 'X-Accel-Expires', value: '0' },
          { key: 'X-Cache-Status', value: 'BYPASS' },
          { key: 'X-Embed-Config', value: 'videos-embed' },
          { key: 'X-Cross-Domain-Ready', value: 'true' },
        ],
      },
      // FORCE NO CACHE for any test files
      {
        source: '/test-:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
          { key: 'Pragma', value: 'no-cache' },
          { key: 'Expires', value: '0' },
          { key: 'X-Frame-Options', value: 'ALLOWALL' },
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
