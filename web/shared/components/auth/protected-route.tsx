"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { DashboardSkeleton, useProtectedSession } from "@/shared";

/**
 * Protects routes by validating or refreshing the Shopify session.
 */
export function ProtectedRoute({ children }: { children: ReactNode }) {
    const {
        isInitialized,
        hasValidSession,
        isRefreshing,
        isThemeExtension,
        sessionToken,
    } = useProtectedSession();
    const pathname = usePathname();

    // Skip protection entirely for theme extensions
    if (isThemeExtension) {
        return <>{children}</>;
    }

    // Don’t block the root route (Shopify app initialization)
    if (pathname === "/") {
        return <>{children}</>;
    }

    // Show skeleton while checking/refreshing
    if (!isInitialized || isRefreshing || (!hasValidSession && !sessionToken)) {
        return <DashboardSkeleton />;
    }

    return <>{children}</>;
}
