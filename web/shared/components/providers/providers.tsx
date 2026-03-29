"use client";

import { DehydratedState } from "@tanstack/react-query";
import { AppSettingsProvider } from "@/features/settings/components/app-settings-provider";
import { ReactNode, Suspense, useEffect, useState } from "react";
import { ProtectedRoute, SessionProvider, TanstackProvider } from "@/shared";
import { PlanProvider } from "@/shared/components/plan-gate/plan-provider";

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
        <>
            <TanstackProvider dehydratedState={dehydratedState}>
                <Suspense
                    fallback={
                        <div className="flex items-center justify-center min-h-screen">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
                        </div>
                    }
                >
                    <SessionProvider>
                        <AppSettingsProvider>
                            <PlanProvider>
                                <ProtectedRoute>{children}</ProtectedRoute>
                            </PlanProvider>
                        </AppSettingsProvider>
                    </SessionProvider>
                </Suspense>
            </TanstackProvider>
        </>
    );
}
