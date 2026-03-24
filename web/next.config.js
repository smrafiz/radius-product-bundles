/**
 * @type {import('next').NextConfig}
 */

const nextConfig = {
    allowedDevOrigins: ["*.trycloudflare.com"],
    reactStrictMode: true,
    devIndicators: false,
    env: {
        NEXT_PUBLIC_HOST: process.env.HOST,
        NEXT_PUBLIC_SHOPIFY_API_KEY: process.env.SHOPIFY_API_KEY,
    },
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "cdn.shopify.com",
            },
        ],
    },
    cacheComponents: true,
    cacheLife: {
        // Dashboard metrics & chart data (5 min revalidate)
        dashboard: {
            stale: 300, // 5 min client stale
            revalidate: 300, // 5 min server revalidate
            expire: 3600, // 1 hour max lifetime
        },
        // Top bundles, setup guide, settings (10 min revalidate)
        "dashboard-long": {
            stale: 600, // 10 min client stale
            revalidate: 600, // 10 min server revalidate
            expire: 3600, // 1 hour max lifetime
        },
    },
    experimental: {
        turbopackFileSystemCacheForDev: true,
    },
    async headers() {
        return [
            {
                // Add CORS for upload API
                source: "/api/upload",
                headers: [
                    { key: "Access-Control-Allow-Origin", value: "*" },
                    {
                        key: "Access-Control-Allow-Methods",
                        value: "POST, OPTIONS",
                    },
                    {
                        key: "Access-Control-Allow-Headers",
                        value: "Content-Type, Authorization",
                    },
                ],
            },
            {
                source: "/(.*)",
                headers: [
                    { key: "X-Content-Type-Options", value: "nosniff" },
                    {
                        key: "Referrer-Policy",
                        value: "strict-origin-when-cross-origin",
                    },
                    { key: "X-DNS-Prefetch-Control", value: "on" },
                    {
                        key: "Strict-Transport-Security",
                        value: "max-age=63072000; includeSubDomains; preload",
                    },
                ],
            },
        ];
    },
};

export default nextConfig;
