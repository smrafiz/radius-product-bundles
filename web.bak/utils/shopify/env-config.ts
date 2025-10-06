// utils/env-config.ts
// Utility functions for working with your .env structure

interface AppConfig {
    // Shopify credentials
    apiKey: string;
    apiSecret: string;
    scopes: string[];
    apiVersion: string;

    // App details
    appName: string;
    appHandle: string;
    host: string; // This is your dynamic tunnel URL

    // URLs derived from HOST
    appUrl: string;
    proxyUrl: string;
    callbackUrl: string;
    oauthUrl: string;

    // Config flags
    posEmbedded: boolean;
    directApiMode: string;
    embeddedAppDirectApiAccess: boolean;
    autoUpdateUrl: boolean;

    // Development
    devStoreUrl?: string;
    databaseUrl?: string;
}

/**
 * Get app configuration from environment variables
 * This works with your existing .env structure
 */
export function getAppConfig(): AppConfig {
    const host =
        process.env.HOST ||
        process.env.SHOPIFY_APP_URL ||
        process.env.APP_URL ||
        "http://localhost:3000";

    // Remove trailing slashes
    const cleanHost = host.replace(/\/+$/, "");

    return {
        // Shopify credentials
        apiKey: process.env.SHOPIFY_API_KEY || "",
        apiSecret: process.env.SHOPIFY_API_SECRET || "",
        scopes: (process.env.SCOPES || "").split(",").map((s) => s.trim()),
        apiVersion: process.env.SHOPIFY_API_VERSION || "2025-07",

        // App details
        appName: process.env.APP_NAME || "Product Bundles",
        appHandle: process.env.APP_HANDLE || "product-bundles47",
        host: cleanHost,

        // URLs derived from HOST
        appUrl: cleanHost,
        proxyUrl: `${cleanHost}/api/proxy`,
        callbackUrl: `${cleanHost}/api/auth/callback`,
        oauthUrl: `${cleanHost}/api/auth/oauth/callback`,

        // Config flags
        posEmbedded: process.env.POS_EMBEDDED !== "true",
        directApiMode: process.env.DIRECT_API_MODE || "offline",
        embeddedAppDirectApiAccess:
            process.env.EMBEDDED_APP_DIRECT_API_ACCESS === "true",
        autoUpdateUrl: process.env.AUTO_UPDATE_URL === "true",

        // Development
        devStoreUrl: process.env.DEV_STORE_URL,
        databaseUrl: process.env.DATABASE_URL,
    };
}

/**
 * Get just the URLs (useful for API routes)
 */
export function getAppUrls(requestUrl?: string): {
    appUrl: string;
    proxyUrl: string;
    callbackUrl: string;
    oauthUrl: string;
} {
    let host: string;

    // If we have a request URL, derive the host from it
    if (requestUrl) {
        const url = new URL(requestUrl);
        host = `${url.protocol}//${url.host}`;
    } else {
        // Fall back to environment variables
        host =
            process.env.HOST ||
            process.env.SHOPIFY_APP_URL ||
            process.env.APP_URL ||
            "http://localhost:3000";
    }

    const cleanHost = host.replace(/\/+$/, "");

    return {
        appUrl: cleanHost,
        proxyUrl: `${cleanHost}/api/proxy`,
        callbackUrl: `${cleanHost}/api/auth/callback`,
        oauthUrl: `${cleanHost}/api/auth/oauth/callback`,
    };
}

/**
 * Get Shopify context from request headers
 */
export function getShopifyContext(request: Request) {
    const urls = getAppUrls(request.url);

    return {
        ...urls,
        shop: request.headers.get("x-shopify-shop"),
        topic: request.headers.get("x-shopify-topic"),
        hmac: request.headers.get("x-shopify-hmac-sha256"),
        webhookId: request.headers.get("x-shopify-webhook-id"),
        apiVersion: request.headers.get("x-shopify-api-version"),
    };
}

/**
 * Validate that required environment variables are set
 */
export function validateEnvConfig(): { isValid: boolean; missing: string[] } {
    const required = [
        "SHOPIFY_API_KEY",
        "SHOPIFY_API_SECRET",
        "HOST",
        "SCOPES",
    ];

    const missing = required.filter((key) => !process.env[key]);

    return {
        isValid: missing.length === 0,
        missing,
    };
}

/**
 * Development helper to check if running with auto-updated URLs
 */
export function isDevelopmentWithAutoUpdate(): boolean {
    const host = process.env.HOST || "";
    return (
        process.env.NODE_ENV === "development" &&
        (host.includes("trycloudflare.com") ||
            host.includes("ngrok.io") ||
            host.includes("loca.lt"))
    );
}
