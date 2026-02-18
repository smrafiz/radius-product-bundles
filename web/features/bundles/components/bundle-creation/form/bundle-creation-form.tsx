"use client";

import {
    StepContent,
    BundlePreview,
    useBundleFormManager,
    HorizontalStepIndicator,
    BundleCreationFormProps,
    invalidateBundleCache,
} from "@/features/bundles";
import { useCallback, useState } from "react";
import { TitleBar } from "@shopify/app-bridge-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAppBridge } from "@shopify/app-bridge-react";
import { deleteBundleAction } from "@/features/bundles/actions";
import { GlobalBanner, useAppNavigation, useModalStore } from "@/shared";

/**
 * Bundle Creation Form
 */
export function BundleCreationForm({
    bundleType,
    bundleName,
    bundleId,
}: BundleCreationFormProps) {
    const { bundleData } = useAppNavigation();
    const { pageProps, isEditMode } = useBundleFormManager({
        bundleType,
        bundleName,
    });
    const { openModal } = useModalStore();
    const app = useAppBridge();
    const queryClient = useQueryClient();
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = useCallback(() => {
        if (!bundleId) return;

        openModal({
            type: "delete",
            title: "Delete bundle",
            message: `Are you sure you want to delete "${bundleName || "this bundle"}"? This action cannot be undone.`,
            confirmText: "Delete",
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
                                result.message ?? "Bundle deleted successfully",
                            );
                        }
                        bundleData.list()();
                    } else {
                        if (
                            typeof shopify !== "undefined" &&
                            shopify.toast?.show
                        ) {
                            shopify.toast.show(
                                result.message ?? "Failed to delete bundle",
                                { isError: true },
                            );
                        }
                    }
                } catch (error) {
                    console.error("Error deleting bundle:", error);
                    if (typeof shopify !== "undefined" && shopify.toast?.show) {
                        shopify.toast.show("Failed to delete bundle", {
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
        <s-page>
            <TitleBar>
                <button variant="breadcrumb" onClick={bundleData.list()}>
                    Bundles
                </button>
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
                            accessibilityLabel="Back"
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
                                accessibilityLabel="Delete bundle"
                            >
                                Delete bundle
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
