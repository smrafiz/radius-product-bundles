/**
 * @type {import('next').NextConfig}
 */

const nextConfig = {
    reactStrictMode: true,
    devIndicators: false,
    env: {
        NEXT_PUBLIC_HOST: process.env.HOST,
        NEXT_PUBLIC_SHOPIFY_API_KEY: process.env.SHOPIFY_API_KEY,
        NEXT_PUBLIC_SHOP: process.env.NEXT_PUBLIC_SHOP,
    },
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "cdn.shopify.com",
            },
        ],
    },
    async headers() {
        return [
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
    async rewrites() {
        return [
            {
                source: "/apps/bundle-api/:path*",
                destination: "/api/bundle-api/:path*", // Next.js API route
            },
        ];
    },
};

export default nextConfig;
