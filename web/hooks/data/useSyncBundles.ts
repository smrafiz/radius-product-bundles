import { useSyncStore } from "@/hooks";
import { useBundleListingStore, useDashboardStore } from "@/stores";

export function useSyncBundles() {
    useSyncStore(
        useBundleListingStore,
        (state) => state.bundles,
        useDashboardStore,
        (target, bundles) => {
            const activeBundlesCount = bundles.filter(bundle => bundle.status === 'ACTIVE').length;
            const totalBundlesCount = bundles.length;

            return {
                ...target,
                bundles,
                metrics: target.metrics ? {
                    ...target.metrics,
                    activeBundles: activeBundlesCount,
                    totalBundles: totalBundlesCount,
                } : null
            };
        }
    );
}