"use client";

import { withLoader } from "@/utils";
import { metricsConfig } from "@/config";
import { useRouter } from "next/navigation";
import { GlobalBanner } from "@/components";
import { useBundlesData, useDashboardData } from "@/hooks";
import { ColorIcon, PlusIcon } from "@shopify/polaris-icons";
import { Frame, Layout, Page, Toast } from "@shopify/polaris";
import { BundleTable } from "@/bundles/_components/BundleTable";
import { MetricCard } from "@/app/dashboard/_components/MetricCard";
import { useBundleListingStore, useDashboardStore } from "@/stores";
import { BundleSkeleton } from "@/bundles/_components/BundleSkeleton";
import { BundleErrorCard } from "@/bundles/_components/BundleErrorCard";

export default function Bundles() {
    const router = useRouter();
    const { metrics } = useDashboardStore();

    // Load data
    useBundlesData();
    useDashboardData();

    const { loading, toast, hideToast } = useBundleListingStore();

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
                    <GlobalBanner />
                    <Layout.Section>
                        <BundleErrorCard />
                    </Layout.Section>

                    <Layout.Section>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {metricsConfig(metrics).map((metric, index) => (
                                <MetricCard
                                    key={index}
                                    title={metric.title}
                                    value={metric.value}
                                    comparisonLabel={metric.comparisonLabel}
                                    growth={metric.growth}
                                    tone={metric.tone}
                                />
                            ))}
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
