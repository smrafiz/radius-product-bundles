"use client";

import React from "react";
import { formatCurrency, withLoader } from "@/utils";
import { useRouter } from "next/navigation";
import { useBundlesData } from "@/hooks/useBundlesData";
import { useBundlesStore } from "@/lib/stores/bundlesStore";
import { useDashboardData } from "@/hooks/useDashboardData";
import { ColorIcon, PlusIcon } from "@shopify/polaris-icons";
import { Frame, Layout, Page, Toast } from "@shopify/polaris";
import { useDashboardStore } from "@/lib/stores/dashboardStore";
import { MetricCard } from "@/app/dashboard/_components/MetricCard";
import { BundleTable } from "@/app/bundles/_components/BundleTable";
import { BundleSkeleton } from "@/app/bundles/_components/BundleSkeleton";
import { BundleErrorCard } from "@/app/bundles/_components/BundleErrorCard";

export default function Bundles() {
    const router = useRouter();
    const { metrics } = useDashboardStore();

    // Load data using the hook
    useBundlesData();
    useDashboardData();

    // Get state from the store
    const { loading, toast, hideToast } = useBundlesStore();

    // Handle primary action
    const handleCreateBundle = () => {
        router.push("/bundles/create");
    };

    // Handle secondary action
    const handleBundleStudio = () => {
        router.push("/bundles/studio");
    };

    // Show loading skeleton
    if (loading) {
        return <BundleSkeleton />;
    }

    return (
        <Frame>
            <Page
                title="Bundle Management"
                subtitle="Create and manage your product bundle offers"
                primaryAction={{
                    content: "Create Bundle",
                    icon: PlusIcon,
                    onAction: withLoader(handleCreateBundle),
                }}
                secondaryActions={[
                    {
                        content: "Bundle Studio",
                        icon: ColorIcon,
                        onAction: withLoader(handleBundleStudio),
                    },
                ]}
            >
                <Layout>
                    <Layout.Section>
                        <BundleErrorCard />
                    </Layout.Section>

                    <Layout.Section>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <MetricCard
                                title="Active Bundles"
                                value={(metrics?.activeBundles || 0).toString()}
                                comparisonLabel="Total created"
                            />
                            <MetricCard
                                title="Total Bundles"
                                value={(metrics?.totalBundles || 0).toString()}
                                comparisonLabel="Total created"
                            />
                            <MetricCard
                                title="Total Views"
                                value={(
                                    metrics?.totalViews || 0
                                ).toLocaleString()}
                            />
                            <MetricCard
                                title="Total Revenue"
                                value={formatCurrency(
                                    metrics?.revenueAllTime || 0,
                                )}
                            />
                        </div>
                    </Layout.Section>

                    <Layout.Section>
                        <BundleTable />
                    </Layout.Section>
                </Layout>

                {toast.active && (
                    <Toast content={toast.message} onDismiss={hideToast} />
                )}
            </Page>
        </Frame>
    );
}
