"use client";

import {
    BundleListItem,
    BundleStatus,
    deleteBundle,
    duplicateBundle,
    invalidateBundleCache,
    updateBundleStatus,
    useBundleListingStore,
} from "@/features/bundles";
import { useMemo } from "react";
import { withLoader } from "@/shared";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useAppBridge } from "@shopify/app-bridge-react";

export function useBundleActions(bundle: BundleListItem | null, clearSelection?: () => void) {
    const app = useAppBridge();
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

                withLoader(() => router.push(`/bundles/${bundle.id}/edit`))();
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
                    const result = await duplicateBundle(token, bundle.id);

                    if (result.status === "success") {
                        if (result.data?.id) {
                            await refreshBundles(
                                pagination.currentPage,
                                pagination.itemsPerPage,
                            );
                            await invalidateBundleCache(queryClient);
                            console.log(clearSelection);
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
                    const result = await deleteBundle(token, bundle.id);

                    if (result.status === "success") {
                        await refreshBundles(
                            pagination.currentPage,
                            pagination.itemsPerPage,
                        );
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
                    const result = await updateBundleStatus(
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
