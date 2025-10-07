"use client";

import {
    AIInsights,
    BundleList,
    ErrorCard,
    PageSkeleton,
} from "@/dashboard/_components";
import { MetricCard } from "@/components";
import { useRouter } from "next/navigation";
import { Frame, Layout, Page, Toast } from "@shopify/polaris";
import { ChartVerticalIcon, PlusIcon } from "@shopify/polaris-icons";
import { formatCurrency, formatPercentage, withLoader } from "@/utils";
import { QuickActions } from "@/app/dashboard/_components/QuickActions";

import { useDashboardStore } from "@/stores";
import { useDashboardData, useSyncBundles } from "@/hooks";

export default function Dashboard() {
    const router = useRouter();
    const { loading, error, metrics, bundles, toast, hideToast } =
        useDashboardStore();

    // Load data
    useDashboardData();
    useSyncBundles();

    if (loading) {
        return <PageSkeleton />;
    }

    const activeBundles = bundles.filter(
        (bundle) => bundle.status === "ACTIVE",
    ).length;

    return (
        <Frame>
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
                    {error && (
                        <Layout.Section>
                            <ErrorCard error={error} />
                        </Layout.Section>
                    )}

                    <Layout.Section>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <MetricCard
                                title="Total Revenue"
                                value={formatCurrency(
                                    metrics?.totalRevenue || 0,
                                )}
                                growth={metrics?.revenueGrowth}
                            />
                            <MetricCard
                                title="Conversion Rate"
                                value={formatPercentage(
                                    metrics?.avgConversionRate || 0,
                                )}
                                growth={metrics?.conversionGrowth}
                            />
                            <MetricCard
                                title="Active Bundles"
                                value={(activeBundles || 0).toString()}
                                action={{ label: "View all", url: "/bundles" }}
                                comparisonLabel="Total created"
                            />
                            <MetricCard
                                title="Total Views"
                                value={(
                                    metrics?.totalViews || 0
                                ).toLocaleString()}
                                action={{
                                    label: "View details",
                                    url: "/analytics",
                                }}
                                comparisonLabel="Last 30 days"
                            />
                        </div>
                    </Layout.Section>

                    <Layout.Section>
                        <BundleList />
                    </Layout.Section>

                    <Layout.Section>
                        <QuickActions />
                    </Layout.Section>

                    <Layout.Section>
                        <AIInsights />
                    </Layout.Section>
                </Layout>

                {toast.active && (
                    <Toast content={toast.message} onDismiss={hideToast} />
                )}
            </Page>
        </Frame>
    );
}
