"use client";

import React from "react";
import { BlockStack, Card, InlineStack, Text } from "@shopify/polaris";
import { useBundleStore } from "@/lib/stores/bundleStore";

export default function ReviewStep() {
    const { bundleData } = useBundleStore();

    return (
        <BlockStack gap="400">
            <Text variant="headingMd" as="h2">
                Review & Publish
            </Text>

            <Text as="p" variant="bodySm" tone="subdued">
                Review your bundle settings and publish when ready.
            </Text>

            <Card>
                <BlockStack gap="200">
                    <Text as="p" variant="bodyMd" fontWeight="medium">
                        Bundle Summary
                    </Text>
                    <InlineStack align="space-between">
                        <Text as="p" variant="bodySm" tone="subdued">
                            Name:
                        </Text>
                        <Text as="p" variant="bodySm">
                            {bundleData.name || "Not set"}
                        </Text>
                    </InlineStack>

                    <InlineStack align="space-between">
                        <Text as="p" variant="bodySm" tone="subdued">
                            Type:
                        </Text>
                        <Text as="p" variant="bodySm">{bundleData.type}</Text>
                    </InlineStack>

                    <InlineStack align="space-between">
                        <Text as="p" variant="bodySm" tone="subdued">
                            Discount:
                        </Text>
                        <Text as="p" variant="bodySm">
                            {bundleData.discountValue || 0}
                            {bundleData.discountType === "PERCENTAGE"
                                ? "%"
                                : "$"}{" "}
                            off
                        </Text>
                    </InlineStack>

                    <InlineStack align="space-between">
                        <Text as="p" variant="bodySm" tone="subdued">
                            Products:
                        </Text>
                        <Text as="p" variant="bodySm">
                            {bundleData.products?.length || 0} selected
                        </Text>
                    </InlineStack>

                    {bundleData.minOrderValue && (
                        <InlineStack align="space-between">
                            <Text as="p" variant="bodySm" tone="subdued">
                                Min Order:
                            </Text>
                            <Text as="p" variant="bodySm">
                                ${bundleData.minOrderValue}
                            </Text>
                        </InlineStack>
                    )}
                </BlockStack>
            </Card>

            {bundleData.description && (
                <Card>
                    <BlockStack gap="200">
                        <Text as="p" variant="bodyMd" fontWeight="medium">
                            Description
                        </Text>
                        <Text as="p" variant="bodySm" tone="subdued">
                            {bundleData.description}
                        </Text>
                    </BlockStack>
                </Card>
            )}
        </BlockStack>
    );
}
