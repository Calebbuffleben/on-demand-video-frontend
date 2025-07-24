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
  const userAgent = req.headers.get('user-agent') || '';
  const isInIframe = req.headers.get('sec-fetch-dest') === 'iframe' || 
                     req.headers.get('sec-fetch-mode') === 'navigate';
  
  // BYPASS IMMEDIATELY for API embed routes
  if (pathname.startsWith('/api/embed/')) {
    console.log('🎯 API EMBED BYPASS for:', pathname);
    const response = NextResponse.next();
    response.headers.set('X-Frame-Options', 'ALLOWALL');
    response.headers.set('Content-Security-Policy', 'frame-ancestors *;');
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('X-API-Embed-Bypass', 'true');
    return response;
  }
  
  // AGGRESSIVE DEBUG LOGGING for non-API routes
  console.log('🔥 MIDDLEWARE DEBUG:', {
    pathname,
    isEmbedRoute: isEmbedRoute(pathname),
    isInIframe,
    userAgent: userAgent.substring(0, 50) + '...',
    isAPI: pathname.startsWith('/api/'),
  });
  
  // FORCE BYPASS for ANY embed route - MOST AGGRESSIVE APPROACH
  if (isEmbedRoute(pathname)) {
    console.log('🚀 FORCING EMBED BYPASS for:', pathname);
    
    const response = NextResponse.next();
    
    // ULTRA AGGRESSIVE HEADERS for iframe compatibility and cache busting
    response.headers.delete('X-Frame-Options'); // Remove any existing
    response.headers.set('X-Frame-Options', 'ALLOWALL');
    response.headers.set('Content-Security-Policy', 'frame-ancestors *; default-src *; script-src * \'unsafe-inline\' \'unsafe-eval\'; style-src * \'unsafe-inline\';');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'no-referrer-when-downgrade');
    
    // ULTRA AGGRESSIVE ANTI-CACHE headers
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate, proxy-revalidate, no-transform, private, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('Surrogate-Control', 'no-store');
    response.headers.set('Vary', '*');
    response.headers.set('Last-Modified', new Date().toUTCString());
    response.headers.set('ETag', `"${Date.now()}"`);
    
    // FORCE REVALIDATION
    response.headers.set('X-Accel-Expires', '0');
    response.headers.set('X-Served-By', 'embed-middleware');
    response.headers.set('X-Cache-Status', 'BYPASS');
    response.headers.set('X-Timestamp', Date.now().toString());
    
    // Custom header to indicate this is an embed bypass
    response.headers.set('X-Embed-Bypass', 'true');
    response.headers.set('X-Embed-Version', '2.0');
    
    console.log('✅ EMBED BYPASS APPLIED with headers:', Object.fromEntries(response.headers.entries()));
    
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
    // Include API routes but they will be bypassed above if they are embed routes
    "/((?!.+\\.[\\w]+$|_next|favicon.ico).*)",
    "/",
    "/(api|trpc)(.*)",
  ],
};