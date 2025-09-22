"use client";

import {
    Box,
    Card,
    Frame,
    Layout,
    Page,
    SkeletonBodyText,
    SkeletonDisplayText,
    Toast,
} from "@shopify/polaris";
import { withLoader } from "@/utils";
import { metricsConfig } from "@/config";
import { useRouter } from "next/navigation";
import { GlobalBanner, MetricCard } from "@/components";
import { ColorIcon, PlusIcon } from "@shopify/polaris-icons";
import { BundleErrorCard, BundleTable } from "@/bundles/_components";

import { useBundlesData, useDashboardData } from "@/hooks";
import { useBundleListingStore, useDashboardStore } from "@/stores";

/*
 * Bundles page
 */
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
                        {loading ? (
                            <Card>
                                <Box padding="400">
                                    <SkeletonDisplayText
                                        size="small"
                                        maxWidth="20ch"
                                    />
                                    <div className="mt-4 space-y-4 animate-pulse">
                                        {[1, 2, 3, 4, 5].map((row) => (
                                            <SkeletonBodyText
                                                key={row}
                                                lines={1}
                                            />
                                        ))}
                                    </div>
                                </Box>
                            </Card>
                        ) : (
                            <BundleTable />
                        )}
                    </Layout.Section>
                </Layout>

                {toast.active && (
                    <Toast content={toast.message} onDismiss={hideToast} />
                )}
            </Page>
        </Frame>
    );
}
