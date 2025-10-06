"use client";

import { ReactNode, useEffect, useState } from "react";
import { DashboardSkeleton } from "@/components/shared/Skeletons";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { useSessionStore } from "@/stores";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
    const { isInitialized, hasValidSession, shop, sessionToken } =
        useSessionStore();
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [refreshAttempted, setRefreshAttempted] = useState(false);

    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Check if we're in a theme extension context
    const isThemeExtension =
        typeof window !== "undefined" &&
        (window.parent !== window ||
            document.referrer.includes("admin.shopify.com") ||
            document.referrer.includes("myshopify.com/admin/themes"));

    // Skip authentication for theme extensions
    if (isThemeExtension) {
        return <>{children}</>;
    }

    useEffect(() => {
        // Skip session refresh for theme extensions
        if (isThemeExtension) {
            return;
        }

        const refreshSession = async () => {
            if (
                isInitialized &&
                !hasValidSession &&
                !refreshAttempted &&
                !isRefreshing
            ) {
                setIsRefreshing(true);
                setRefreshAttempted(true);

                try {
                    const shopParam = searchParams.get("shop");
                    const hostParam = searchParams.get("host");
                    const currentShop = shopParam || shop;

                    if (currentShop) {
                        console.log(
                            "🔄 Trying to refresh session for:",
                            currentShop,
                        );

                        const response = await fetch("/api/refresh-session", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                shop: currentShop,
                                host: hostParam,
                            }),
                        });

                        const data = await response.json();

                        if (data.success && data.session) {
                            console.log("✅ Session refreshed successfully");

                            useSessionStore.getState().dispatch({
                                type: "SESSION_VALIDATION_SUCCESS",
                                payload: {
                                    token: data.session.token,
                                    shop: data.session.shop,
                                },
                            });

                            setIsRefreshing(false);
                            return;
                        }
                    }
                } catch (error) {
                    console.log("❌ Session refresh failed:", error);
                }

                console.log("🔄 Redirecting to OAuth flow");
                const currentShop = searchParams.get("shop") || shop;
                const authUrl = `/api/auth?returnTo=${encodeURIComponent(pathname)}`;
                if (currentShop) {
                    router.push(`${authUrl}&shop=${currentShop}`);
                } else {
                    router.push(authUrl);
                }

                setIsRefreshing(false);
            }
        };

        void refreshSession();
    }, [
        isInitialized,
        hasValidSession,
        shop,
        pathname,
        searchParams,
        router,
        isRefreshing,
        refreshAttempted,
        isThemeExtension,
    ]);

    // Don't protect the root path - let it redirect
    if (pathname === "/") {
        return <>{children}</>;
    }

    // Show skeleton while checking/refreshing a session
    if (!isInitialized || isRefreshing || (!hasValidSession && !sessionToken)) {
        return <DashboardSkeleton />;
    }

    return <>{children}</>;
}
