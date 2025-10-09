"use client";

import {
    firstLetterCapital,
    formatCurrency,
    formatPercentage,
    useAppNavigation,
} from "@/shared";
import {
    Badge,
    BlockStack,
    InlineStack,
    ProgressBar,
    ResourceItem,
    ResourceList,
    Text,
} from "@shopify/polaris";
import { formatBundleType } from "@/utils";
import { getBundleStatusBadge } from "@/features/bundles";
import { DashboardBundlesListProps } from "@/features/dashboard";

export function DashboardBundlesList({ bundles }: DashboardBundlesListProps) {
    const { bundleData } = useAppNavigation();

    return (
        <ResourceList
            resourceName={{ singular: "bundle", plural: "bundles" }}
            items={bundles}
            renderItem={(bundle) => (
                <ResourceItem
                    key={bundle.id}
                    id={bundle.id}
                    accessibilityLabel={`View details for ${bundle.name}`}
                    onClick={bundleData.edit(bundle.id)}
                    media={
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center">
                            <Text
                                as="span"
                                variant="headingSm"
                                tone="text-inverse"
                            >
                                {firstLetterCapital(bundle.name)}
                            </Text>
                        </div>
                    }
                >
                    <BlockStack gap="100">
                        <InlineStack align="space-between">
                            <Text
                                as="h3"
                                variant="bodyMd"
                                fontWeight="semibold"
                            >
                                {bundle.name}
                            </Text>
                            <Badge {...getBundleStatusBadge(bundle.status)} />
                        </InlineStack>
                        <Text as="span" variant="bodySm" tone="subdued">
                            {formatBundleType(bundle.type)} •{" "}
                            {bundle.productCount} products
                        </Text>
                        <InlineStack gap="400">
                            <Text as="span" variant="bodySm">
                                <strong>
                                    {formatPercentage(bundle.conversionRate)}
                                </strong>{" "}
                                conversion
                            </Text>
                            <Text as="span" variant="bodySm">
                                <strong>
                                    {formatCurrency(bundle.revenue)}
                                </strong>{" "}
                                revenue
                            </Text>
                        </InlineStack>
                        <ProgressBar
                            progress={Math.min(bundle.conversionRate * 10, 100)}
                            size="small"
                        />
                    </BlockStack>
                </ResourceItem>
            )}
        />
    );
}
