import "./globals.css";
import "@/styles/main.css";
import { Metadata } from "next";
import { Inter } from "next/font/google";
import { I18nLoader } from "./i18n-loader";
import { ReactNode, Suspense } from "react";
import { AppLayoutWrapper, GlobalLoader, ModalHost, Providers } from "@/shared";

export const metadata: Metadata = {
    title: "Radius Product Bundles App for Shopify",
    other: {
        "shopify-app-origins": process.env.NEXT_PUBLIC_HOST || "",
    },
};

const inter = Inter({ subsets: ["latin"] });

/*
 * Root Layout
 */
export default function RootLayout({
    children,
}: {
    children: ReactNode;
}) {
    return (
        <html lang="en">
            <head>
                <meta name="shopify-api-key" content={process.env.NEXT_PUBLIC_SHOPIFY_API_KEY || ""} />
                <script src="https://cdn.shopify.com/shopifycloud/app-bridge.js"></script>
                <script src="https://cdn.shopify.com/shopifycloud/polaris.js"></script>
            </head>
            <body
                className={`radius-app-wrapper ${inter.className}`}
                suppressHydrationWarning
            >
                <Providers>
                    <GlobalLoader />
                    <Suspense>
                        <I18nLoader>
                            <AppLayoutWrapper>
                                {children}
                                <ModalHost />
                            </AppLayoutWrapper>
                        </I18nLoader>
                    </Suspense>
                </Providers>
            </body>
        </html>
    );
}
