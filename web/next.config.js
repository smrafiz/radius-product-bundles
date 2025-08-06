/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    devIndicators: false,
    env: {
        NEXT_PUBLIC_HOST: process.env.HOST,
        NEXT_PUBLIC_SHOPIFY_API_KEY: process.env.SHOPIFY_API_KEY,
    },
    allowedDevOrigins: [
        process.env.SHOPIFY_APP_URL.toString().replace("https://", ""),
    ],
};

module.exports = nextConfig;
