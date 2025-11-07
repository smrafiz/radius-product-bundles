import { useSyncStore } from "@/shared";
import { useDashboardStore } from "@/features/dashboard";
import { useBundleListingStore } from "@/features/bundles";

export function useSyncBundles() {
    useSyncStore(
        useBundleListingStore,
        (state) => state.bundles,
        useDashboardStore,
        (target, bundles) => {
            const safeBundles = Array.isArray(bundles) ? bundles : [];
            const activeBundlesCount = safeBundles.filter(
                (bundle) => bundle.status === "ACTIVE",
            ).length;
            const totalBundlesCount = safeBundles.length;

            return {
                ...target,
                bundles: safeBundles,
                metrics: target.metrics
                    ? {
                          ...target.metrics,
                          activeBundles: activeBundlesCount,
                          totalBundles: totalBundlesCount,
                      }
                    : null,
            };
        },
    );
}
