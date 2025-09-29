import { withLoader } from "@/utils";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppBridge } from "@shopify/app-bridge-react";

import { BundleListItem } from "@/types";
import { duplicateBundle } from "@/actions";
import { useBundleListingStore } from "@/stores";

export function useBundleActions(bundle: BundleListItem) {
    const app = useAppBridge();
    const router = useRouter();
    const showToast = useBundleListingStore((s) => s.showToast);
    const removeBundleFromStore = useBundleListingStore((s) => s.removeBundleFromStore);
    const refreshBundles = useBundleListingStore((s) => s.refreshBundles);

    const [duplicating, setDuplicating] = useState(false);

    const actions = useMemo(() => ({
        edit: () => {
            withLoader(() => router.push(`/bundles/${bundle.id}/edit`))();
        },

        view: () => {
            console.log('View button clicked');
        },

        duplicate: async () => {
            if (duplicating) return;
            setDuplicating(true);
            try {
                const token = await app.idToken();
                const result = await duplicateBundle(token, bundle.id);

                if (result.status === "success") {
                    showToast(result.message);

                    if (result.data?.id) {
                        await refreshBundles();
                    }
                } else {
                    showToast(result.message || "Failed to duplicate bundle");
                }
            } catch (error) {
                showToast("Failed to duplicate bundle");
            } finally {
                setDuplicating(false);
            }
        },

        delete: () => {
            removeBundleFromStore(bundle.id);
        },
    }), [bundle.id, duplicating, router, app, showToast, removeBundleFromStore]);

    return { actions, duplicating };
}