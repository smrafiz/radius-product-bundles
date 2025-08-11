"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Box, Card, Frame, Layout, Page, Tabs, Toast } from "@shopify/polaris";
import { PlusIcon } from "@shopify/polaris-icons";

import { useBundlesData } from "@/hooks/useBundlesData";
import { useBundlesStore } from "@/lib/stores/bundlesStore";
import { BundleTable } from "@/app/bundles/_components/BundleTable";
import { BundleFilters } from "@/app/bundles/_components/BundleFilters";
import { BundleSkeleton } from "@/app/bundles/_components/BundleSkeleton";
import { BundleErrorCard } from "@/app/bundles/_components/BundleErrorCard";
import { BundleNavigation } from "@/app/bundles/_components/BundleNavigation";

export default function Bundles() {
    const router = useRouter();

    // Load data using the hook
    useBundlesData();

    // Get state from the store
    const { loading, filters, toast, setSelectedTab, hideToast } =
        useBundlesStore();

    // Tab configuration
    const tabs = [
        { id: "all", content: "All Bundles", panelID: "all-bundles" },
        { id: "active", content: "Active", panelID: "active-bundles" },
        { id: "draft", content: "Draft", panelID: "draft-bundles" },
        { id: "paused", content: "Paused", panelID: "paused-bundles" },
        { id: "scheduled", content: "Scheduled", panelID: "scheduled-bundles" },
    ];

    // Handle primary action
    const handleCreateBundle = () => {
        router.push("/bundles/new");
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
                    onAction: handleCreateBundle,
                }}
            >
                <Layout>
                    <Layout.Section>
                        <BundleErrorCard />
                    </Layout.Section>

                    <Layout.Section>
                        <BundleNavigation />
                    </Layout.Section>

                    <Layout.Section>
                        <BundleFilters />
                    </Layout.Section>

                    <Layout.Section>
                        <Card>
                            <Tabs
                                tabs={tabs}
                                selected={filters.selectedTab}
                                onSelect={setSelectedTab}
                            >
                                <Box padding="400">
                                    <BundleTable />
                                </Box>
                            </Tabs>
                        </Card>
                    </Layout.Section>
                </Layout>

                {toast.active && (
                    <Toast content={toast.message} onDismiss={hideToast} />
                )}
            </Page>
        </Frame>
    );
}
