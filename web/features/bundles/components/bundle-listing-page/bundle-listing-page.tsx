"use client";
import { useEffect, useState } from "react";

import { GlobalBanner, MetricCard } from "@/shared";
import { Toast } from "@shopify/polaris";
import {
    BundleTable,
    BundleTableSkeleton,
    useBundlesPage,
} from "@/features/bundles";

/**
 * Bundle listing page
 */
export function BundleListingPage() {
    const {
        metrics,
        showTableSkeleton,
        isMetricsLoading,
        toast,
        onCreateBundle,
        onBundleStudio,
        onDismissToast,
    } = useBundlesPage();

    useEffect(() => {
        if (
            toast.active &&
            typeof shopify !== 'undefined' &&
            shopify.toast?.show
        ) {
            shopify.toast.show(toast.message, {
                duration: 5000,
                onDismiss: onDismissToast,
            });
        }
    }, [toast.active, toast.message, onDismissToast]);

    return (
        <s-page>
            <s-stack
                gap="large"
                paddingBlockStart="large"
                paddingBlockEnd="large"
            >
                <s-stack
                    direction="inline"
                    gap="base"
                    alignItems="center"
                    justifyContent="space-between"
                >
                    <s-stack>
                        <s-heading>
                            <div className="text-xl">Bundle Management</div>
                        </s-heading>
                        <s-text>
                            Create and manage your product bundle offers
                        </s-text>
                    </s-stack>

                    <s-stack direction="inline" gap="small-200">
                        <s-button
                            icon="view"
                            variant="secondary"
                            accessibilityLabel="Bundle Studio"
                            onClick={onBundleStudio}
                        >
                            Bundle Studio
                        </s-button>
                        <s-button
                            icon="plus"
                            variant="primary"
                            accessibilityLabel="Create Bundle"
                            onClick={onCreateBundle}
                        >
                            Create Bundle
                        </s-button>
                    </s-stack>
                </s-stack>

                <s-stack gap="base">
                    {/* Banner */}
                    <GlobalBanner />

                    {/* Metrics overview */}
                    <s-stack gap="base">
                        <s-grid
                            gridTemplateColumns="repeat(auto-fit, minmax(200px, 1fr))"
                            gap="base"
                            justifyContent="center"
                        >
                            {metrics.map((metric, index) => (
                                <s-grid-item key={index} gridColumn="auto">
                                    <MetricCard
                                        key={index}
                                        {...metric}
                                        loading={isMetricsLoading}
                                    />
                                </s-grid-item>
                            ))}
                        </s-grid>
                    </s-stack>

                    {/* Bundle list */}
                    <s-stack>
                        {showTableSkeleton ? (
                            <BundleTableSkeleton />
                        ) : (
                            <BundleTable />
                        )}
                    </s-stack>
                </s-stack>
            </s-stack>
        </s-page>
    );
}
