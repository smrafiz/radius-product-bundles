const { detectShop } = require("./security/shop");
const { generateCSP } = require("./security/csp");

const nextConfig = {
    reactStrictMode: true,
    devIndicators: false,
    env: {
        NEXT_PUBLIC_HOST: process.env.HOST,
        NEXT_PUBLIC_SHOPIFY_API_KEY: process.env.NEXT_PUBLIC_SHOPIFY_API_KEY,
        NEXT_PUBLIC_SHOP: process.env.NEXT_PUBLIC_SHOP,
    },
    async headers() {
        const shop = detectShop();
        return [
            {
                source: "/(.*)",
                headers: [
                    {
                        key: "Content-Security-Policy",
                        value: generateCSP(
                            shop,
                            process.env.NODE_ENV === "development",
                        ),
                    },
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

module.exports = nextConfig;
