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
  // Skip all processing for embed routes
  if (req.nextUrl.pathname.includes('/embed/')) {
    return NextResponse.next();
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