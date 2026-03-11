import "./globals.css";
import "@/styles/main.css";
import { Metadata } from "next";
import { ReactNode, Suspense } from "react";
import { Inter } from "next/font/google";
import { AppLayoutWrapper, GlobalLoader, ModalHost, Providers } from "@/shared";
import { I18nProvider } from "@/lib/i18n/provider";
import { I18nLoader } from "./i18n-loader";

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
export default function RootLayout({
    children,
}: {
    children: ReactNode;
}) {
    return (
        <html lang="en">
            <head>
                <script src="https://cdn.shopify.com/shopifycloud/app-bridge.js"></script>
                <script src="https://cdn.shopify.com/shopifycloud/polaris.js"></script>
            </head>
            <body
                className={`radius-app-wrapper ${inter.className}`}
                suppressHydrationWarning
            >
                <Suspense>
                    <I18nLoader>
                        <Providers>
                            <GlobalLoader />
                            <AppLayoutWrapper>
                                {children}
                                <ModalHost />
                            </AppLayoutWrapper>
                        </Providers>
                    </I18nLoader>
                </Suspense>
            </body>
        </html>
    );
}
