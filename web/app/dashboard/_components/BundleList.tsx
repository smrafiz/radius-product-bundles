import {
    Badge,
    BlockStack,
    Box,
    Button,
    Card,
    InlineStack,
    ProgressBar,
    ResourceItem,
    ResourceList,
    Text,
} from "@shopify/polaris";
import React from "react";
import {
    formatBundleType,
    formatCurrency,
    formatPercentage,
} from "@/utils/formatters";
import { withLoader } from "@/utils";
import { router } from "next/client";
import { ViewIcon } from "@shopify/polaris-icons";
import { useDashboardStore } from "@/stores";

export const BundleList = () => {
    const { bundles, error } = useDashboardStore();

    const getBundleStatusBadge = (status: string) => {
        const statusMap: Record<string, { status: string; children: string }> =
            {
                DRAFT: { status: "info", children: "Draft" },
                ACTIVE: { status: "success", children: "Active" },
                PAUSED: { status: "warning", children: "Paused" },
                ARCHIVED: { status: "critical", children: "Archived" },
                SCHEDULED: { status: "info", children: "Scheduled" },
            };
        return statusMap[status] || { status: "info", children: status };
    };

    return (
        <Card>
            <Box padding="400">
                <BlockStack gap="400">
                    <InlineStack
                        blockAlign="center"
                        align="space-between"
                        gap="400"
                    >
                        <BlockStack gap="200">
                            <Text as="h2" variant="headingMd">
                                Top Performing Bundles
                            </Text>
                            <Text as="p" variant="bodyMd" tone="subdued">
                                Check out the top performing bundles across your
                                store.
                            </Text>
                        </BlockStack>
                        <Button
                            icon={ViewIcon}
                            onClick={withLoader(() => router.push("/bundles"))}
                        >
                            View All
                        </Button>
                    </InlineStack>

                    {bundles.length > 0 ? (
                        <ResourceList
                            resourceName={{
                                singular: "bundle",
                                plural: "bundles",
                            }}
                            items={bundles}
                            renderItem={(bundle) => (
                                <ResourceItem
                                    key={bundle.id}
                                    id={bundle.id}
                                    url={`/bundles/${bundle.id}`}
                                    media={
                                        <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center">
                                            <Text
                                                as="span"
                                                variant="headingSm"
                                                tone="text-inverse"
                                            >
                                                {bundle.name
                                                    .charAt(0)
                                                    .toUpperCase()}
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
                                            <Badge
                                                {...getBundleStatusBadge(
                                                    bundle.status,
                                                )}
                                            />
                                        </InlineStack>
                                        <Text
                                            as="span"
                                            variant="bodySm"
                                            tone="subdued"
                                        >
                                            {formatBundleType(bundle.type)} •{" "}
                                            {bundle.productCount} products
                                        </Text>
                                        <InlineStack gap="400">
                                            <Text as="span" variant="bodySm">
                                                <strong>
                                                    {formatPercentage(
                                                        bundle.conversionRate,
                                                    )}
                                                </strong>{" "}
                                                conversion
                                            </Text>
                                            <Text as="span" variant="bodySm">
                                                <strong>
                                                    {formatCurrency(
                                                        bundle.revenue,
                                                    )}
                                                </strong>{" "}
                                                revenue
                                            </Text>
                                        </InlineStack>
                                        <ProgressBar
                                            progress={Math.min(
                                                bundle.conversionRate * 10,
                                                100,
                                            )}
                                            size="small"
                                        />
                                    </BlockStack>
                                </ResourceItem>
                            )}
                        />
                    ) : (
                        <Box padding="400">
                            <BlockStack gap="300" align="center">
                                <Text as="p" variant="bodyMd" tone="subdued">
                                    {error
                                        ? "Unable to load bundles"
                                        : "No bundles created yet"}
                                </Text>
                                <Button variant="primary" url="/bundles/create">
                                    Create Your First Bundle
                                </Button>
                            </BlockStack>
                        </Box>
                    )}
                </BlockStack>
            </Box>
        </Card>
    );
};
