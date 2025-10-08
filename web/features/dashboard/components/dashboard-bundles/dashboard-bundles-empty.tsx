"use client";

import { Box, BlockStack, Text, Button } from "@shopify/polaris";

export function DashboardBundlesEmpty({ error }: { error?: string | null }) {
    return (
        <Box padding="400">
            <BlockStack gap="300" align="center">
                <Text as="p" variant="bodyMd" tone="subdued">
                    {error
                        ? "Unable to load bundles"
                        : "No bundles created yet"}
                </Text>
                <Button variant="primary" url="/bundles/create">
                    Create Your First Bundle
                </Button>
            </BlockStack>
        </Box>
    );
}