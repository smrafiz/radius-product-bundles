/**
 * Generate Content Security Policy string
 *
 * @param shop
 * @param isDev
 */
export function generateCSP(shop: string, isDev = false): string {
    const frameAncestors = `frame-ancestors https://${shop} https://admin.shopify.com;`;

    const csp = [
        "default-src 'self';",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.shopify.com https://*.shopify.com;",
        "style-src 'self' 'unsafe-inline' https://cdn.shopify.com;",
        "img-src 'self' data: https: blob:;",
        "font-src 'self' https://fonts.gstatic.com https://cdn.shopify.com;",
        "connect-src 'self' https://*.shopify.com wss://*.shopify.com;",
        frameAncestors,
        "form-action 'self';",
        "base-uri 'self';",
    ];

    if (isDev) {
        console.log(`[CSP][DEV] Generated CSP for shop: ${shop}`);
    }

    return csp.join(" ");
}
