import { NextResponse } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

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
  '/embed/(.*)', // All embed routes are public
  '/([^/]+)/embed/(.*)' // Legacy embed routes
]);

export default clerkMiddleware(async (auth, req) => {
  // Completely bypass Clerk for embed routes
  if (req.nextUrl.pathname.includes('/embed/')) {
    const response = NextResponse.next();
    
    // Add headers to allow iframe embedding from any domain
    response.headers.set('X-Frame-Options', 'ALLOWALL');
    response.headers.set('Content-Security-Policy', "frame-ancestors *;");
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    // Remove ALL Clerk-related cookies for embed routes
    response.cookies.delete('__session');
    response.cookies.delete('__client_uat');
    response.cookies.delete('__clerk_db_jwt');
    response.cookies.delete('__clerk_session');
    response.cookies.delete('__clerk_session_jwt');
    response.cookies.delete('__clerk_session_jwt_payload');
    response.cookies.delete('__clerk_session_jwt_signature');
    response.cookies.delete('__clerk_session_jwt_header');
    response.cookies.delete('__clerk_session_jwt_payload_signature');
    response.cookies.delete('__clerk_session_jwt_payload_header');
    response.cookies.delete('__clerk_session_jwt_payload_signature_header');
    
    // Add headers to prevent Clerk from interfering
    response.headers.set('X-Clerk-Bypass', 'true');
    response.headers.set('X-Embed-Route', 'true');
    
    return response;
  }

  // Allow other public routes
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // For all other routes, require authentication
  await auth.protect();
  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!.+\\.[\\w]+$|_next).*)",
    "/",
    "/(api|trpc)(.*)",
  ],
};