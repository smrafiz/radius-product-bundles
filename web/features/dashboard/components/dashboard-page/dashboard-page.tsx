"use client";

import { useRouter } from "next/navigation";
import { Layout, Page, Toast } from "@shopify/polaris";
import { ChartVerticalIcon, PlusIcon } from "@shopify/polaris-icons";
import { withLoader } from "@/shared/utils";

import { AIInsights, DashboardBundles, DashboardMetrics, QuickActions, useDashboardData } from "@/features/dashboard";
import { ErrorCard } from "@/app/(dashboard)/dashboard/_components";
import { useDashboardStore } from "@/features/dashboard/store";
import { useShallow } from "zustand/react/shallow";
import { useSyncBundles } from "@/shared";

/**
 * Main Dashboard Page Component
 */
export function DashboardPage() {
    const router = useRouter();
    const { error, toast, hideToast } = useDashboardStore(
        useShallow((state) => ({
            error: state.error,
            toast: state.toast,
            hideToast: state.hideToast,
        }))
    );

    // Load dashboard data
    useDashboardData();

    // Sync bundles from the store
    useSyncBundles();

    return (
        <Page
            title="Dashboard"
            subtitle="Welcome to Radius Product Bundles"
            primaryAction={{
                content: "Create Bundle",
                icon: PlusIcon,
                onAction: withLoader(() => router.push("/bundles/create")),
            }}
            secondaryActions={[
                {
                    content: "View Analytics",
                    url: "/analytics",
                    icon: ChartVerticalIcon,
                },
            ]}
        >
            <Layout>
                {/* Error banner */}
                {error && (
                    <Layout.Section>
                        <ErrorCard error={error} />
                    </Layout.Section>
                )}

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
                    <QuickActions />
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
    );
}
