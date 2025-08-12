"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Frame, Layout, Page, Toast } from "@shopify/polaris";
import { PlusIcon } from "@shopify/polaris-icons";

import { useBundlesData } from "@/hooks/useBundlesData";
import { useBundlesStore } from "@/lib/stores/bundlesStore";
import { BundleTable } from "@/app/bundles/_components/BundleTable";
import { BundleSkeleton } from "@/app/bundles/_components/BundleSkeleton";
import { BundleErrorCard } from "@/app/bundles/_components/BundleErrorCard";
import { BundleNavigation } from "@/app/bundles/_components/BundleNavigation";

export default function Bundles() {
    const router = useRouter();

    // Load data using the hook
    useBundlesData();

    // Get state from the store
    const { loading, toast, hideToast } = useBundlesStore();

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
