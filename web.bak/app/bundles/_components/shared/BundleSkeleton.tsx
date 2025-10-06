"use client";

import {
    Frame,
    Page,
    Layout,
    Card,
    SkeletonDisplayText,
    SkeletonBodyText,
    BlockStack,
    Box,
} from "@shopify/polaris";
import { PlusIcon, ColorIcon } from "@shopify/polaris-icons";

export default function BundlePageSkeleton() {
    return (
        <Frame>
            <Page
                title="Bundle Management"
                subtitle="Create and manage your product bundle offers"
                primaryAction={{
                    content: "Create Bundle",
                    icon: PlusIcon,
                    onAction: () => {},
                    disabled: true,
                }}
                secondaryActions={[
                    {
                        content: "Bundle Studio",
                        icon: ColorIcon,
                        onAction: () => {},
                        disabled: true,
                    },
                ]}
            >
                <Layout>
                    {/* Metrics grid skeleton */}
                    <Layout.Section>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {[1, 2, 3, 4].map((i) => (
                                <Card key={i}>
                                    <Box padding="400">
                                        <BlockStack gap="200">
                                            <SkeletonDisplayText size="small" maxWidth="10ch" />
                                            <SkeletonDisplayText size="large" maxWidth="6ch" />
                                            <SkeletonBodyText lines={1} />
                                        </BlockStack>
                                    </Box>
                                </Card>
                            ))}
                        </div>
                    </Layout.Section>

                    {/* Table skeleton */}
                    <Layout.Section>
                        <Card>
                            <Box padding="400">
                                <SkeletonDisplayText size="small" maxWidth="20ch" />
                                <div className="mt-4 space-y-4">
                                    {[1, 2, 3, 4, 5].map((row) => (
                                        <SkeletonBodyText key={row} lines={1} />
                                    ))}
                                </div>
                            </Box>
                        </Card>
                    </Layout.Section>
                </Layout>
            </Page>
        </Frame>
    );
}