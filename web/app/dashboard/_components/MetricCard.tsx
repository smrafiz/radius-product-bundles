"use client";

import { ComponentType } from "react";
import {
    BlockStack,
    Box,
    Button,
    Card,
    Icon,
    InlineStack,
    Text,
} from "@shopify/polaris";
import {
    ArrowDownIcon,
    ArrowRightIcon,
    ArrowUpIcon,
} from "@shopify/polaris-icons";
import { withLoader } from "@/utils";
import { useRouter } from "next/navigation";
import { formatGrowth } from "@/utils";

interface MetricCardProps {
    title: string;
    value: string;
    growth?: number;
    icon?: ComponentType<any>;
    tone?: "success" | "caution" | "subdued";
    action?: { label: string; url: string };
    comparisonLabel?: string;
}

export const MetricCard = ({
    title,
    value,
    growth,
    icon,
    tone,
    action,
    comparisonLabel = "vs last month",
}: MetricCardProps) => {
    const router = useRouter();
    const getGrowthIcon = (value: number) => {
        if (value > 0) return ArrowUpIcon;
        if (value < 0) return ArrowDownIcon;
        return ArrowRightIcon;
    };

    const getGrowthTone = (value: number) => {
        if (value >= 50) return "success";
        if (value >= 10) return "caution";
        return "subdued";
    };

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
