import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }
  return `${remainingSeconds}s`;
}

/**
 * Resolve backend-hosted asset URLs (covers, thumbnails) to absolute URLs.
 */
export function resolveAssetUrl(possiblyRelativeUrl?: string): string {
  if (!possiblyRelativeUrl) return '';
  try {
    if (/^https?:\/\//i.test(possiblyRelativeUrl)) return possiblyRelativeUrl;
    if (possiblyRelativeUrl.startsWith('//')) {
      return `${typeof window !== 'undefined' ? window.location.protocol : 'https:'}${possiblyRelativeUrl}`;
    }
    if (possiblyRelativeUrl.startsWith('/')) {
      const base = (process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || '').replace(/\/api\/?$/, '');
      if (base) return `${base}${possiblyRelativeUrl}`;
      return `http://localhost:4000${possiblyRelativeUrl}`;
    }
    return possiblyRelativeUrl;
  } catch {
    return possiblyRelativeUrl || '';
  }
}

/**
 * Backend base URL (without trailing /api)
 */
export function getBackendBaseUrl(): string {
  const base = (process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000');
  return base.replace(/\/api\/?$/, '');
}

/**
 * Default internal thumbnail URL for a given video id.
 */
export function buildThumbUrl(videoId: string): string {
  if (!videoId) return '';
  const base = getBackendBaseUrl();
  return `${base}/api/videos/thumb/${videoId}/0001.jpg`;
}

/**
 * Checks if a given pathname or URL is an embed route
 * Handles global embed routes (/embed/[videoId]), videos embed routes (/videos/embed/[uid]), and tenant-specific routes ([tenantId]/embed/[videoId])
 */
export function isEmbedRoute(pathname: string): boolean {
  if (!pathname) return false;
  
  // Normalize the pathname by removing query params and hash
  const cleanPath = pathname.split('?')[0].split('#')[0];
  
  // Check for global embed routes: /embed/[videoId]
  if (cleanPath.startsWith('/embed/')) {
    return true;
  }
  
  // Check for videos embed routes: /videos/embed/[uid]
  if (cleanPath.startsWith('/videos/embed/')) {
    return true;
  }
  
  // Check for tenant-specific embed routes: /[tenantId]/embed/[videoId]
  const pathSegments = cleanPath.split('/').filter(Boolean);
  if (pathSegments.length >= 3 && pathSegments[1] === 'embed') {
    return true;
  }
  
  return false;
}

/**
 * Checks if the current request is in an iframe context
 */
export function isInIframe(): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    return window.self !== window.top;
  } catch {
    // If we can't access window.top due to cross-origin restrictions,
    // we're likely in an iframe
    return true;
  }
} 