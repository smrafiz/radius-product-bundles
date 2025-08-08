import { NextRequest, NextResponse } from "next/server";

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

    // Fast check for Shopify embedded context
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

    // Check for existing session indicators
    const sessionCookie = request.cookies.get("shopify-session");
    const shopCookie = request.cookies.get("shopify-shop");

    if (sessionCookie || shopCookie) {
        // Fix: Handle undefined by converting to null
        const shop = searchParams.get("shop") || shopCookie?.value || null;
        return addSecurityHeaders(NextResponse.next(), shop);
    }

    // For now, be permissive and let the app's client-side authentication handle the flow
    // This prevents the middleware from blocking normal app operation
    return addSecurityHeaders(NextResponse.next(), searchParams.get("shop"));
}

function addSecurityHeaders(
    response: NextResponse,
    shop: string | null,
): NextResponse {
    const shopDomain = shop || "*.myshopify.com";

    // Add CSP and security headers
    response.headers.set(
        "Content-Security-Policy",
        `frame-ancestors https://${shopDomain} https://admin.shopify.com;`,
    );

    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

    return response;
}

export const config = {
    matcher: [
        "/((?!api/auth|api/webhooks|_next/static|_next/image|favicon.ico).*)",
    ],
};
