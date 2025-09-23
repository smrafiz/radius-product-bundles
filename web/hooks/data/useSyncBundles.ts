import { useSyncStore } from "@/hooks";
import { useDashboardStore, useBundleListingStore } from "@/stores";

export function useSyncBundles() {
    useSyncStore(
        useBundleListingStore,
        (state) => state.bundles,
        useDashboardStore,
        (target, bundles) => ({ ...target, bundles })
    );
}