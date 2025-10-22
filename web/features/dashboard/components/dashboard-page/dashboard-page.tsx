"use client";

import {
    AIInsights,
    DashboardBundles,
    DashboardMetrics,
    DashboardQuickActions, DashboardSetUpGuide,
    useDashboardData,
    useDashboardStore,
} from "@/features/dashboard";
import { useShallow } from "zustand/react/shallow";
import { Layout, Page, Toast } from "@shopify/polaris";
import { ChartVerticalIcon, PlusIcon } from "@shopify/polaris-icons";
import { GlobalBanner, useAppNavigation, useSyncBundles } from "@/shared";

/**
 * Main Dashboard Page Component
 */
export function DashboardPage() {
    const { bundleData, analytics } = useAppNavigation();
    const { toast, hideToast } = useDashboardStore(
        useShallow((state) => ({
            toast: state.toast,
            hideToast: state.hideToast,
        })),
    );

    // Load dashboard data
    useDashboardData();

    // Sync bundles from the store
    useSyncBundles();

    return (
        <s-page
            // title="Dashboard"
            // subtitle="Welcome to Radius Product Bundles"
            // primaryAction={{
            //     content: "Create Bundle",
            //     icon: PlusIcon,
            //     onAction: bundleData.create(),
            // }}
            // secondaryActions={[
            //     {
            //         content: "View Analytics",
            //         icon: ChartVerticalIcon,
            //         onAction: analytics(),
            //     },
            // ]}
        >
            <s-stack gap="large">

                <s-stack direction='inline' alignItems="center" justifyContent="space-between">
                    <s-heading>
                        <div className='text-xl'>RadiusTheme Product Bundle</div>
                    </s-heading>
                    <s-stack direction="inline" gap="small-200">
                        <s-button icon="view" variant="secondary" accessibilityLabel="View Analytics">View Analytics</s-button>
                        <s-button icon="plus" variant="primary" accessibilityLabel="Create Bundle">Create Bundle</s-button>
                    </s-stack>
                </s-stack>

                <s-stack gap="base">
                    <s-banner heading="Order archived" tone="info" dismissible>
                        This order was archived on March 7, 2017 at 3:12pm EDT.
                    </s-banner>

                    {/* Banner */}
                    <GlobalBanner />

                    {/*Setup Guide*/}
                    <DashboardSetUpGuide />

                    {/* Metrics overview */}
                    <DashboardMetrics />

                    {/* Quick actions */}
                    <DashboardQuickActions />


                </s-stack>

                {/* Banner */}
                {/*<GlobalBanner />*/}

                {/* Metrics overview */}
                {/*<Layout.Section>*/}
                {/*    <DashboardMetrics />*/}
                {/*</Layout.Section>*/}

                {/* Recent bundles */}
                {/*<Layout.Section>*/}
                {/*    <DashboardBundles />*/}
                {/*</Layout.Section>*/}

                {/* Quick actions */}
                {/*<Layout.Section>*/}
                {/*    <DashboardQuickActions />*/}
                {/*</Layout.Section>*/}

                {/* AI insights */}
                {/*<Layout.Section>*/}
                {/*    <AIInsights />*/}
                {/*</Layout.Section>*/}
            </s-stack>

            {/* Toast notifications */}
            {/*{toast.active && (*/}
            {/*    <Toast content={toast.message} onDismiss={hideToast} />*/}
            {/*)}*/}
        </s-page>
    );
}
