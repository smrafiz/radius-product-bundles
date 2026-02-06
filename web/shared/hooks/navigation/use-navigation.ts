"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { ROUTES, withLoader } from "@/shared";

/*
 * Navigation hooks
 */
export function useAppNavigation() {
    const router = useRouter();

    // Generic navigation with loader
    const goTo = useCallback(
        (path: string) => {
            return withLoader(() => router.push(path));
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
                    type
                        ? ROUTES.CREATE_BUNDLE_TYPE(type)
                        : ROUTES.BUNDLE_CREATE,
                ),
            edit: (id: string) => goTo(ROUTES.BUNDLE_EDIT(id))(),
            studio: () => goTo(ROUTES.BUNDLE_STUDIO),
        },

        analytics: () => withLoader(() => router.push(ROUTES.ANALYTICS))(),
        settings: () => goTo(ROUTES.SETTINGS),

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
