"use client";

import { useAppNavigation } from "@/shared";
import { ViewIcon } from "@shopify/polaris-icons";
import { BlockStack, Button, InlineStack, Text } from "@shopify/polaris";

/*
 * Dashboard bundles header
 */
export function DashboardBundlesHeader() {
    const { bundleData } = useAppNavigation();

    return (
        <InlineStack blockAlign="center" align="space-between" gap="400">
            <BlockStack gap="200">
                <Text as="h2" variant="headingMd">
                    Top Performing Bundles
                </Text>
                <Text as="p" variant="bodyMd" tone="subdued">
                    Check out the top performing bundles across your store.
                </Text>
            </BlockStack>
            <Button icon={ViewIcon} onClick={bundleData.list()}>
                View All
            </Button>
        </InlineStack>
    );
}
