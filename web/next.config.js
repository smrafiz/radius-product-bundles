/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    devIndicators: false,
    env: {
        NEXT_PUBLIC_HOST: process.env.HOST,
        NEXT_PUBLIC_SHOPIFY_API_KEY: process.env.SHOPIFY_API_KEY,
    },
    
    // Add security headers
    async headers() {
        return [
            {
                // Apply to all routes
                source: '/(.*)',
                headers: [
                    {
                        key: 'X-DNS-Prefetch-Control',
                        value: 'on'
                    },
                    {
                        key: 'Strict-Transport-Security',
                        value: 'max-age=63072000; includeSubDomains; preload'
                    },
                    {
                        key: 'X-XSS-Protection',
                        value: '1; mode=block'
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff'
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'strict-origin-when-cross-origin'
                    }
                ],
            },
            {
                // Specific CSP for app pages
                source: '/(dashboard|bundles|analytics|settings)(.*)',
                headers: [
                    {
                        key: 'Content-Security-Policy',
                        value: "default-src 'self'; " +
                               "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.shopify.com https://*.shopify.com; " +
                               "style-src 'self' 'unsafe-inline' https://cdn.shopify.com; " +
                               "img-src 'self' data: https: blob:; " +
                               "font-src 'self' https://fonts.gstatic.com https://cdn.shopify.com; " +
                               "connect-src 'self' https://*.shopify.com wss://*.shopify.com; " +
                               "frame-ancestors https://*.myshopify.com https://admin.shopify.com; " +
                               "form-action 'self'; " +
                               "base-uri 'self';"
                    }
                ],
            }
        ];
    },
};

module.exports = nextConfig;
