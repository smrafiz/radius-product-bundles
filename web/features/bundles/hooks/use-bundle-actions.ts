"use client";

import {
    BundleListItem,
    BundleStatus,
    deleteBundleAction,
    duplicateBundleAction,
    invalidateBundleCache,
    updateBundleStatusAction,
    useBundleListingStore,
} from "@/features/bundles";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAppNavigation } from "@/shared";
import { useQueryClient } from "@tanstack/react-query";
import { useAppBridge } from "@shopify/app-bridge-react";

/**
 * Get bundle actions
 */
export function useBundleActions(
    bundle: BundleListItem | null,
    clearSelection?: () => void,
) {
    const app = useAppBridge();
    const { bundleData } = useAppNavigation();
    const router = useRouter();
    const queryClient = useQueryClient();

    const showToast = useBundleListingStore((s) => s.showToast);
    const removeBundleFromStore = useBundleListingStore(
        (s) => s.removeBundleFromStore,
    );
    const refreshBundles = useBundleListingStore((s) => s.refreshBundles);
    const pagination = useBundleListingStore((s) => s.pagination);
    const updateBundleInStore = useBundleListingStore(
        (s) => s.updateBundleInStore,
    );

    const actions = useMemo(
        () => ({
            edit: () => {
                if (!bundle) {
                    throw new Error("Bundle not found");
                }

                bundleData.edit(bundle.id);
            },

            view: () => {
                console.log("View button clicked");
            },

            duplicate: async () => {
                if (!bundle) {
                    throw new Error("Bundle not found");
                }

                try {
                    const token = await app.idToken();
                    const result = await duplicateBundleAction(
                        token,
                        bundle.id,
                    );

                    console.log(result);

                    if (result.status === "success") {
                        if (result.data?.bundle?.id) {
                            await invalidateBundleCache(queryClient);
                            if (clearSelection) {
                                clearSelection();
                            }
                            showToast(
                                result.message ??
                                    "Bundle duplicated successfully",
                            );
                        }
                    } else {
                        showToast(
                            result.message ?? "Failed to duplicate bundle",
                        );
                    }
                } catch (error) {
                    console.error("Error duplicating bundle:", error);
                    showToast("Failed to duplicate bundle");
                }
            },

            delete: async () => {
                if (!bundle) {
                    return;
                }

                try {
                    const token = await app.idToken();
                    const result = await deleteBundleAction(token, bundle.id);

                    if (result.status === "success") {
                        await invalidateBundleCache(queryClient);
                        if (clearSelection) {
                            clearSelection();
                        }
                        showToast(
                            result.message ?? "Bundle deleted successfully",
                        );
                    } else {
                        showToast(result.message ?? "Failed to delete bundle");
                    }
                } catch (error) {
                    showToast("Failed to delete bundle");
                    console.error("Error deleting bundle:", error);
                }
            },

            status: async (status: BundleStatus) => {
                if (!bundle) {
                    throw new Error("Bundle not found");
                }

                try {
                    const token = await app.idToken();
                    const result = await updateBundleStatusAction(
                        token,
                        bundle.id,
                        status,
                    );

                    if (result.status === "success") {
                        updateBundleInStore(bundle.id, {
                            status: result.data.status,
                        });
                        await invalidateBundleCache(queryClient);
                        showToast(
                            result.message ??
                                "Bundle status updated successfully",
                        );
                    } else {
                        showToast(
                            result.message ?? "Failed to update bundle status",
                        );
                    }
                } catch (error) {
                    showToast("Failed to update bundle status");
                    console.error("Error updating bundle status:", error);
                }
            },
        }),
        [
            bundle?.id,
            router,
            app,
            showToast,
            removeBundleFromStore,
            refreshBundles,
            updateBundleInStore,
            queryClient,
            pagination.currentPage,
            pagination.itemsPerPage,
        ],
    );

    return { actions };
}
