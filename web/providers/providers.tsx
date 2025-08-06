"use client";

import { AppProvider } from "@shopify/polaris";
import "@shopify/polaris/build/esm/styles.css";
import SessionProvider from "./session-provider";
import Navigation from "@/components/Navigation";
import { TanstackProvider } from "./tanstack-provider";
import translations from "@shopify/polaris/locales/en.json";
import { Suspense } from "react";

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <AppProvider i18n={translations}>
            <Suspense fallback={null}>
                <Navigation />
            </Suspense>
            <TanstackProvider>
                <SessionProvider>{children}</SessionProvider>
            </TanstackProvider>
        </AppProvider>
    );
}

export function ExitProvider({ children }: { children: React.ReactNode }) {
    return (
        <AppProvider i18n={translations}>
            <SessionProvider>{children}</SessionProvider>
        </AppProvider>
    );
}
