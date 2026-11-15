import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

/** Routes only a signed-in consultant may reach. Everything else is public. */
const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

/**
 * Origins allowed to use sessions — rejects tokens issued to any other site.
 * Production only: previews and localhost use the development instance,
 * which serves several different origins.
 */
const appUrl = process.env.NEXT_PUBLIC_APP_URL;
const authorizedParties =
  process.env.VERCEL_ENV === "production" && appUrl ? [appUrl] : undefined;

export default clerkMiddleware(
  async (auth, request) => {
    if (isProtectedRoute(request)) {
      await auth.protect();
    }
  },
  { authorizedParties },
);

export const config = {
  matcher: [
    // Skip Next.js internals and static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
    // Clerk's own frontend API routes
    "/__clerk/(.*)",
  ],
};