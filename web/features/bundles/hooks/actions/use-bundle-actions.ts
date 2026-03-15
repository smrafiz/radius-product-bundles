"use client";

import {
    BundleListItem,
    BundleStatus,
    invalidateBundleCache,
    useBundleListingStore,
} from "@/features/bundles";
import { useMemo } from "react";
import {
    deleteBundleAction,
    duplicateBundleAction,
    updateBundleStatusAction,
} from "@/features/bundles/actions";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useAppBridge } from "@shopify/app-bridge-react";
import { useAppNavigation, useGlobalBanner } from "@/shared";
import { useTranslations } from "@/lib/i18n/provider";

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
    const { showError } = useGlobalBanner();
    const t = useTranslations("Bundles.Actions");
    const tc = useTranslations("Bundles.Common");

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
                if (!bundle) {
                    throw new Error("Bundle not found");
                }

                useBundleListingStore.getState().openViewBundle(bundle);
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

                    if (result.status === "success") {
                        if (result.data?.bundle?.id) {
                            await invalidateBundleCache(queryClient);
                            if (clearSelection) {
                                clearSelection();
                            }
                            showToast(
                                result.message ??
                                    tc("duplicateSuccess"),
                            );
                        }
                    } else {
                        showError(tc("duplicateFailed"), {
                            content:
                                result.message ??
                                t("somethingWentWrong"),
                        });
                    }
                } catch (error) {
                    console.error("Error duplicating bundle:", error);
                    showError(tc("duplicateFailed"));
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
                            result.message ?? tc("deleteSuccess"),
                        );
                    } else {
                        showError(result.message ?? tc("deleteFailed"));
                    }
                } catch (error) {
                    console.error("Error deleting bundle:", error);
                    showError(tc("deleteFailed"));
                }
            },

            status: async (
                status: BundleStatus,
                startDate?: string,
                endDate?: string,
            ) => {
                if (!bundle) {
                    throw new Error("Bundle not found");
                }

                try {
                    const token = await app.idToken();
                    const result = await updateBundleStatusAction(
                        token,
                        bundle.id,
                        status,
                        startDate,
                        endDate,
                    );

                    if (result.status === "success") {
                        updateBundleInStore(bundle.id, {
                            status: result.data.status,
                        });
                        await invalidateBundleCache(queryClient);
                        showToast(
                            result.message ??
                                t("statusUpdated"),
                        );
                    } else {
                        showError(
                            result.message ?? t("statusUpdateFailed"),
                        );
                    }
                } catch (error) {
                    console.error("Error updating bundle status:", error);
                    showError(t("statusUpdateFailed"));
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
