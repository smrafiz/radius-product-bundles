import {
    BlockStack,
    Box,
    Card,
    InlineStack,
    Layout,
    SkeletonBodyText,
    SkeletonDisplayText,
    SkeletonPage,
} from "@shopify/polaris";

export const MetricCardSkeleton = () => (
    <Card>
        <Box padding="400">
            <BlockStack gap="200">
                <SkeletonDisplayText size="small" />
                <SkeletonDisplayText size="large" />
                <InlineStack align="space-between">
                    <SkeletonBodyText lines={1} />
                    <SkeletonBodyText lines={1} />
                </InlineStack>
            </BlockStack>
        </Box>
    </Card>
);

export const BundleListSkeleton = () => (
    <Card>
        <Box padding="400">
            <BlockStack gap="300">
                {[1, 2, 3].map((i) => (
                    <InlineStack key={i} gap="300">
                        <Box>
                            <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse" />
                        </Box>
                        <BlockStack gap="100">
                            <SkeletonDisplayText size="small" />
                            <SkeletonBodyText lines={2} />
                            <div className="w-full h-2 bg-gray-200 rounded animate-pulse" />
                        </BlockStack>
                    </InlineStack>
                ))}
            </BlockStack>
        </Box>
    </Card>
);

// export const DashboardSkeleton = () => (
//     <SkeletonPage primaryAction title="Dashboard">
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//             {[1, 2, 3, 4].map((i) => (
//                 <MetricCardSkeleton key={i} />
//             ))}
//         </div>
//         <BundleListSkeleton />
//         <Card>
//             <Box padding="400">
//                 <SkeletonBodyText lines={3} />
//             </Box>
//         </Card>
//     </SkeletonPage>
// );

export const DashboardSkeleton = () => {
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
};
