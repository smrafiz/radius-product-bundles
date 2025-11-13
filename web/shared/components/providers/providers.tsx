"use client";

import { AppProvider } from "@shopify/polaris";
import "@shopify/polaris/build/esm/styles.css";
import { DehydratedState } from "@tanstack/react-query";
import translations from "@shopify/polaris/locales/en.json";
import { ReactNode, Suspense, useEffect, useState } from "react";
import { Navigation, ProtectedRoute, SessionProvider, TanstackProvider } from "@/shared";

/**
 * Root Providers Component
 */
export function Providers({
    children,
    dehydratedState,
}: {
    children: ReactNode;
    dehydratedState?: DehydratedState | null;
}) {
    const [hasMounted, setHasMounted] = useState(false);

    useEffect(() => {
        setHasMounted(true);
    }, []);

    if (!hasMounted) {
        return null;
    }

    return (
        <AppProvider i18n={translations}>
            <Suspense fallback={null}>
                <Navigation />
            </Suspense>
            <TanstackProvider dehydratedState={dehydratedState}>
                <Suspense
                    fallback={
                        <div className="flex items-center justify-center min-h-screen">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
                        </div>
                    }
                >
                    <SessionProvider>
                        <ProtectedRoute>{children}</ProtectedRoute>
                    </SessionProvider>
                </Suspense>
            </TanstackProvider>
        </AppProvider>
    );
}
