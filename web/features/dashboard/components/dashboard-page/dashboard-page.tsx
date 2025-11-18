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
        <s-page heading="Product Bundle">
            {/* Header buttons */}
            <s-button
                slot="secondary-actions"
                variant="secondary"
                onClick={analytics()}
            >
                View Analytics
            </s-button>
            <s-button
                slot="primary-action"
                variant="primary"
                onClick={bundleData.create()}
            >
                Create Bundle
            </s-button>

            <s-stack
                gap="large"
                paddingBlockStart="large"
                paddingBlockEnd="large"
            >
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
