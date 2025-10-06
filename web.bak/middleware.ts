import { detectShop } from "@/security/shop";
import { addSecurityHeaders } from "@/security/headers";
import { NextRequest, NextResponse } from "next/server";

/**
 * Middleware to add CSP and security headers for Shopify embedded app pages.
 *
 * Skip paths: static assets and API routes do not need CSP headers.
 */
export async function middleware(request: NextRequest) {
    const { pathname, searchParams } = request.nextUrl;

    // Paths to skip for performance because headers are unnecessary
    const skipPaths = [
        "/api/",
        "/_next/",
        "/favicon.ico",
        "/public/",
        "/extensions/",
    ];

    const shop = detectShop(request, searchParams);

    // Dev-only logs for debugging
    if (process.env.NODE_ENV === "development") {
        console.log(`[Middleware][DEV] Detected shop: ${shop}`);
    }

    // Skip adding headers for static assets or API routes
    if (skipPaths.some((p) => pathname.startsWith(p))) {
        return NextResponse.next(); // just continue, no headers
    }

    // Skip for theme extensions (detect by iframe context)
    const referer = request.headers.get("referer");
    const userAgent = request.headers.get("user-agent");
    const secFetchDest = request.headers.get("sec-fetch-dest");

    // Theme extensions run in iframe context
    if (
        secFetchDest === "iframe" ||
        referer?.includes("admin.shopify.com") ||
        referer?.includes("myshopify.com/admin/themes")
    ) {
        return NextResponse.next();
    }

    // For all other pages, add security headers (CSP, etc.)
    return addSecurityHeaders(NextResponse.next(), shop);
}

/**
 * Middleware matcher
 *
 * Applies to all routes except Shopify auth, webhooks,
 * Next.js internals, and static files
 */
export const config = {
    matcher: [
        /*
         * Exceptions:
         * /api/auth, /api/webhooks, /api/proxy_route, /api/gdpr, /_next,
         * /_proxy, /_auth, /_static, /_vercel, /public, /extensions (/favicon.ico, etc)
         */
        "/((?!api/auth|api/webhooks|api/proxy_route|api/gdpr|_next|_proxy|_auth|_static|_vercel|favicon.ico|extensions|[\\w-]+\\.\\w+).*)",
    ],
};
