import React from "react";
import {
    Box,
    Card,
    Frame,
    InlineStack,
    Layout,
    Page,
    Text,
} from "@shopify/polaris";

export function BundleSkeleton() {
    return (
        <Frame>
            <Page title="Bundle Management">
                <Layout>
                    <Layout.Section>
                        <Card>
                            <Box padding="400">
                                <InlineStack
                                    gap="200"
                                    align="center"
                                    blockAlign="center"
                                >
                                    <div className="w-5 h-5 border-2 border-[var(--p-color-border)] border-t-[var(--p-color-bg-fill-success)] rounded-full animate-spin" />
                                    <Text
                                        variant="bodyMd"
                                        alignment="center"
                                        tone="subdued"
                                        as="p"
                                    >
                                        Loading bundles...
                                    </Text>
                                </InlineStack>
                            </Box>
                        </Card>
                    </Layout.Section>
                </Layout>
            </Page>
        </Frame>
    );
}
