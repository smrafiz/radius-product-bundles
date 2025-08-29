// web/app/bundles/create/[bundleType]/_components/steps/BundleSummary.tsx
"use client";

import React from "react";
import { Card, InlineStack, Text, BlockStack } from "@shopify/polaris";
import { useBundleStore } from "@/stores";

export default function BundleSummary() {
    const { bundleData, getTotalProducts } = useBundleStore();

    const formatDiscountValue = () => {
        if (!bundleData.discountValue) return "0";

        if (bundleData.discountType === 'PERCENTAGE') {
            return `${bundleData.discountValue}%`;
        } else if (bundleData.discountType === 'FIXED_AMOUNT') {
            return `$${bundleData.discountValue}`;
        } else if (bundleData.discountType === 'FREE_SHIPPING') {
            return "Free shipping";
        }

        return `${bundleData.discountValue}`;
    };

    return (
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
                        Discount:
                    </Text>
                    <Text as="p" variant="bodySm">
                        {formatDiscountValue()} off
                    </Text>
                </InlineStack>

                <InlineStack align="space-between">
                    <Text as="p" variant="bodySm" tone="subdued">
                        Products:
                    </Text>
                    <Text as="p" variant="bodySm">
                        {getTotalProducts()} selected
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

                {bundleData.maxDiscountAmount && (
                    <InlineStack align="space-between">
                        <Text as="p" variant="bodySm" tone="subdued">
                            Max Discount:
                        </Text>
                        <Text as="p" variant="bodySm">
                            ${bundleData.maxDiscountAmount}
                        </Text>
                    </InlineStack>
                )}
            </BlockStack>
        </Card>
    );
}