import { NextRequest } from "next/server";

/**
 * Detect Shopify shop domain from the query, cookies, session, or fallback
 */
export function detectShop(
    request?: NextRequest,
    searchParams?: URLSearchParams,
): string {
    // 1️⃣ Query param
    if (searchParams) {
        const shopParam = searchParams.get("shop");

        if (shopParam) {
            return shopParam;
        }
    }

    // 2️⃣ Cookies
    if (request) {
        const shopCookie = request.cookies.get("shopify-shop")?.value;

        if (shopCookie) {
            return shopCookie;
        }

        const sessionCookie = request.cookies.get("shopify-session")?.value;
        const shopFromSession = sessionCookie
            ? extractShopFromSession(sessionCookie)
            : null;

        if (shopFromSession) {
            return shopFromSession;
        }
    }

    // 3️⃣ Environment variable (frontend-safe fallback)
    if (process.env.NEXT_PUBLIC_SHOP) {
        return process.env.NEXT_PUBLIC_SHOP;
    }

    // 4️⃣ Fallback
    return "*.myshopify.com";
}

/**
 * Extract shop domain from the session cookie
 */
function extractShopFromSession(session: string): string | null {
    if (!session) {
        return null;
    }

    try {
        const decoded = decodeURIComponent(session);
        const data = JSON.parse(decoded);

        if (data?.shop) {
            return data.shop;
        }
    } catch {}

    try {
        const jsonStr = Buffer.from(session, "base64").toString("utf-8");
        const data = JSON.parse(jsonStr);

        if (data?.shop) {
            return data.shop;
        }
    } catch {}

    const match = session.match(/([a-z0-9-]+\.myshopify\.com)/i);

    if (match) {
        return match[1];
    }

    return null;
}
