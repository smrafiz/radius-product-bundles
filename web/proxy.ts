import { detectShop } from "@/security/shop";
import { addSecurityHeaders } from "@/security/headers";
import { NextRequest, NextResponse } from "next/server";

/**
 * Middleware to add CSP and security headers for Shopify embedded app pages.
 *
 * Skip paths: static assets and API routes do not need CSP headers.
 */
export default function proxy(request: NextRequest) {
    const { pathname, searchParams } = request.nextUrl;
    const locale = searchParams.get('locale');

    // Paths to skip completely - don't even detect shop
    const skipCompletely = [
        "/api/upload", // File upload - must not read body
    ];

    // Skip completely for the upload route
    if (skipCompletely.some((p) => pathname.startsWith(p))) {
        return NextResponse.next();
    }

    // Paths to skip for performance because headers are unnecessary
    const skipPaths = [
        "/api/",
        "/_next/",
        "/favicon.ico",
        "/public/",
        "/extensions/",
    ];

    // Redirect root path to dashboard (preserves all query params)
    if (pathname === "/") {
        const url = request.nextUrl.clone();
        url.pathname = "/dashboard";

        return NextResponse.redirect(url);
    }

    const shop = detectShop(request, searchParams);

    // Dev-only logs for debugging
    if (process.env.NODE_ENV === "development") {
        console.log(`[Proxy][DEV] Detected shop: ${shop}`);
    }

    // Skip adding headers for static assets or API routes
    if (skipPaths.some((p) => pathname.startsWith(p))) {
        return NextResponse.next(); // just continue, no headers
    }

    // Skip for theme extensions (detect by iframe context)
    const referer = request.headers.get("referer");
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
    const responseWithHeaders = addSecurityHeaders(NextResponse.next(), shop);

    if (locale) {
        // Shopify injects the 'locale' search parameter into iframe URLs.
        // Save it so I18nLoader can read the merchant's active language
        responseWithHeaders.cookies.set('NEXT_LOCALE', locale, {
          path: '/',
          maxAge: 60 * 60 * 24 * 365, // 1 year
          sameSite: 'none',
          secure: true,
        });
    }

    return responseWithHeaders;
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
         * /api/auth, /api/webhooks, /api/proxy, /api/gdpr, /api/upload, /_next,
         * /_proxy, /_auth, /_static, /_vercel, /public, /extensions (/favicon.ico, etc)
         */
        "/((?!api/auth|api/webhooks|api/proxy|api/gdpr|api/upload|_next|_proxy|_auth|_static|_vercel|favicon.ico|extensions|[\\w-]+\\.\\w+).*)",
    ],
};
