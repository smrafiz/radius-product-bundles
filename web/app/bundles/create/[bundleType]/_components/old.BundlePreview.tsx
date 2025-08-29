'use client';

import React from 'react';
import {
    Card,
    BlockStack,
    Text,
    Button,
    InlineStack,
    Box,
    Badge,
    Select
} from '@shopify/polaris';
import type { CreateBundlePayload, BundleType } from '@/types';

interface Props {
    bundleData: Partial<CreateBundlePayload>;
    bundleType: BundleType;
}

export default function OldBundlePreview({ bundleData, bundleType }: Props) {
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
            <BlockStack gap="200">
                <Text variant="headingMd" as="h2">
                    Preview
                </Text>
                <InlineStack gap="200" blockAlign="center">
                    <Text as="p" variant="bodySm" tone="subdued">
                        👀 The widget will match your store&#39;s look
                    </Text>
                    <Badge tone="info">{getBundleTypeTitle(bundleType)}</Badge>
                </InlineStack>
            </BlockStack>

            <Card>
                <BlockStack gap="400">
                    <Box
                        background="bg-surface-secondary"
                        padding="400"
                        borderRadius="200"
                    >
                        <BlockStack gap="400">
                            <Text variant="headingMd" as="h3">
                                {bundleData.name || 'Frequently Bought Together'}
                            </Text>

                            {/* Product Images */}
                            <InlineStack gap="200" align="center">
                                <Box
                                    background="bg-surface"
                                    padding="300"
                                    borderRadius="100"
                                    minWidth="100px"
                                    minHeight="100px"
                                    style={{
                                        backgroundImage: 'url(https://via.placeholder.com/100x100/F5F5F5/999?text=Product)',
                                        backgroundSize: 'cover'
                                    }}
                                />

                                <Text variant="headingMd" as="span">+</Text>

                                <Box
                                    background="bg-surface"
                                    padding="300"
                                    borderRadius="100"
                                    minWidth="100px"
                                    minHeight="100px"
                                    style={{
                                        backgroundImage: 'url(https://via.placeholder.com/100x100/F5F5F5/999?text=Product)',
                                        backgroundSize: 'cover'
                                    }}
                                />

                                <Text variant="headingMd" as="span">+</Text>

                                <Box
                                    background="bg-surface"
                                    padding="300"
                                    borderRadius="100"
                                    minWidth="100px"
                                    minHeight="100px"
                                    style={{
                                        backgroundImage: 'url(https://via.placeholder.com/100x100/F5F5F5/999?text=Product)',
                                        backgroundSize: 'cover'
                                    }}
                                />
                            </InlineStack>

                            {/* Product Selection Dropdowns */}
                            <InlineStack gap="200">
                                <Select
                                    label=""
                                    options={[{ label: 'Pick another', value: 'pick' }]}
                                    value="pick"
                                    onChange={() => {}}
                                />
                                <Select
                                    label=""
                                    options={[{ label: 'Pick another', value: 'pick' }]}
                                    value="pick"
                                    onChange={() => {}}
                                />
                            </InlineStack>

                            {/* Pricing */}
                            <BlockStack gap="100">
                                <InlineStack align="space-between">
                                    <Text variant="bodyMd">Total Price:</Text>
                                    <InlineStack gap="200">
                                        <Text variant="bodyMd" fontWeight="medium">BDT 270</Text>
                                        <Text variant="bodyMd" tone="subdued" textDecorationLine="line-through">
                                            BDT 300
                                        </Text>
                                    </InlineStack>
                                </InlineStack>

                                <InlineStack align="space-between">
                                    <Text variant="bodyMd" tone="success">
                                        You save:
                                    </Text>
                                    <Text variant="bodyMd" fontWeight="medium" tone="success">
                                        BDT 30
                                    </Text>
                                </InlineStack>
                            </BlockStack>

                            <Button fullWidth variant="primary">
                                Add to Cart
                            </Button>
                        </BlockStack>
                    </Box>

                    {/* Preview Features */}
                    <BlockStack gap="100">
                        <Text variant="caption" tone="subdued">
                            ✨ Features shown in preview:
                        </Text>
                        <Text variant="caption" tone="subdued">
                            • Product selection dropdowns
                        </Text>
                        <Text variant="caption" tone="subdued">
                            • Real-time price calculation
                        </Text>
                        <Text variant="caption" tone="subdued">
                            • Savings display
                        </Text>
                    </BlockStack>
                </BlockStack>
            </Card>
        </BlockStack>
    );
}