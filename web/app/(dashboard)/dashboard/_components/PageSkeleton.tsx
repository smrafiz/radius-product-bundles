import {
    BlockStack,
    Box,
    Card,
    Layout,
    SkeletonBodyText,
    SkeletonDisplayText,
    SkeletonPage,
} from "@shopify/polaris";

export default function PageSkeleton() {
    return (
        <SkeletonPage primaryAction>
            <Layout>
                <Layout.Section>
                    <BlockStack gap="500">
                        <Card>
                            <div className="animate-pulse">
                                <Box padding="400">
                                    <SkeletonBodyText />
                                </Box>
                            </div>
                        </Card>
                        <Card>
                            <div className="animate-pulse">
                                <Box padding="400">
                                    <SkeletonBodyText />
                                </Box>
                            </div>
                        </Card>
                        <Card>
                            <div className="animate-pulse">
                                <Box padding="400">
                                    <SkeletonBodyText />
                                </Box>
                            </div>
                        </Card>
                    </BlockStack>
                </Layout.Section>

                <Layout.Section variant="oneThird">
                    <BlockStack gap="500">
                        <Card>
                            <div className="animate-pulse">
                                <Box padding="400">
                                    <BlockStack gap="200">
                                        <SkeletonDisplayText size="small" />
                                        <SkeletonBodyText lines={2} />
                                    </BlockStack>
                                </Box>
                                <Box padding="400">
                                    <SkeletonBodyText lines={1} />
                                </Box>
                            </div>
                        </Card>

                        <Card>
                            <div className="animate-pulse">
                                <Box padding="400">
                                    <BlockStack gap="200">
                                        <SkeletonDisplayText size="small" />
                                        <SkeletonBodyText lines={2} />
                                    </BlockStack>
                                </Box>
                                <Box padding="400">
                                    <SkeletonBodyText lines={1} />
                                </Box>
                            </div>
                        </Card>
                    </BlockStack>
                </Layout.Section>
            </Layout>
        </SkeletonPage>
    );
}
