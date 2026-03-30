"use client";

import { useCallback } from "react";
import { useAppNavigation } from "@/shared/hooks/navigation";
import { usePlan } from "@/shared/hooks/plan/use-plan";

export function useCreateBundleNav() {
    const { bundleData } = useAppNavigation();
    const { isWithinQuota, quota } = usePlan();

    const create = useCallback(
        (type?: string): (() => void | false) => {
            return () => {
                if (!isWithinQuota("bundles")) {
                    if (typeof shopify !== "undefined" && shopify.toast?.show) {
                        const { current, limit } = quota.bundles;
                        shopify.toast.show(
                            `Bundle limit reached (${current}/${limit}). Upgrade your plan to create more bundles.`,
                            { isError: true, duration: 5000 },
                        );
                    }
                    return false;
                }
                bundleData.create(type)();
            };
        },
        [bundleData, isWithinQuota, quota.bundles],
    );

    return { create };
}
