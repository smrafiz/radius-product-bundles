"use client";

import {
    dismissSaveBar,
    submitForm,
    useAppNavigation,
    useModalStore,
    useCrossSellStore,
    usePlan,
    useShopSettingsStore,
} from "@/shared";
import {
    type BundleType,
    invalidateBundleCache,
    useBundleFormManager,
    useBundleStore,
} from "@/features/bundles";
import { useShallow } from "zustand/react/shallow";
import {
    deleteBundleAction,
    duplicateBundleAction,
} from "@/features/bundles/actions";
import { useCallback, useState } from "react";
import { useTranslations } from "@/lib/i18n/provider";
import { useQueryClient } from "@tanstack/react-query";
import { useAppBridge } from "@shopify/app-bridge-react";
import { useSetupGuide, useWidgetStatusStore } from "@/features/dashboard";
import { checkWidgetBlockStatusAction } from "@/features/dashboard/actions/widget-block-status.action";

export function useBundleCreationForm({
    bundleType,
    bundleName,
    bundleId,
}: {
    bundleType: BundleType;
    bundleName?: string;
    bundleId?: string;
}) {
    const tc = useTranslations("Bundles.Common");
    const tActions = useTranslations("Bundles.Actions");
    const tQuota = useTranslations("Modals.quotaExceeded");

    const { bundleData } = useAppNavigation();
    const { refreshPlan, isWithinQuota, quota, canUse } = usePlan();
    const { pageProps, isEditMode } = useBundleFormManager({
        bundleType,
        bundleName,
    });
    const { openModal } = useModalStore();
    const { open: openCrossSell } = useCrossSellStore();
    const {
        isSaving,
        isDirty,
        resetDirty,
        resetBundle,
        selectedItems,
        bundleData: storeBundleData,
    } = useBundleStore(
        useShallow((s) => ({
            isSaving: s.isSaving,
            isDirty: s.isDirty,
            resetDirty: s.resetDirty,
            resetBundle: s.resetBundle,
            selectedItems: s.selectedItems,
            bundleData: s.bundleData,
        })),
    );
    const { settings } = useShopSettingsStore();
    const myshopifyDomain = settings?.myshopifyDomain;
    const app = useAppBridge();
    const queryClient = useQueryClient();
    const { shopDomain, apiKey } = useSetupGuide();

    const [isDeleting, setIsDeleting] = useState(false);
    const [isDuplicating, setIsDuplicating] = useState(false);
    const [isCheckingStatus, setIsCheckingStatus] = useState(false);

    const handleCheckStatus = useCallback(async () => {
        setIsCheckingStatus(true);
        try {
            const token = await app.idToken();

            // Run both server-side and client-side checks in parallel
            const [result, embedActive] = await Promise.all([
                checkWidgetBlockStatusAction(token),
                detectAppEmbed(),
            ]);

            if (result.status === "success" && result.data) {
                // Combine both checks (same logic as useWidgetStatus hook)
                const combinedStatus = {
                    ...result.data,
                    hasAppEmbed: embedActive || result.data.hasAppEmbed,
                };

                useWidgetStatusStore.getState().setWidgetStatus(combinedStatus);

                const embedMissing = !combinedStatus.hasAppEmbed;
                const blockMissing = !combinedStatus.hasWidgetBlock;
                if (!embedMissing && !blockMissing) {
                    shopify?.toast?.show(tc("themeReady"));
                }
            }
        } catch {
            shopify?.toast?.show(tc("error"), { isError: true });
        } finally {
            setIsCheckingStatus(false);
        }
    }, [app, tc]);

    const handleDuplicate = useCallback(() => {
        if (!bundleId) return;

        if (!canUse("duplicate_bundle")) {
            openCrossSell(tc("duplicate"));
            return;
        }

        openModal({
            type: "duplicate",
            title: tc("duplicateTitle"),
            message: isDirty
                ? tc("duplicateConfirmUnsaved")
                : tc("duplicateConfirm"),
            confirmText: tc("duplicate"),
            onConfirm: async () => {
                setIsDuplicating(true);
                shopify?.loading(true);
                resetDirty();
                dismissSaveBar();
                try {
                    const token = await app.idToken();
                    const result = await duplicateBundleAction(token, bundleId);
                    if (
                        result.status === "success" &&
                        result.data?.bundle?.id
                    ) {
                        await invalidateBundleCache(queryClient);
                        void refreshPlan();
                        shopify?.toast?.show(
                            result.message ?? tc("duplicateSuccess"),
                        );
                        bundleData.edit(result.data.bundle.id);
                    } else {
                        shopify?.toast?.show(
                            result.message ?? tc("duplicateFailed"),
                            { isError: true },
                        );
                    }
                } catch (error) {
                    console.error("Error duplicating bundle:", error);
                    shopify?.toast?.show(tc("duplicateFailed"), {
                        isError: true,
                    });
                } finally {
                    shopify?.loading(false);
                    setIsDuplicating(false);
                }
            },
        });
    }, [
        bundleId,
        canUse,
        isDirty,
        openModal,
        openCrossSell,
        app,
        queryClient,
        bundleData,
        resetDirty,
        refreshPlan,
        tc,
    ]);

    const handleDelete = useCallback(() => {
        if (!bundleId) {
            return;
        }

        openModal({
            type: "delete",
            title: tc("deleteBundle"),
            message: tc("deleteConfirm", {
                name: bundleName || tc("breadcrumb"),
            }),
            confirmText: tc("delete"),
            onConfirm: async () => {
                setIsDeleting(true);
                try {
                    const token = await app.idToken();
                    const result = await deleteBundleAction(token, bundleId);

                    if (result.status === "success") {
                        resetBundle();
                        dismissSaveBar();
                        await invalidateBundleCache(queryClient);
                        void refreshPlan();
                        if (
                            typeof shopify !== "undefined" &&
                            shopify.toast?.show
                        ) {
                            shopify.toast.show(
                                result.message ?? tc("deleteSuccess"),
                            );
                        }
                        bundleData.list()();
                    } else {
                        if (
                            typeof shopify !== "undefined" &&
                            shopify.toast?.show
                        ) {
                            shopify.toast.show(
                                result.message ?? tc("deleteFailed"),
                                { isError: true },
                            );
                        }
                    }
                } catch (error) {
                    console.error("Error deleting bundle:", error);
                    if (typeof shopify !== "undefined" && shopify.toast?.show) {
                        shopify.toast.show(tc("deleteFailed"), {
                            isError: true,
                        });
                    }
                } finally {
                    setIsDeleting(false);
                }
            },
        });
    }, [
        bundleId,
        bundleName,
        openModal,
        app,
        queryClient,
        bundleData,
        resetBundle,
        refreshPlan,
    ]);

    const handleSubmit = useCallback(() => submitForm(), []);

    const viewPopoverId = bundleId
        ? `bundle-view-popover-edit-${bundleId}`
        : undefined;

    const overflowMenuId = bundleId
        ? `bundle-overflow-menu-${bundleId}`
        : undefined;

    const uniqueProducts = selectedItems.length
        ? [...new Map(selectedItems.map((p) => [p.productId, p])).values()]
        : [];

    const hasMainProduct =
        !!storeBundleData.mainProductId && !!storeBundleData.mainProductHandle;
    const mainProductUrl =
        hasMainProduct && myshopifyDomain
            ? `https://${myshopifyDomain}/products/${storeBundleData.mainProductHandle}`
            : null;
    const mainProductTitle = storeBundleData.productTitle;

    return {
        // Translations
        tc,
        tActions,

        // Navigation & page
        bundleData,
        pageProps,
        isEditMode,

        // Store state
        isSaving,
        isDirty,

        // Local state
        isDeleting,
        isDuplicating,
        isCheckingStatus,

        // View bundle
        viewPopoverId,
        overflowMenuId,
        uniqueProducts,
        mainProductUrl,
        mainProductTitle,
        myshopifyDomain,

        // Integration URLs
        shopDomain,
        apiKey,

        // Handlers
        handleCheckStatus,
        handleDuplicate,
        handleDelete,
        handleSubmit,
    };
}

/**
 * Detects app embed status via App Bridge shopify.app.extensions().
 * This is the same reliable method used by the dashboard.
 */
async function detectAppEmbed(): Promise<boolean> {
    try {
        const extensions = await shopify.app.extensions();
        const themeExt = extensions.find(
            (e) => e.type === "theme_app_extension",
        );
        if (!themeExt) return false;

        const activations = themeExt.activations as Array<{
            handle: string;
            target: string;
            status: string;
        }>;

        return activations.some(
            (a) =>
                a.handle === "app-embed" &&
                a.target !== "section" &&
                a.status === "active",
        );
    } catch {
        return false;
    }
}
