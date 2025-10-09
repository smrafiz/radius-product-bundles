"use client";

import { ReactNode, Suspense } from "react";
import { AppProvider } from "@shopify/polaris";
import "@shopify/polaris/build/esm/styles.css";
import Navigation from "@/components/shared/Navigation";
import { DehydratedState } from "@tanstack/react-query";
import translations from "@shopify/polaris/locales/en.json";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { SessionProvider, TanstackProvider } from "@/providers";

export default function Providers({
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
                    <ProtectedRoute>
                        {children}
                    </ProtectedRoute>
                </SessionProvider>
            </TanstackProvider>
        </AppProvider>
    );
}
