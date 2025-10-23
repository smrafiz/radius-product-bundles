"use client";

import {
    AIInsights,
    DashboardBundles,
    DashboardMetrics,
    DashboardQuickActions,
    DashboardSetUpGuide,
    DashboardVideo,
    DashboardCalloutCards,
    DashboardMediaCard,
    useDashboardData,
} from "@/features/dashboard";
import { GlobalBanner, useAppNavigation, useSyncBundles } from "@/shared";

/**
 * Main Dashboard Page Component
 */
export function DashboardPage() {
    const { bundleData, analytics } = useAppNavigation();

    // Load dashboard data
    useDashboardData();

    // Sync bundles from the store
    useSyncBundles();

    return (
        <s-page>
            <s-stack gap="large" paddingBlockStart="large" paddingBlockEnd="large">
                <s-stack direction='inline' alignItems="center" justifyContent="space-between">
                    <s-heading>
                        <div className='text-xl'>RadiusTheme Product Bundle</div>
                    </s-heading>
                    <s-stack direction="inline" gap="small-200">
                        <s-button
                            icon="view"
                            variant="secondary"
                            accessibilityLabel="View Analytics"
                            onClick={analytics()}
                        >View Analytics</s-button>
                        <s-button
                            icon="plus"
                            variant="primary"
                            accessibilityLabel="Create Bundle"
                            onClick={bundleData.create()}
                        >Create Bundle</s-button>
                    </s-stack>
                </s-stack>

                <s-stack gap="base">

                    {/* Banner */}
                    <GlobalBanner />

                    {/*Setup Guide*/}
                    <DashboardSetUpGuide />

                    {/* Metrics overview */}
                    <DashboardMetrics />

                    {/* Recent bundles */}
                    <DashboardBundles />

                    {/* Quick actions */}
                    <DashboardQuickActions />

                    {/* Video actions */}
                    <DashboardVideo />

                    {/* Callout Cards */}
                    <DashboardCalloutCards />

                    {/* Media Cards */}
                    <DashboardMediaCard />

                    {/* AI insights */}
                    <AIInsights />

                </s-stack>
            </s-stack>
        </s-page>
    );
}
