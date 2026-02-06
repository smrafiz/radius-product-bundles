"use client";

import {
    AIInsights,
    DashboardBuilderAddons,
    DashboardBundles,
    DashboardCalloutCards,
    DashboardMediaCard,
    DashboardMetrics,
    DashboardQuickActions,
    DashboardSetUpGuide,
    DashboardVideo,
} from "@/features/dashboard";
import { useBundlesPage } from "@/features/bundles";
import { TitleBar } from "@shopify/app-bridge-react";
import { AnalyticsDisabledBanner } from "@/features/analytics";
import { useSettingsStore } from "@/features/settings";
import { GlobalBanner, useAppNavigation, useNavigationActions } from "@/shared";

/**
 * Main Dashboard Page Component
 */
export function DashboardPage() {
    const { analytics } = useAppNavigation();
    const { onCreateBundle } = useBundlesPage();
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
                <s-stack gap="base">
                    {/* Banner */}
                    <GlobalBanner />

                    {/* Setup Guide */}
                    <DashboardSetUpGuide />

                    {/* Analytics Disabled Warning */}
                    {isAnalyticsDisabled && <AnalyticsDisabledBanner />}

                    {/* Metrics overview */}
                    <DashboardMetrics />

                    {/* Recent bundles */}
                    <DashboardBundles />

                    {/* Quick actions */}
                    <DashboardQuickActions />

                    {/* Builder Addons */}
                    <DashboardBuilderAddons />

                    {/* Guidance */}
                    <DashboardMediaCard />

                    {/* Video overview */}
                    <DashboardVideo />

                    {/* Useful links */}
                    <DashboardCalloutCards />

                    {/* AI insights */}
                    <AIInsights />
                </s-stack>
            </s-stack>
        </s-page>
    );
}
