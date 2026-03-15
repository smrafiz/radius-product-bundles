"use client";

import {
    BundleCreationFormProps,
    BundlePreview,
    HorizontalStepIndicator,
    invalidateBundleCache,
    StepContent,
    useBundleFormManager,
    useBundleStore,
} from "@/features/bundles";
import { useCallback, useState } from "react";
import { TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import { useTranslations } from "@/lib/i18n/provider";
import { useQueryClient } from "@tanstack/react-query";
import {
    deleteBundleAction,
    duplicateBundleAction,
} from "@/features/bundles/actions";
import {
    dismissSaveBar,
    GlobalBanner,
    submitForm,
    useAppNavigation,
    useModalStore,
} from "@/shared";

/**
 * Bundle Creation Form
 */
export function BundleCreationForm({
    bundleType,
    bundleName,
    bundleId,
}: BundleCreationFormProps) {
    const tc = useTranslations("Bundles.Common");
    const { bundleData } = useAppNavigation();
    const { pageProps, isEditMode } = useBundleFormManager({
        bundleType,
        bundleName,
    });
    const { openModal } = useModalStore();
    const { isSaving, isDirty, resetDirty } = useBundleStore();
    const app = useAppBridge();
    const queryClient = useQueryClient();
    const [isDeleting, setIsDeleting] = useState(false);
    const [isDuplicating, setIsDuplicating] = useState(false);

    const handleDuplicate = useCallback(() => {
        if (!bundleId) return;

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
        resetDirty,
    ]);

    const handleDelete = useCallback(() => {
        if (!bundleId) return;

        openModal({
            type: "delete",
            title: tc("deleteBundle"),
            message: tc("deleteConfirm", { name: bundleName || tc("breadcrumb") }),
            confirmText: tc("delete"),
            onConfirm: async () => {
                setIsDeleting(true);
                try {
                    const token = await app.idToken();
                    const result = await deleteBundleAction(token, bundleId);

                    if (result.status === "success") {
                        await invalidateBundleCache(queryClient);
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
    }, [bundleId, bundleName, openModal, app, queryClient, bundleData]);

    return (
        <s-page heading={isEditMode ? tc("edit") : tc("create")}>
            <TitleBar title={isEditMode ? tc("edit") : tc("create")}>
                <button variant="breadcrumb" onClick={bundleData.list()}>
                    {tc("breadcrumb")}
                </button>

                {isSaving || isDeleting || isDuplicating ? (
                    <>
                        <s-button
                            variant="primary"
                            disabled={isSaving || (isEditMode && !isDirty)}
                            loading={isSaving}
                        >
                            {isEditMode ? tc("update") : tc("publish")}
                        </s-button>
                        {isEditMode && bundleId && (
                            <s-button
                                disabled={isDuplicating}
                                loading={isDuplicating}
                            >
                                {tc("duplicate")}
                            </s-button>
                        )}
                    </>
                ) : (
                    <>
                        <button
                            variant="primary"
                            onClick={() => submitForm()}
                            disabled={!isDirty}
                        >
                            {isEditMode ? tc("update") : tc("publish")}
                        </button>
                        {isEditMode && bundleId && (
                            <button onClick={handleDuplicate}>{tc("duplicate")}</button>
                        )}
                    </>
                )}
            </TitleBar>

            <s-stack
                gap="large"
                paddingBlockStart="large"
                paddingBlockEnd="large"
            >
                {/* Header */}
                <s-stack direction="inline" gap="base">
                    <s-stack paddingBlockStart="small-500">
                        <s-button
                            onClick={pageProps.onBack()}
                            icon="arrow-left"
                            accessibilityLabel={tc("back")}
                        />
                    </s-stack>

                    <div className="flex-1 flex items-center justify-between">
                        <s-stack
                            direction="inline"
                            gap="base"
                            alignItems="center"
                        >
                            <s-heading>
                                <div className="text-xl">{pageProps.title}</div>
                            </s-heading>

                            {isEditMode && (
                                <s-badge tone="neutral">
                                    {pageProps.badgeLabel}
                                </s-badge>
                            )}
                        </s-stack>

                        {isEditMode && bundleId && (
                            <s-button
                                variant="secondary"
                                tone="critical"
                                icon="delete"
                                onClick={handleDelete}
                                loading={isDeleting}
                                accessibilityLabel={tc("deleteBundle")}
                            >
                                {tc("deleteBundle")}
                            </s-button>
                        )}
                    </div>
                </s-stack>

                {/* Content */}
                <s-stack gap="base">
                    <GlobalBanner />
                    <HorizontalStepIndicator />

                    <div className="relative">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                            {/* Left column */}
                            <div className="md:col-span-7">
                                <StepContent bundleType={bundleType} />
                            </div>

                            {/* Right column */}
                            <div className="md:col-span-5">
                                <div className="sticky top-4">
                                    <BundlePreview />
                                </div>
                            </div>
                        </div>
                    </div>
                </s-stack>
            </s-stack>
        </s-page>
    );
}
