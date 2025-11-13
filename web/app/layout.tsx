import "./globals.css";
import "@/styles/main.css";
import { Metadata } from "next";
import { ReactNode } from "react";
import { Inter } from "next/font/google";
import { AppLayoutWrapper, GlobalLoader, ModalHost, Providers } from "@/shared";

export const metadata: Metadata = {
    title: "Radius Product Bundles App for Shopify",
    other: {
        "shopify-api-key": process.env.NEXT_PUBLIC_SHOPIFY_API_KEY || "",
        "shopify-app-origins": process.env.NEXT_PUBLIC_HOST || "",
    },
};

const inter = Inter({ subsets: ["latin"] });

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
                <script src="https://cdn.shopify.com/shopifycloud/app-bridge.js"></script>
                <script src="https://cdn.shopify.com/shopifycloud/polaris.js"></script>
            </head>
            <body
                className={`radius-app-wrapper ${inter.className}`}
                suppressHydrationWarning
            >
                <Providers>
                    <GlobalLoader />
                    <AppLayoutWrapper>
                        {children}
                        <ModalHost />
                    </AppLayoutWrapper>
                </Providers>
            </body>
        </html>
    );
}
