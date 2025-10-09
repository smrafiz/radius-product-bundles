"use client";

import { useAppNavigation } from "@/shared";
import { PlusIcon } from "@shopify/polaris-icons";
import { EmptyState, Text } from "@shopify/polaris";

/*
 * Dashboard bundles empty state
 */
export function DashboardBundlesEmpty({ error }: { error?: string | null }) {
    const { bundleData } = useAppNavigation();

    return (
        <EmptyState
            heading={
                error ? "Unable to load bundles" : "No bundles created yet"
            }
            action={
                error
                    ? undefined
                    : {
                          content: "Create Bundle",
                          icon: PlusIcon,
                          onAction: bundleData.create(),
                      }
            }
            image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
        >
            <Text as="p" variant="bodyMd" tone="subdued">
                {error
                    ? "Something went wrong while loading your bundles. Please try refreshing the page."
                    : "Get started by creating your first bundle to manage product offers."}
            </Text>
        </EmptyState>
    );
}
