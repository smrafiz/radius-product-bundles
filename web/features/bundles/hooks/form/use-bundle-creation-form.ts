"use client";

import {
    dismissSaveBar,
    submitForm,
    useAppNavigation,
    useModalStore,
    usePlan,
    useShopSettingsStore,
} from "@/shared";
import { openQuotaExceededModal } from "@/shared/utils/helpers/modal";
import {
    invalidateBundleCache,
    useBundleFormManager,
    useBundleStore,
} from "@/features/bundles";
import {
    deleteBundleAction,
    duplicateBundleAction,
} from "@/features/bundles/actions";
import { useAppBridge } from "@shopify/app-bridge-react";
import { useTranslations } from "@/lib/i18n/provider";
import { useQueryClient } from "@tanstack/react-query";
import type { BundleType } from "@/features/bundles/types";
import { useCallback, useEffect, useRef, useState } from "react";
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
    const tEmbed = useTranslations("Dashboard.AppEmbed");
    const tWidget = useTranslations("Dashboard.WidgetBlock");
    const tBoth = useTranslations("Dashboard.Integration");
    const tQuota = useTranslations("Modals.quotaExceeded");

    const { bundleData } = useAppNavigation();
    const { refreshPlan, isWithinQuota, quota } = usePlan();
    const { pageProps, isEditMode } = useBundleFormManager({
        bundleType,
        bundleName,
    });
    const { openModal } = useModalStore();
    const {
        isSaving,
        isDirty,
        resetDirty,
        resetBundle,
        selectedItems,
        bundleData: storeBundleData,
    } = useBundleStore();
    const { settings } = useShopSettingsStore();
    const myshopifyDomain = settings?.myshopifyDomain;
    const app = useAppBridge();
    const queryClient = useQueryClient();
    const { shopDomain, apiKey } = useSetupGuide();

    const [isDeleting, setIsDeleting] = useState(false);
    const [isDuplicating, setIsDuplicating] = useState(false);
    const [isCheckingStatus, setIsCheckingStatus] = useState(false);
    const [statusIssue, setStatusIssue] = useState<{
        embedMissing: boolean;
        blockMissing: boolean;
    } | null>(null);
    const statusBannerRef = useRef<React.ComponentRef<"s-banner">>(null);

    useEffect(() => {
        const el = statusBannerRef.current;
        if (!el) return;
        const handleDismiss = () => setStatusIssue(null);
        el.addEventListener("dismiss", handleDismiss);
        return () => el.removeEventListener("dismiss", handleDismiss);
    }, [statusIssue]);

    const handleCheckStatus = useCallback(async () => {
        setIsCheckingStatus(true);
        setStatusIssue(null);
        try {
            const token = await app.idToken();
            const result = await checkWidgetBlockStatusAction(token);
            if (result.status === "success" && result.data) {
                useWidgetStatusStore.getState().setWidgetStatus(result.data);
                const embedMissing = !result.data.hasAppEmbed;
                const blockMissing = !result.data.hasWidgetBlock;
                if (!embedMissing && !blockMissing) {
                    shopify?.toast?.show(tc("themeReady"));
                } else {
                    setStatusIssue({ embedMissing, blockMissing });
                }
            }
        } catch {
            shopify?.toast?.show(tc("error"), { isError: true });
        } finally {
            setIsCheckingStatus(false);
        }
    }, [app, tc]);

    const handleDuplicate = useCallback(() => {
        if (!bundleId) {
            return;
        }

        if (!isWithinQuota("bundles")) {
            openQuotaExceededModal(quota.bundles, {
                title: tQuota("heading"),
                message: tQuota("message", { current: quota.bundles.current, limit: quota.bundles.limit }),
                confirmText: tQuota("confirm"),
            });
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
        bundleName,
        isDirty,
        openModal,
        app,
        queryClient,
        bundleData,
        isWithinQuota,
        quota.bundles,
        resetDirty,
        refreshPlan,
        tQuota,
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

    const uniqueProducts = selectedItems.length
        ? [
              ...new Map(
                  selectedItems.map((p) => [p.productId, p]),
              ).values(),
          ]
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
        tEmbed,
        tWidget,
        tBoth,

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
        statusIssue,
        statusBannerRef,

        // View bundle
        viewPopoverId,
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
