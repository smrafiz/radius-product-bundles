"use client";

import { ReactNode, useState } from "react";
import {
    DehydratedState,
    HydrationBoundary,
    QueryClient,
    QueryClientProvider,
} from "@tanstack/react-query";
import { DevtoolsPosition } from "@tanstack/query-devtools";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

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
            <HydrationBoundary state={dehydratedState}>
                {children}
            </HydrationBoundary>
            {process.env.NODE_ENV === "development" && (
                <ReactQueryDevtools
                    initialIsOpen={false}
                    position={"bottom-right" as DevtoolsPosition}
                />
            )}
        </QueryClientProvider>
    );
}
