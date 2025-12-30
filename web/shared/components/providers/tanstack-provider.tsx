"use client";

import {
    DehydratedState,
    HydrationBoundary,
    QueryClient,
    QueryClientProvider,
} from "@tanstack/react-query";
import { useCrossTabSync } from "@/shared";
import { ReactNode, useState } from "react";
import { DevtoolsPosition } from "@tanstack/query-devtools";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

/**
 * Cross-Tab Sync Component
 *
 * Enables real-time synchronization across browser tabs.
 */
function CrossTabSyncProvider() {
    useCrossTabSync();

    return null;
}

export function TanstackProvider({
    children,
    dehydratedState,
}: {
    children: ReactNode;
    dehydratedState?: DehydratedState | null;
}) {
    // useState ensures a single QueryClient per app lifecycle
    const [queryClient] = useState(() => new QueryClient());

    return (
        <QueryClientProvider client={queryClient}>
            {/* Enable cross-tab sync */}
            <CrossTabSyncProvider />

            <HydrationBoundary state={dehydratedState}>
                {children}
            </HydrationBoundary>
            {process.env.NODE_ENV === "development" && (
                <ReactQueryDevtools
                    initialIsOpen={false}
                    position={"left" as DevtoolsPosition}
                />
            )}
        </QueryClientProvider>
    );
}
