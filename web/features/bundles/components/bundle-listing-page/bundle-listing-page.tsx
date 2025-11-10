"use client";

import { GlobalBanner, MetricCard } from "@/shared";
import { ColorIcon, PlusIcon } from "@shopify/polaris-icons";
import { Frame, Layout, Page, Toast } from "@shopify/polaris";
import {
    BundleTable,
    BundleTableSkeleton,
    useBundlesPage,
} from "@/features/bundles";

/**
 * Bundle listing page
 */
export function BundleListingPage() {
    const {
        metrics,
        isMetricsLoading,
        showTableSkeleton,
        toast,
        onCreateBundle,
        onBundleStudio,
        onDismissToast,
    } = useBundlesPage();

    return (
        <Frame>
            <Page
                title="Bundle Management"
                subtitle="Create and manage your product bundle offers"
                primaryAction={{
                    content: "Create Bundle",
                    icon: PlusIcon,
                    onAction: onCreateBundle,
                }}
                secondaryActions={[
                    {
                        content: "Bundle Studio",
                        icon: ColorIcon,
                        onAction: onBundleStudio,
                    },
                ]}
            >
                <Layout>
                    {/* Banner */}
                    <GlobalBanner />

                    {/* Metrics overview */}
                    <Layout.Section>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {metrics.map((metric, index) => (
                                <MetricCard
                                    key={index}
                                    {...metric}
                                    loading={isMetricsLoading}
                                />
                            ))}
                        </div>
                    </Layout.Section>

                    {/* Bundle list */}
                    <Layout.Section>
                        {showTableSkeleton ? (
                            <BundleTableSkeleton />
                        ) : (
                            <BundleTable />
                        )}
                    </Layout.Section>
                </Layout>

                {toast.active && (
                    <Toast content={toast.message} onDismiss={onDismissToast} />
                )}
            </Page>
        </Frame>
    );
}
