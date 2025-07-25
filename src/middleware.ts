import { NextResponse } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { isEmbedRoute } from "@/lib/utils";

// Public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/test-clerk(.*)',
  '/create-organization(.*)',
  '/organization-profile(.*)',
  '/organization-selector(.*)',
  '/api/public/(.*)',
  '/api/embed/(.*)', // API embed routes
  '/embed/(.*)', // Global embed routes
]);

export default clerkMiddleware(async (auth, req) => {
  const pathname = req.nextUrl.pathname;
  const host = req.headers.get('host') || '';
  const referer = req.headers.get('referer') || '';
  const origin = req.headers.get('origin') || '';

  
  // 🎯 CROSS-DOMAIN DETECTION
  const isCrossDomain = referer && !referer.includes(host);
  const isIframeRequest = req.headers.get('sec-fetch-dest') === 'iframe' || 
                         req.headers.get('sec-fetch-mode') === 'navigate';
  const isEmbedRequest = isEmbedRoute(pathname);
  
  // 🚨 ULTRA DEBUG for cross-domain issues
  console.log('🌐 CROSS-DOMAIN DEBUG:', {
    pathname,
    host,
    referer: referer.substring(0, 100),
    origin,
    isCrossDomain,
    isIframeRequest,
    isEmbedRequest,
    secFetchSite: req.headers.get('sec-fetch-site'),
    secFetchMode: req.headers.get('sec-fetch-mode'),
    secFetchDest: req.headers.get('sec-fetch-dest'),
  });
  
  // 🎯 IMMEDIATE BYPASS for embed routes OR cross-domain iframe requests
  if (isEmbedRequest || (isCrossDomain && isIframeRequest)) {
    console.log('🚀 CROSS-DOMAIN EMBED BYPASS:', {
      reason: isEmbedRequest ? 'embed-route' : 'cross-domain-iframe',
      pathname,
      referer: referer.substring(0, 50),
      host
    });
    
    const response = NextResponse.next();
    
    // 🌐 CROSS-DOMAIN HEADERS - Ultra permissive
    response.headers.set('X-Frame-Options', 'ALLOWALL');
    response.headers.set('Content-Security-Policy', 'frame-ancestors *; default-src * data: blob:; script-src * \'unsafe-inline\' \'unsafe-eval\'; style-src * \'unsafe-inline\';');
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, HEAD');
    response.headers.set('Access-Control-Allow-Headers', '*');
    response.headers.set('Access-Control-Allow-Credentials', 'false'); // Important for cross-domain
    
    // 🔄 ANTI-CACHE headers to prevent domain-specific caching issues
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('Vary', 'Origin, Referer');
    
    // 🏷️ DEBUG headers
    response.headers.set('X-Cross-Domain-Bypass', 'true');
    response.headers.set('X-Embed-Host', host);
    response.headers.set('X-Embed-Referer', referer.substring(0, 100));
    response.headers.set('X-Embed-Version', '4.0-CROSS-DOMAIN');
    
    return response;
  }

  // BYPASS for API embed routes
  if (pathname.startsWith('/api/embed/')) {
    console.log('🎯 API EMBED BYPASS for:', pathname);
    const response = NextResponse.next();
    response.headers.set('X-Frame-Options', 'ALLOWALL');
    response.headers.set('Content-Security-Policy', 'frame-ancestors *;');
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('X-API-Embed-Bypass', 'true');
    return response;
  }

  // Allow other public routes
  if (isPublicRoute(req)) {
    console.log('📋 PUBLIC ROUTE:', pathname);
    return NextResponse.next();
  }

  // For all other routes, require authentication
  console.log('🔒 PROTECTED ROUTE, applying auth:', pathname);
  await auth.protect();
  
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};