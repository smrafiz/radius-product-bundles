import { withLoader } from "@/utils";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppBridge } from "@shopify/app-bridge-react";

import { BundleListItem } from "@/types";
import { deleteBundle, duplicateBundle, updateBundleStatus } from "@/actions";
import { useBundleListingStore, useModalStore } from "@/stores";
import { bundleStatusConfigs } from "@/config";

export function useBundleActions(bundle: BundleListItem) {
    const app = useAppBridge();
    const router = useRouter();
    const showToast = useBundleListingStore((s) => s.showToast);
    const removeBundleFromStore = useBundleListingStore((s) => s.removeBundleFromStore);
    const refreshBundles = useBundleListingStore((s) => s.refreshBundles);
    const updateBundleInStore = useBundleListingStore(
        (s) => s.updateBundleInStore,
    );

    const actions = useMemo(() => ({
        edit: () => {
            withLoader(() => router.push(`/bundles/${bundle.id}/edit`))();
        },

        view: () => {
            console.log('View button clicked');
        },

        duplicate: async () => {
            if (!bundle) {
                throw new Error("Bundle not found");
            }

            try {
                const token = await app.idToken();
                const result = await duplicateBundle(token, bundle.id);

                if (result.status === "success") {
                    if (result.data?.id) {
                        await refreshBundles();
                        showToast(result.message);
                    }
                } else {
                    throw new Error(result.message || "Failed to duplicate bundle");
                }
            } catch (error) {
                console.error("Error duplicating bundle:", error);
                throw error instanceof Error
                    ? error
                    : new Error("Failed to duplicate bundle");
            }
        },

        delete: async () => {
            if (!bundle) {
                return;
            }

            try {
                const token = await app.idToken();
                const result = await deleteBundle(token, bundle.id);

                if (result.status === "success") {
                    await refreshBundles();
                    showToast(result.message);
                } else {
                    throw new Error(result.message || "Failed to delete bundle");
                }
            } catch (error) {
                console.error("Error deleting bundle:", error);
                throw error instanceof Error
                    ? error
                    : new Error("Failed to delete bundle");
            }
        },

        status: async (status) => {
            if (!bundle) {
                throw new Error("Bundle not found");
            }

            console.log(status);

            try {
                const token = await app.idToken();
                const result = await updateBundleStatus(token, bundle.id, status);

                if (result.status === "success") {
                    updateBundleInStore(bundle.id, { status: result.data.status });
                    showToast(result.message);
                } else {
                    throw new Error(result.message || "Failed to update bundle status");
                }
            } catch (error) {
                console.error("Error deleting bundle:", error);
                throw error instanceof Error
                    ? error
                    : new Error("Failed to update bundle status");
            }
        },
    }), [bundle.id, router, app, showToast, removeBundleFromStore]);

    return { actions };
}