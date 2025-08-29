import {
    Badge,
    BlockStack,
    Box,
    Button,
    Card,
    InlineStack,
    Text,
} from "@shopify/polaris";
import { useDashboardStore } from "@/stores";

export const AIInsights = () => {
    const { bundles } = useDashboardStore();

    if (bundles.length === 0) return null;

    return (
        <Card>
            <Box padding="400">
                <BlockStack gap="400">
                    <InlineStack align="space-between">
                        <Text as="h2" variant="headingMd">
                            🤖 AI Insights
                        </Text>
                        <Badge tone="info">Beta</Badge>
                    </InlineStack>
                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg">
                        <BlockStack gap="200">
                            <Text as="h3" variant="bodyMd" fontWeight="medium">
                                💡 Bundle Performance Analysis
                            </Text>
                            <Text as="p" variant="bodyMd">
                                Based on your current bundles, we&apos;ve
                                identified optimization opportunities. Click
                                &quot;Analyze Bundles&quot; to get personalized
                                recommendations for improving conversion rates.
                            </Text>
                            <InlineStack gap="200">
                                <Button size="slim" variant="primary">
                                    Analyze Bundles
                                </Button>
                                <Button size="slim">Learn More</Button>
                            </InlineStack>
                        </BlockStack>
                    </div>
                </BlockStack>
            </Box>
        </Card>
    );
};
