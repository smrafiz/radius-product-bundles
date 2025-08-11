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
                                    <div
                                        style={{
                                            width: "20px",
                                            height: "20px",
                                            border: "2px solid #e1e3e5",
                                            borderTop: "2px solid #008060",
                                            borderRadius: "50%",
                                            animation:
                                                "spin 1s linear infinite",
                                        }}
                                    />
                                    <Text
                                        variant="bodyMd"
                                        alignment="center"
                                        tone="subdued"
                                        as="p"
                                    >
                                        Loading bundles...
                                    </Text>
                                </InlineStack>
                                <style jsx>{`
                                    @keyframes spin {
                                        0% {
                                            transform: rotate(0deg);
                                        }
                                        100% {
                                            transform: rotate(360deg);
                                        }
                                    }
                                `}</style>
                            </Box>
                        </Card>
                    </Layout.Section>
                </Layout>
            </Page>
        </Frame>
    );
}
