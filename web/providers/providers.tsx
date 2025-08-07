"use client";

import { Suspense } from "react";
import { AppProvider } from "@shopify/polaris";
import "@shopify/polaris/build/esm/styles.css";
import SessionProvider from "./session-provider";
import { TanstackProvider } from "./tanstack-provider";
import Navigation from "@/components/shared/Navigation";
import translations from "@shopify/polaris/locales/en.json";

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
