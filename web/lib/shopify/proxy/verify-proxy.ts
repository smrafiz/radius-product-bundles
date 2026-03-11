import { createHmac } from "crypto";
import { NextRequest, NextResponse } from "next/server";

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 100;
const CLEANUP_INTERVAL_MS = 300_000;

const rateLimitMap = new Map<string, { count: number; windowStart: number }>();

let lastCleanup = Date.now();

function checkRateLimit(shop: string): boolean {
    const now = Date.now();

    // Periodic cleanup of expired entries
    if (now - lastCleanup > CLEANUP_INTERVAL_MS) {
        lastCleanup = now;
        for (const [key, entry] of rateLimitMap) {
            if (now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
                rateLimitMap.delete(key);
            }
        }
    }

    const entry = rateLimitMap.get(shop);

    if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
        rateLimitMap.set(shop, { count: 1, windowStart: now });
        return true;
    }

    entry.count++;
    return entry.count <= RATE_LIMIT_MAX_REQUESTS;
}

/**
 * Verifies Shopify App Proxy request signature.
 *
 * Shopify signs all App Proxy requests by appending a `signature` query parameter.
 * The signature is an HMAC-SHA256 of the other query parameters using the API secret.
 *
 * Algorithm:
 * 1. Remove `signature` from query params
 * 2. Sort remaining params alphabetically by key
 * 3. Join as "key=value" pairs (no separator)
 * 4. HMAC-SHA256 with API secret
 * 5. Compare hex digest with provided signature
 *
 * @see https://shopify.dev/docs/apps/online-store/app-proxies#calculate-a-digital-signature
 */
export function verifyAppProxySignature(
    searchParams: URLSearchParams,
): boolean {
    const signature = searchParams.get("signature");

    if (!signature) {
        return false;
    }

    const secret = process.env.SHOPIFY_API_SECRET;

    if (!secret) {
        console.error("[Proxy] SHOPIFY_API_SECRET not configured");
        return false;
    }

    // Collect all params except signature
    const params: [string, string][] = [];
    searchParams.forEach((value, key) => {
        if (key !== "signature") {
            params.push([key, value]);
        }
    });

    // Sort alphabetically by key
    params.sort(([a], [b]) => a.localeCompare(b));

    // Join as key=value pairs with no separator
    const message = params.map(([key, value]) => `${key}=${value}`).join("");

    // Compute HMAC-SHA256
    const computed = createHmac("sha256", secret).update(message).digest("hex");

    return computed === signature;
}

/**
 * Middleware helper: verifies proxy signature and returns 401 if invalid.
 * Returns the shop domain if valid, or a NextResponse error if not.
 */
export function verifyProxyRequest(
    request: NextRequest,
): { shop: string } | NextResponse {
    const { searchParams } = request.nextUrl;
    const shop = searchParams.get("shop");

    if (!shop) {
        return NextResponse.json(
            { error: "Missing shop parameter" },
            { status: 400 },
        );
    }

    if (!verifyAppProxySignature(searchParams)) {
        console.warn(
            `[Proxy] Invalid signature for shop: ${shop}, path: ${request.nextUrl.pathname}`,
        );
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!checkRateLimit(shop)) {
        return NextResponse.json(
            { error: "Too many requests" },
            { status: 429 },
        );
    }

    return { shop };
}
