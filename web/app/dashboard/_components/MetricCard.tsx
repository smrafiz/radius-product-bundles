"use client";

import {
    BlockStack,
    Box,
    Button,
    Card,
    Icon,
    InlineStack,
    SkeletonDisplayText,
    Text,
} from "@shopify/polaris";
import { MetricCardProps } from "@/types";
import { useRouter } from "next/navigation";
import {
    formatGrowth,
    getGrowthIcon,
    getGrowthTone,
    withLoader,
} from "@/utils";

export const MetricCard = ({
    title,
    value,
    growth,
    action,
    comparisonLabel = "vs last month",
}: MetricCardProps) => {
    const router = useRouter();
    const isLoading = value === undefined || value === null || value === '';

    return (
        <Card>
            <Box padding="400">
                <BlockStack gap="200">
                    <Text as="h3" variant="headingMd" tone="subdued">
                        {title}
                    </Text>

                    {/* Metric Value */}
                    {isLoading ? (
                        <div className="animate-pulse">
                            <SkeletonDisplayText size="large" maxWidth="4ch" />
                        </div>
                    ) : (
                        <Text as="p" variant="heading2xl">
                            {value}
                        </Text>
                    )}

                    {/* Growth Section */}
                    {!isLoading && growth !== undefined && (
                        <InlineStack align="space-between">
                            <InlineStack gap="100" align="center">
                                <Icon
                                    source={getGrowthIcon(growth)}
                                    tone={getGrowthTone(growth)}
                                />
                                <Text
                                    as="span"
                                    variant="bodySm"
                                    tone={getGrowthTone(growth)}
                                >
                                    {formatGrowth(growth)}
                                </Text>
                            </InlineStack>
                            <Text as="span" variant="bodySm" tone="subdued">
                                {comparisonLabel}
                            </Text>
                        </InlineStack>
                    )}

                    {/* Optional Action */}
                    {action && (
                        <Button
                            variant="plain"
                            size="slim"
                            onClick={withLoader(() => router.push(action.url))}
                        >
                            {action.label}
                        </Button>
                    )}
                </BlockStack>
            </Box>
        </Card>
    );
};
