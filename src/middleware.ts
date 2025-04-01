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
  '/api/public/(.*)'
]);

// Organization routes with different access levels
const isOrgRoute = createRouteMatcher([
  '/([^/]+)/dashboard',
  '/([^/]+)/products',
  '/([^/]+)/settings'
]);

const isOrgAdminRoute = createRouteMatcher([
  '/([^/]+)/members',
  '/([^/]+)/billing',
  '/([^/]+)/settings/advanced'
]);

const isOrgOwnerRoute = createRouteMatcher([
  '/([^/]+)/danger-zone',
  '/([^/]+)/delete'
]);

export default clerkMiddleware(async (auth, req) => {
  // Allow public routes
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // Get organization ID from URL - first path segment after the domain
  const pathSegments = req.nextUrl.pathname.split('/').filter(Boolean);
  const tenantId = pathSegments.length > 0 ? pathSegments[0] : null;

  // Handle organization routes
  if (isOrgRoute(req)) {
    // Basic member access
    await auth.protect();
    
    if (tenantId) {
      // Add organization context to headers
      const requestHeaders = new Headers(req.headers);
      requestHeaders.set('x-organization-id', tenantId);
      
      return NextResponse.next({
        request: { headers: requestHeaders }
      });
    }
  }

  // Handle admin routes
  if (isOrgAdminRoute(req)) {
    await auth.protect((has) => {
      return has({ permission: 'org:admin' }) || 
             has({ permission: 'org:owner' });
    });
    
    if (tenantId) {
      // Add organization context to headers
      const requestHeaders = new Headers(req.headers);
      requestHeaders.set('x-organization-id', tenantId);
      
      return NextResponse.next({
        request: { headers: requestHeaders }
      });
    }
  }

  // Handle owner-only routes
  if (isOrgOwnerRoute(req)) {
    await auth.protect((has) => has({ permission: 'org:owner' }));
    
    if (tenantId) {
      // Add organization context to headers
      const requestHeaders = new Headers(req.headers);
      requestHeaders.set('x-organization-id', tenantId);
      
      return NextResponse.next({
        request: { headers: requestHeaders }
      });
    }
  }

  // If no organization in path but user is authenticated
  if (!tenantId && !isPublicRoute(req)) {
    await auth.protect();
    return NextResponse.redirect(new URL('/organization-selector', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};