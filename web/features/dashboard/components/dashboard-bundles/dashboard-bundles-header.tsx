"use client";

import { router } from "next/client";
import { withLoader } from "@/shared";
import { ViewIcon } from "@shopify/polaris-icons";
import { InlineStack, BlockStack, Text, Button } from "@shopify/polaris";

export function DashboardBundlesHeader() {
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
            <Button
                icon={ViewIcon}
                onClick={withLoader(() => router.push("/bundles"))}
            >
                View All
            </Button>
        </InlineStack>
    );
}