/* global workbox */
// Service Worker for video caching using Workbox (no credentials, CORS-safe)

// Load Workbox from CDN
importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js');

if (typeof workbox === 'undefined') {
  // Minimal SW to allow registration
  self.addEventListener('install', () => self.skipWaiting());
  self.addEventListener('activate', () => self.clients.claim());
} else {
  workbox.setConfig({ debug: false });
  workbox.core.skipWaiting();
  workbox.core.clientsClaim();
  workbox.core.setCacheNameDetails({ prefix: 'stream', suffix: 'v1' });

  // Support Range requests for <video>
  const rangePlugin = new workbox.rangeRequests.RangeRequestsPlugin();

  // HLS segments (.ts) → Cache First (store full body; serve ranges from cache)
  workbox.routing.registerRoute(
    ({ url }) => url.pathname.includes('/api/videos/stream/') && url.pathname.toLowerCase().endsWith('.ts'),
    new workbox.strategies.CacheFirst({
      cacheName: 'hls-segments',
      plugins: [
        rangePlugin,
        new workbox.cacheableResponse.CacheableResponsePlugin({ statuses: [200] }),
        new workbox.expiration.ExpirationPlugin({ maxEntries: 2000, purgeOnQuotaError: true }),
      ],
    })
  );

  // HLS playlists (.m3u8) → Stale-While-Revalidate
  workbox.routing.registerRoute(
    ({ url }) => url.pathname.includes('/api/videos/stream/') && url.pathname.toLowerCase().endsWith('.m3u8'),
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: 'hls-playlists',
      plugins: [
        new workbox.cacheableResponse.CacheableResponsePlugin({ statuses: [200] }),
        new workbox.expiration.ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 5 * 60, purgeOnQuotaError: true }),
      ],
    })
  );

  // Thumbnails and VTT → SWR (light)
  workbox.routing.registerRoute(
    ({ url }) => url.pathname.includes('/api/videos/stream/') && url.pathname.includes('/thumbs/') && /\.(jpg|jpeg|png|vtt)$/i.test(url.pathname),
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: 'video-thumbs',
      plugins: [
        new workbox.cacheableResponse.CacheableResponsePlugin({ statuses: [200] }),
        new workbox.expiration.ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 24 * 60 * 60, purgeOnQuotaError: true }),
      ],
    })
  );

  // Allow immediate updates
  self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
  });
}


