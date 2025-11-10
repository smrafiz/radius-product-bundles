"use client";

import { BundleTable, BundleTableSkeleton, useBundlesPage, } from "@/features/bundles";
import { useEffect } from "react";
import { GlobalBanner, MetricCard } from "@/shared";

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
            typeof shopify !== "undefined" &&
            shopify.toast?.show
        ) {
            shopify.toast.show(toast.message, {
                duration: 5000,
                onDismiss: onDismissToast,
            });
        }
    }, [toast.active, toast.message, onDismissToast]);

    return (
        <s-page heading="Bundle Management">
            {/* Header buttons */}
            <s-button slot="primary-action" variant="primary" onClick={onCreateBundle}>
                Create Bundle
            </s-button>
            <s-button slot="secondary-actions" variant="secondary" onClick={onBundleStudio}>
                Bundle Studio
            </s-button>

            <s-stack
                gap="large"
                paddingBlockStart="large"
                paddingBlockEnd="large"
            >
                <s-stack>
                    <s-heading>
                        <div className="text-xl text-center">Bundle Management</div>
                    </s-heading>
                    <s-text>
                        <div className="text-center">Create and manage your product bundle offers</div>
                    </s-text>
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
