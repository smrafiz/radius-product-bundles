"use client";

import {
    AIInsights,
    DashboardBundles,
    DashboardMetrics,
    DashboardQuickActions,
    useDashboardData,
    useDashboardStore,
} from "@/features/dashboard";
import { useShallow } from "zustand/react/shallow";
import { Box, Layout, Page, Toast } from "@shopify/polaris";
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
        <Box padding="400">
            <Page
                title="Dashboard"
                subtitle="Welcome to Radius Product Bundles"
                primaryAction={{
                    content: "Create Bundle",
                    icon: PlusIcon,
                    onAction: bundleData.create(),
                }}
                secondaryActions={[
                    {
                        content: "View Analytics",
                        icon: ChartVerticalIcon,
                        onAction: analytics(),
                    },
                ]}
            >
                <Layout>
                    {/* Banner */}
                    <GlobalBanner />

                    {/* Metrics overview */}
                    <Layout.Section>
                        <DashboardMetrics />
                    </Layout.Section>

                    {/* Recent bundles */}
                    <Layout.Section>
                        <DashboardBundles />
                    </Layout.Section>

                    {/* Quick actions */}
                    <Layout.Section>
                        <DashboardQuickActions />
                    </Layout.Section>

                    {/* AI insights */}
                    <Layout.Section>
                        <AIInsights />
                    </Layout.Section>
                </Layout>

                {/* Toast notifications */}
                {toast.active && (
                    <Toast content={toast.message} onDismiss={hideToast} />
                )}
            </Page>
        </Box>
    );
}
