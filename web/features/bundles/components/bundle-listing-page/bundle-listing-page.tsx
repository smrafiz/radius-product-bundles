"use client";

import { GlobalBanner, MetricCard } from "@/shared";
import { BundleTable, BundleTableSkeleton, useBundlesPage, } from "@/features/bundles";

/**
 * Bundle listing page
 */
export function BundleListingPage() {
    const {
        metrics,
        showTableSkeleton,
        isMetricsLoading,
        onCreateBundle,
        onBundleStudio,
        isButtonLoading,
        setIsButtonLoading,
    } = useBundlesPage();

    return (
        <s-page heading="Bundle Management">
            <s-button
                slot="primary-action"
                variant="primary"
                onClick={() => {
                    setIsButtonLoading(true);
                    onCreateBundle();
                }}
                disabled={isButtonLoading}
                loading={isButtonLoading}
            >
                Create Bundle
            </s-button>
            <s-button
                slot="secondary-actions"
                variant="secondary"
                onClick={() => onBundleStudio()}
            >
                Bundle Studio
            </s-button>

            <s-stack
                gap="large"
                paddingBlockStart="large"
                paddingBlockEnd="large"
            >
                <s-stack>
                    <div className="text-center">
                        <s-heading>
                            <div className="text-base text-center">
                                Bundle Management
                            </div>
                        </s-heading>
                        <s-text color="subdued">
                            Create and manage your product bundle offers
                        </s-text>
                    </div>
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
