"use client";

import { useSessionStore } from "@/shared";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function useProtectedSession() {
    const {
        isInitialized,
        hasValidSession,
        sessionToken,
        validateSession,
        updateSessionToken,
        clearSession,
        isSessionExpired,
        shop,
    } = useSessionStore();

    const [isRefreshing, setIsRefreshing] = useState(false);
    const [refreshAttempted, setRefreshAttempted] = useState(false);

    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Use refs for values only needed inside the effect body (not as triggers)
    const pathnameRef = useRef(pathname);
    pathnameRef.current = pathname;
    const searchParamsRef = useRef(searchParams);
    searchParamsRef.current = searchParams;

    const isThemeExtension =
        typeof window !== "undefined" &&
        (window.parent !== window ||
            document.referrer.includes("admin.shopify.com") ||
            document.referrer.includes("myshopify.com/admin/themes"));

    useEffect(() => {
        if (isThemeExtension || isRefreshing || refreshAttempted) return;

        const refreshSession = async () => {
            if (!isInitialized || hasValidSession) return;

            setIsRefreshing(true);
            setRefreshAttempted(true);

            try {
                await validateSession();

                if (hasValidSession && !isSessionExpired()) {
                    console.info("✅ Session validated successfully");
                    setIsRefreshing(false);
                    setRefreshAttempted(false);
                    return;
                }

                const shopParam = searchParamsRef.current.get("shop") || shop;
                const hostParam = searchParamsRef.current.get("host");

                if (!shopParam) {
                    console.error(
                        "❌ Missing shop param, cannot refresh session",
                    );
                    setTimeout(() => router.push("/api/auth"), 0);
                    return;
                }

                console.info("🔄 Attempting session refresh...");
                const response = await fetch("/api/session/refresh", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ shop: shopParam, host: hostParam }),
                });

                const data = await response.json();

                if (data.success && data.session?.token) {
                    console.info("✅ Session refreshed successfully");
                    updateSessionToken(data.session.token);
                    setIsRefreshing(false);
                    setRefreshAttempted(false);
                    return;
                }

                throw new Error("Session refresh failed");
            } catch (error) {
                console.warn("❌ Session validation or refresh failed:", error);
                clearSession();

                const shopParam = searchParamsRef.current.get("shop") || shop;
                const authUrl = `/api/auth?returnTo=${encodeURIComponent(pathnameRef.current)}${
                    shopParam ? `&shop=${shopParam}` : ""
                }`;

                setTimeout(() => router.push(authUrl), 0);
            } finally {
                setIsRefreshing(false);
            }
        };

        void refreshSession();
    }, [
        isInitialized,
        hasValidSession,
        sessionToken,
        router,
        refreshAttempted,
        isThemeExtension,
        isRefreshing,
        validateSession,
        clearSession,
        updateSessionToken,
        shop,
        isSessionExpired,
    ]);

    const isAuthenticated = hasValidSession && !isSessionExpired();
    return {
        isInitialized,
        isAuthenticated,
        sessionToken,
        isRefreshing,
        isThemeExtension,
        hasValidSession,
    };
}
