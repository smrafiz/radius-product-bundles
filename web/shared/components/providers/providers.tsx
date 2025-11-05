"use client";

import {
    Navigation,
    ProtectedRoute,
    SessionProvider,
    TanstackProvider,
} from "@/shared";
import { ReactNode, Suspense } from "react";
import { AppProvider } from "@shopify/polaris";
import "@shopify/polaris/build/esm/styles.css";
import { DehydratedState } from "@tanstack/react-query";
import translations from "@shopify/polaris/locales/en.json";

export function Providers({
    children,
    dehydratedState,
}: {
    children: ReactNode;
    dehydratedState?: DehydratedState | null;
}) {
    return (
        <AppProvider i18n={translations}>
            <Suspense fallback={null}>
                <Navigation />
            </Suspense>
            <TanstackProvider dehydratedState={dehydratedState}>
                <SessionProvider>
                    <ProtectedRoute>{children}</ProtectedRoute>
                </SessionProvider>
            </TanstackProvider>
        </AppProvider>
    );
}
