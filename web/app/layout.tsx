import "./globals.css";
import "@/styles/main.css";
import { Metadata } from "next";
import { ReactNode } from "react";
import Providers from "@/providers/providers";
import AppLayout from "@/components/layout/AppLayout";
import GlobalLoader from "@/components/shared/GlobalLoader";

export const metadata: Metadata = {
    title: "Radius Product Bundles App for Shopify",
    other: {
        "shopify-api-key": process.env.NEXT_PUBLIC_SHOPIFY_API_KEY || "",
        "shopify-app-origins": process.env.NEXT_PUBLIC_HOST || "",
    },
};

export default async function RootLayout({
    children,
}: {
    children: ReactNode;
}) {
    return (
        <html lang="en">
            <head>
                {/* eslint-disable-next-line @next/next/no-sync-scripts */}
                <script src="https://cdn.shopify.com/shopifycloud/app-bridge.js" />
            </head>
            <body suppressHydrationWarning={true}>
                <Providers>
                    <GlobalLoader />
                    <AppLayout>{children}</AppLayout>
                </Providers>
            </body>
        </html>
    );
}
