"use client";

import { withLoader } from "@/utils";
import { metricsConfig } from "@/config";
import { useRouter } from "next/navigation";
import { GlobalBanner, MetricCard } from "@/components";
import { ColorIcon, PlusIcon } from "@shopify/polaris-icons";
import { BundleErrorCard, BundleTable } from "@/bundles/_components";
import { Box, Card, Frame, Layout, Page, SkeletonBodyText, SkeletonDisplayText, Toast, } from "@shopify/polaris";

import {
    useBundlesData,
    useBundleTableBulkActions,
    useDashboardData,
    useInitialBundleState,
    useSyncBundles,
} from "@/hooks";
import { useBundleListingStore } from "@/stores";

/**
 * Bundles page
 */
export default function Bundles() {
    useDashboardData();
    useSyncBundles();

    const router = useRouter();
    const { isLoading } = useBundlesData();
    const { handleCreateBundle } = useBundleTableBulkActions();
    const { bundles, toast, hideToast } = useBundleListingStore();
    const { metrics: liveMetrics, isMetricsFetching } = useDashboardData();

    const { showSkeleton } = useInitialBundleState({
        hasData: bundles.length > 0,
        isLoading,
    });

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
                            {metricsConfig(liveMetrics).map((metric, index) => (
                                <MetricCard
                                    key={index}
                                    title={metric.title}
                                    value={metric.value}
                                    comparisonLabel={metric.comparisonLabel}
                                    growth={metric.growth}
                                    tone={metric.tone}
                                    loading={isMetricsFetching}
                                />
                            ))}
                        </div>
                    </Layout.Section>

                    <Layout.Section>
                        {showSkeleton ? (
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
