import { NextResponse, NextRequest } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { isEmbedRoute } from "@/lib/utils";

// Public routes that don't require authentication
const publicRoutes = [
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
  '/videos/embed/(.*)', // Videos embed routes
];

function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some(route => {
    const regex = new RegExp(`^${route.replace(/\*/g, '.*')}$`);
    return regex.test(pathname);
  });
}

// Helper function to extract organization ID from URL
function extractOrgId(pathname: string): string | null {
  const segments = pathname.split('/');
  const orgSegment = segments[1]; // First segment after /
  
  console.log('🔍 Extracting org ID from pathname:', pathname, 'orgSegment:', orgSegment);
  
  // Check if it's a valid organization ID (Clerk org IDs are typically long strings)
  if (orgSegment && orgSegment.length > 10) {
    return orgSegment;
  }
  
  return null;
}

// Helper function to check if route requires organization context
function isOrgRoute(pathname: string): boolean {
  const orgId = extractOrgId(pathname);
  return !!orgId;
}

export default function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const host = req.headers.get('host') || '';
  const referer = req.headers.get('referer') || '';
  const searchParams = req.nextUrl.searchParams;
  
  // 🎯 CROSS-DOMAIN DETECTION
  const isCrossDomain = referer && !referer.includes(host);
  const isIframeRequest = req.headers.get('sec-fetch-dest') === 'iframe' || 
                         req.headers.get('sec-fetch-mode') === 'navigate';
  const isEmbedRequest = isEmbedRoute(pathname);
  
  // 🎯 IMMEDIATE BYPASS for embed routes OR cross-domain iframe requests OR clerk handshake
  if (isEmbedRequest || (isCrossDomain && isIframeRequest) || searchParams.has('__clerk_handshake')) {
    console.log('🚀 CROSS-DOMAIN EMBED BYPASS:', {
      reason: isEmbedRequest ? 'embed-route' : (isCrossDomain && isIframeRequest) ? 'cross-domain-iframe' : 'clerk-handshake',
      pathname,
      referer: referer.substring(0, 50),
      host,
      hasClerkHandshake: searchParams.has('__clerk_handshake')
    });
    
    const response = NextResponse.next();
    
    // 🌐 CROSS-DOMAIN HEADERS - Ultra permissive
    response.headers.set('X-Frame-Options', 'ALLOWALL');
    response.headers.set('Content-Security-Policy', 'frame-ancestors *; default-src * data: blob:; script-src * \'unsafe-inline\' \'unsafe-eval\'; style-src * \'unsafe-inline\';');
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, HEAD');
    response.headers.set('Access-Control-Allow-Headers', '*');
    response.headers.set('Access-Control-Allow-Credentials', 'false');
    
    // 🔄 ANTI-CACHE headers
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('Vary', 'Origin, Referer');
    
    // 🏷️ DEBUG headers
    response.headers.set('X-Cross-Domain-Bypass', 'true');
    response.headers.set('X-Embed-Host', host);
    response.headers.set('X-Embed-Referer', referer.substring(0, 100));
    response.headers.set('X-Embed-Version', '4.0-CROSS-DOMAIN');
    response.headers.set('X-Clerk-Bypass', searchParams.has('__clerk_handshake') ? 'handshake-detected' : 'none');
    
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

  // BYPASS for videos embed routes
  if (pathname.startsWith('/videos/embed/')) {
    console.log('🎯 VIDEOS EMBED BYPASS for:', pathname);
    const response = NextResponse.next();
    response.headers.set('X-Frame-Options', 'ALLOWALL');
    response.headers.set('Content-Security-Policy', 'frame-ancestors *; default-src * data: blob:; script-src * \'unsafe-inline\' \'unsafe-eval\'; style-src * \'unsafe-inline\';');
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, HEAD');
    response.headers.set('Access-Control-Allow-Headers', '*');
    response.headers.set('Access-Control-Allow-Credentials', 'false');
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('X-Videos-Embed-Bypass', 'true');
    return response;
  }
  
  // Allow public routes
  if (isPublicRoute(pathname)) {
    console.log('📋 PUBLIC ROUTE:', pathname);
    return NextResponse.next();
  }
  
  // Check if route requires organization context
  if (isOrgRoute(pathname)) {
    const orgId = extractOrgId(pathname);
    
    if (orgId) {
      // Add organization context to headers
      const requestHeaders = new Headers(req.headers);
      requestHeaders.set('x-organization-id', orgId.replace('org_', ''));
      
      console.log('✅ ORGANIZATION CONTEXT SET:', orgId);
      
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }
  }
  
  // For all other routes, let the page handle authentication
  console.log('🔒 PROTECTED ROUTE:', pathname);
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};