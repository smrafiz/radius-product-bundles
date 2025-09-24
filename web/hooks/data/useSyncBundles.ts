import { useSyncStore } from "@/hooks";
import { useBundleListingStore, useDashboardStore } from "@/stores";

export function useSyncBundles() {
    useSyncStore(
        useBundleListingStore,
        (state) => state.bundles,
        useDashboardStore,
        (target, bundles) => {
            // Calculate active bundles count
            const activeBundlesCount = bundles.filter(bundle => bundle.status === 'ACTIVE').length;

            return {
                ...target,
                bundles,
                // Also update the metrics with calculated active bundles
                metrics: target.metrics ? {
                    ...target.metrics,
                    activeBundles: activeBundlesCount
                } : null
            };
        }
    );
}