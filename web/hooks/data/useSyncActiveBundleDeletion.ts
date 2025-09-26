import { useRouter } from "next/navigation";
import { useSyncStore } from "@/hooks/utils";
import { useBundleListingStore, useBundleStore } from "@/stores";

export function useSyncActiveBundleDeletion(redirectOnDeletion = true) {
    const router = useRouter();

    useSyncStore(
        useBundleListingStore,
        (state) => state.bundles,
        useBundleStore,
        (target, bundles) => {
            const wasReset = target.handleActiveBundleDeletion(bundles);

            if (wasReset && redirectOnDeletion) {
                useBundleListingStore.getState().showToast("Bundle was deleted and removed from workspace");
                router.push('/bundles');
            }

            return target;
        }
    );
}