import { NextRequest, NextResponse } from "next/server";

/**
 * Middleware to add security headers and handle embedded contexts
 *
 * @param request
 */
export async function middleware(request: NextRequest) {
    const { pathname, searchParams } = request.nextUrl;

    // Skip middleware for performance-critical paths
    const skipPaths = [
        "/api/",
        "/_next/",
        "/favicon.ico",
        "/public/",
        ".png",
        ".jpg",
        ".jpeg",
        ".gif",
        ".svg",
        ".ico",
        ".css",
        ".js",
        ".map",
        ".woff",
        ".woff2",
    ];

    if (
        skipPaths.some(
            (path) => pathname.startsWith(path) || pathname.includes(path),
        )
    ) {
        return addSecurityHeaders(
            NextResponse.next(),
            searchParams.get("shop"),
        );
    }

    // Detect Shopify embedded context
    const isEmbedded =
        searchParams.get("embedded") === "1" ||
        searchParams.has("shop") ||
        searchParams.has("host") ||
        searchParams.has("id_token") ||
        request.headers.get("sec-fetch-dest") === "iframe" ||
        request.headers.get("sec-fetch-site") === "cross-site";

    if (isEmbedded) {
        return addSecurityHeaders(
            NextResponse.next(),
            searchParams.get("shop"),
        );
    }

    // Check for existing session cookies
    const sessionCookie = request.cookies.get("shopify-session");
    const shopCookie = request.cookies.get("shopify-shop");

    if (sessionCookie || shopCookie) {
        const shop = searchParams.get("shop") || shopCookie?.value || null;
        return addSecurityHeaders(NextResponse.next(), shop);
    }

    // Default: allow and add headers
    return addSecurityHeaders(NextResponse.next(), searchParams.get("shop"));
}

/**
 * Add security headers to the response
 *
 * @param response
 * @param shop
 */
function addSecurityHeaders(
    response: NextResponse,
    shop: string | null,
): NextResponse {
    const shopDomain = shop || "*.myshopify.com";

    // CSP to restrict embedding
    response.headers.set(
        "Content-Security-Policy",
        `frame-ancestors https://${shopDomain} https://admin.shopify.com;`,
    );

    // Extra security headers
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

    // CORS headers
    response.headers.set(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS",
    );
    response.headers.set(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization",
    );

    return response;
}

/**
 * Middleware configuration
 */
export const config = {
    matcher: [
        "/((?!api/auth|api/webhooks|api/proxy_route|api/gdpr|_next|_proxy|_auth|_static|_vercel|_next/static|_next/image|favicon.ico|[\\w-]+\\.\\w+).*)",
    ],
};
