import { verifyRequest } from "@/lib/shopify/verify";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Skip middleware for API routes, static files, and auth routes
    if (
        pathname.startsWith('/api/') ||
        pathname.startsWith('/_next/') ||
        pathname.startsWith('/auth') ||
        pathname.includes('.')
    ) {
        return NextResponse.next();
    }

    // Protected routes that require session validation
    const protectedRoutes = [
        '/dashboard',
        '/bundles',
        '/analytics',
        '/ab-testing',
        '/automation',
        '/pricing-rules',
        '/customers',
        '/templates',
        '/integrations',
        '/settings'
    ];

    const isProtectedRoute = protectedRoutes.some(route =>
        pathname.startsWith(route) || pathname === '/'
    );

    if (isProtectedRoute) {
        try {
            // Check for session token in headers or search params
            const authorization = request.headers.get("authorization");
            const sessionToken = request.nextUrl.searchParams.get("session");

            if (!authorization && !sessionToken) {
                // Redirect to Shopify auth if no session
                return NextResponse.redirect(new URL('/api/auth', request.url));
            }

            // Verify the session if we have a token
            if (authorization) {
                await verifyRequest(request, false);
            }

        } catch (error) {
            console.error("Session validation failed:", error);
            return NextResponse.redirect(new URL('/api/auth', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - api routes
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (public folder)
         */
        "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
    ],
};