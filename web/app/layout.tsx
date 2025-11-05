import "./globals.css";
import "@/styles/main.css";
import { Metadata } from "next";
import { ReactNode } from "react";
import { AppLayoutWrapper, GlobalLoader, ModalHost, Providers } from "@/shared";

export const metadata: Metadata = {
    title: "Radius Product Bundles App for Shopify",
    other: {
        "shopify-api-key": process.env.NEXT_PUBLIC_SHOPIFY_API_KEY || "",
        "shopify-app-origins": process.env.NEXT_PUBLIC_HOST || "",
    },
};

/*
 * Root Layout
 */
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
            <body>
                <Providers>
                    <GlobalLoader />
                    <AppLayoutWrapper>{children}</AppLayoutWrapper>
                    <ModalHost />
                </Providers>
            </body>
        </html>
    );
}
