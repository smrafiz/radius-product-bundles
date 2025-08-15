'use client';

import React from 'react';
import { Card, BlockStack, Text, Button, InlineStack, Box, Badge } from '@shopify/polaris';
import type { CreateBundlePayload, BundleType } from '@/types';

interface Props {
    bundleData: Partial<CreateBundlePayload>;
    bundleType: BundleType;
}

export default function BundlePreview({ bundleData, bundleType }: Props) {
    const getBundleTypeTitle = (type: BundleType): string => {
        const titleMap: Record<BundleType, string> = {
            BUY_X_GET_Y: 'Buy X Get Y',
            BOGO: 'BOGO',
            VOLUME_DISCOUNT: 'Volume Discount',
            MIX_MATCH: 'Mix & Match',
            CROSS_SELL: 'Frequently Bought Together',
            FIXED_BUNDLE: 'Fixed Bundle',
        };
        return titleMap[type] || type;
    };

    return (
        <BlockStack gap="400">
            <Text variant="headingMd" as="h2">
                Preview
            </Text>

            <Card>
                <BlockStack gap="400">
                    <InlineStack align="space-between" blockAlign="center">
                        <Text as="span" variant="bodySm" tone="subdued">
                            👀 Live preview of your bundle
                        </Text>
                        <Badge tone="info">{getBundleTypeTitle(bundleType)}</Badge>
                    </InlineStack>

                    <Box
                        background="bg-surface-secondary"
                        padding="400"
                        borderRadius="200"
                    >
                        <BlockStack gap="300">
                            <Text variant="headingMd" as="h3">
                                {bundleData.name || 'Your Bundle Name'}
                            </Text>

                            {bundleData.description && (
                                <Text as="p" variant="bodySm" tone="subdued">
                                    {bundleData.description}
                                </Text>
                            )}

                            {/* Product Preview */}
                            <InlineStack gap="400" align="center">
                                <Box
                                    background="bg-surface"
                                    padding="400"
                                    borderRadius="100"
                                    minWidth="80px"
                                    minHeight="80px"
                                >
                                    <InlineStack align="center">
                                        <Text as="span" variant="bodySm" tone="subdued">
                                            Product 1
                                        </Text>
                                    </InlineStack>
                                </Box>

                                <Text variant="headingLg" as="span">+</Text>

                                <Box
                                    background="bg-surface"
                                    padding="400"
                                    borderRadius="100"
                                    minWidth="80px"
                                    minHeight="80px"
                                >
                                    <InlineStack align="center">
                                        <Text as="span" variant="bodySm" tone="subdued">
                                            Product 2
                                        </Text>
                                    </InlineStack>
                                </Box>
                            </InlineStack>

                            {/* Pricing */}
                            <BlockStack gap="100">
                                <InlineStack align="space-between">
                                    <Text as="span" variant="bodyMd">Total Price:</Text>
                                    <Text as="span" variant="bodyMd" fontWeight="medium">$180</Text>
                                </InlineStack>

                                {bundleData.discountValue && (
                                    <InlineStack align="space-between">
                                        <Text as="span" variant="bodyMd" tone="critical">
                                            You save ({bundleData.discountValue}
                                            {bundleData.discountType === 'PERCENTAGE' ? '%' : '$'}):
                                        </Text>
                                        <Text as="span" variant="bodyMd" fontWeight="medium" tone="critical">
                                            ${bundleData.discountType === 'PERCENTAGE'
                                            ? (180 * (bundleData.discountValue / 100)).toFixed(2)
                                            : bundleData.discountValue
                                        }
                                        </Text>
                                    </InlineStack>
                                )}
                            </BlockStack>

                            <Button fullWidth variant="primary">
                                Add Bundle to Cart
                            </Button>
                        </BlockStack>
                    </Box>

                    {/* Preview Notes */}
                    <BlockStack gap="100">
                        <Text as="p" tone="subdued">
                            📱 This preview shows how your bundle will appear to customers
                        </Text>
                        <Text as="p" tone="subdued">
                            🎨 The actual styling will match your store&#39;s theme
                        </Text>
                    </BlockStack>
                </BlockStack>
            </Card>
        </BlockStack>
    );
}