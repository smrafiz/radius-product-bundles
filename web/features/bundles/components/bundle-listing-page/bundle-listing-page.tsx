"use client";

import {
    GlobalBanner,
    MetricCard,
    useAppNavigation,
    useNavigationActions,
} from "@/shared";
import { TitleBar } from "@shopify/app-bridge-react";
import {
    BundleTable,
    BundleTableSkeleton,
    useBundlesPage,
} from "@/features/bundles";
import { useSettingsStore } from "@/features/settings";
import { AnalyticsDisabledBanner } from "@/features/analytics";

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
    } = useBundlesPage();
    const { analytics } = useAppNavigation();

    const isAnalyticsDisabled = useSettingsStore((state) => {
        const settings = state.getEffectiveData();
        return settings?.enableAnalytics === false;
    });

    const { actions, isLoading } = useNavigationActions({
        create: onCreateBundle,
        analytics: analytics,
    });

    const bundlesLoading = isLoading("create");
    const analyticsLoading = isLoading("analytics");

    return (
        <s-page>
            <TitleBar>
                {bundlesLoading || analyticsLoading ? (
                    <>
                        <s-button
                            slot="primary-action"
                            variant="primary"
                            disabled={analyticsLoading}
                            loading={bundlesLoading}
                        >
                            Create Bundle
                        </s-button>
                        <s-button
                            slot="secondary-actions"
                            variant="secondary"
                            disabled={bundlesLoading}
                            loading={analyticsLoading}
                        >
                            View Analytics
                        </s-button>
                    </>
                ) : (
                    <>
                        <button
                            variant="primary"
                            onClick={actions.create}
                            disabled={bundlesLoading}
                        >
                            Create Bundle
                        </button>
                        <button
                            onClick={actions.analytics}
                            disabled={analyticsLoading}
                        >
                            View Analytics
                        </button>
                    </>
                )}
            </TitleBar>

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

                    {/* Analytics Disabled Warning */}
                    {isAnalyticsDisabled && <AnalyticsDisabledBanner />}

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
