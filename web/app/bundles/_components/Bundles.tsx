"use client";

import {
    BundleErrorCard,
    BundleTable,
    BundleTableSkeleton,
} from "@/bundles/_components";
import { GlobalBanner, MetricCard } from "@/components";
import { ColorIcon, PlusIcon } from "@shopify/polaris-icons";
import { Frame, Layout, Page, Toast } from "@shopify/polaris";

import { useBundlesPage } from "@/hooks";

export default function Bundles() {
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
                    <GlobalBanner />
                    <Layout.Section>
                        <BundleErrorCard />
                    </Layout.Section>

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
