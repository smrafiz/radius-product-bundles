"use client";

import {
    AIInsights,
    DashboardVideo,
    DashboardBundles,
    DashboardMetrics,
    DashboardMediaCard,
    DashboardSetUpGuide,
    DashboardQuickActions,
    DashboardCalloutCards,
    DashboardBuilderAddons,
} from "@/features/dashboard";
import { GlobalBanner, useAppNavigation } from "@/shared";

/**
 * Main Dashboard Page Component
 */
export function DashboardPage() {
    const { bundleData, analytics } = useAppNavigation();

    return (
        <s-page heading="Product Bundle">
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

                    {/* Setup Guide */}
                    <DashboardSetUpGuide />

                    {/* Metrics overview */}
                    <DashboardMetrics />

                    {/* Recent bundles */}
                    <DashboardBundles />

                    {/* Quick actions */}
                    <DashboardQuickActions />

                    {/* Builder Addons */}
                    <DashboardBuilderAddons/>

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
