"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { ROUTES, withLoader, useShopStore } from "@/shared";

/*
 * Navigation hooks
 */
export function useAppNavigation() {
    const router = useRouter();
    const shop = useShopStore((s) => s.shop?.domain);

    // Append ?shop= to a path when available
    const withShop = (path: string) =>
        shop ? `${path}?shop=${encodeURIComponent(shop)}` : path;

    // Generic navigation with loader + scroll to top
    const goTo = useCallback(
        (path: string) => {
            return withLoader(() => {
                router.push(path);
                window.scrollTo(0, 0);
            });
        },
        [router],
    );

    return {
        // Generic method
        goTo,

        // Named shortcuts for common routes
        bundleData: {
            list: () => goTo(ROUTES.BUNDLES),
            create: (type?: string) =>
                goTo(
                    withShop(
                        type
                            ? ROUTES.CREATE_BUNDLE_TYPE(type)
                            : ROUTES.BUNDLE_CREATE,
                    ),
                ),
            edit: (id: string) => goTo(withShop(ROUTES.BUNDLE_EDIT(id)))(),
            studio: () => goTo(ROUTES.BUNDLE_STUDIO),
        },

        analytics: () => goTo(ROUTES.ANALYTICS)(),
        settings: () => goTo(ROUTES.SETTINGS)(),

        // Utilities
        goBack: (custom?: string | (() => void)) => {
            if (typeof custom === "function") {
                return custom();
            }

            if (typeof custom === "string") {
                return goTo(custom);
            }

            router.back();
        },
        refresh: () => router.refresh(),
    };
}
