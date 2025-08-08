"use client";

import React, { Suspense } from "react";
import { Inter } from "next/font/google";
import { AppProvider } from "@shopify/polaris";
import "@shopify/polaris/build/esm/styles.css";
import SessionProvider from "./session-provider";
import { TanstackProvider } from "./tanstack-provider";
import Navigation from "@/components/shared/Navigation";
import translations from "@shopify/polaris/locales/en.json";

const inter = Inter({ subsets: ["latin"] });

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <AppProvider i18n={translations} >
            <Suspense fallback={null}>
                <Navigation />
            </Suspense>
            <TanstackProvider>
                <SessionProvider>
                    <div className={inter.className}>{children}</div>
                </SessionProvider>
            </TanstackProvider>
        </AppProvider>
    );
}

export function ExitProvider({ children }: { children: React.ReactNode }) {
    return (
        <AppProvider i18n={translations}>
            <SessionProvider>
                <div className={inter.className}>{children}</div>
            </SessionProvider>
        </AppProvider>
    );
}
