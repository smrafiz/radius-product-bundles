"use client";

import {
    BlockStack,
    Box,
    Button,
    Card,
    Icon,
    InlineStack,
    Text,
} from "@shopify/polaris";
import { MetricCardProps } from "@/types";
import { useRouter } from "next/navigation";
import { formatGrowth, withLoader } from "@/utils";
import { getGrowthIcon, getGrowthTone } from "@/utils";

export const MetricCard = ({
    title,
    value,
    growth,
    action,
    comparisonLabel = "vs last month",
}: MetricCardProps) => {
    const router = useRouter();

    return (
        <Card>
            <Box padding="400">
                <BlockStack gap="200">
                    <Text as="h3" variant="headingMd" tone="subdued">
                        {title}
                    </Text>
                    <Text as="p" variant="heading2xl">
                        {value}
                    </Text>
                    {growth !== undefined && (
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
