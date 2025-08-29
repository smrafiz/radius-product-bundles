// web/app/bundles/create/[bundleType]/_components/preview/BundlePreview.tsx
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
import type { BundleType } from '@/types';
import { useBundleStore } from '@/stores';
import {
    calculateBundlePrice,
    calculateDiscountAmount,
    formatPrice,
    calculateSavingsPercentage
} from '@/utils/';

interface Props {
    bundleType: BundleType;
}

export default function BundlePreview({ bundleType }: Props) {
    const { bundleData, selectedItems, displaySettings } = useBundleStore();

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

    const renderSelectedProducts = () => {
        if (selectedItems.length === 0) {
            // Show placeholder when no products selected
            return Array.from({ length: 3 }, (_, i) => (
                <React.Fragment key={i}>
                    <Box
                        background="bg-surface"
                        padding="300"
                        borderRadius="100"
                        minWidth="80px"
                        minHeight="80px"
                        style={{
                            backgroundImage: 'url(https://via.placeholder.com/80x80/F5F5F5/999?text=Product)',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                        }}
                    />
                    {i < 2 && <Text variant="headingMd" as="span">+</Text>}
                </React.Fragment>
            ));
        }

        // Show actual selected products (limit to first 4 for space)
        return selectedItems.slice(0, 4).map((item, index) => (
            <React.Fragment key={item.id}>
                <BlockStack gap="100" inlineAlign="center">
                    <Box
                        background="bg-surface"
                        padding="200"
                        borderRadius="100"
                        minWidth="80px"
                        minHeight="80px"
                        style={{
                            backgroundImage: item.image
                                ? `url(${item.image})`
                                : 'url(https://via.placeholder.com/80x80/F5F5F5/999?text=Product)',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                        }}
                    />
                    <Text variant="caption" alignment="center" truncate>
                        {item.title.length > 15 ? `${item.title.substring(0, 15)}...` : item.title}
                    </Text>
                    <Text variant="caption" tone="subdued" alignment="center">
                        Qty: {item.quantity} × {formatPrice(parseFloat(item.price))}
                    </Text>
                </BlockStack>
                {index < Math.min(selectedItems.length, 4) - 1 && (
                    <Text variant="headingMd" as="span">+</Text>
                )}
            </React.Fragment>
        ));
    };

    const calculatePreviewPricing = () => {
        if (selectedItems.length === 0 || !bundleData.discountType || !bundleData.discountValue) {
            // Show placeholder values when no products selected or discount configured
            return {
                originalPrice: 300,
                discountAmount: 30,
                finalPrice: 270,
                savingsPercentage: 10
            };
        }

        const originalPrice = calculateBundlePrice(selectedItems);
        const discountAmount = calculateDiscountAmount(
            originalPrice,
            bundleData.discountType,
            bundleData.discountValue,
            bundleData.maxDiscountAmount
        );
        const finalPrice = Math.max(0, originalPrice - discountAmount);
        const savingsPercentage = calculateSavingsPercentage(originalPrice, finalPrice);

        return {
            originalPrice,
            discountAmount,
            finalPrice,
            savingsPercentage
        };
    };

    const { originalPrice, discountAmount, finalPrice, savingsPercentage } = calculatePreviewPricing();

    return (
        <BlockStack gap="400">
            <BlockStack gap="200">
                <Text variant="headingMd" as="h2">
                    Preview
                </Text>
                <InlineStack gap="200" blockAlign="center">
                    <Text as="p" variant="bodySm" tone="subdued">
                        The widget will match your store's look
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
                                {displaySettings.title || bundleData.name || 'Frequently Bought Together'}
                            </Text>

                            {/* Product Images */}
                            <InlineStack gap="200" align="center" wrap={false}>
                                {renderSelectedProducts()}
                            </InlineStack>

                            {/* Product quantity summary for multiple products */}
                            {selectedItems.length > 4 && (
                                <Text variant="caption" tone="subdued" alignment="center">
                                    + {selectedItems.length - 4} more products
                                </Text>
                            )}

                            {/* Product Selection Dropdowns */}
                            {selectedItems.length > 0 && selectedItems.some(item => item.totalVariants && item.totalVariants > 1) && displaySettings.enableQuickSwap && (
                                <InlineStack gap="200">
                                    {selectedItems
                                        .filter(item => item.totalVariants && item.totalVariants > 1)
                                        .slice(0, 2)
                                        .map((item, index) => (
                                            <Select
                                                key={index}
                                                label=""
                                                options={[{
                                                    label: `${item.title.split(' - ')[0]} - Pick variant`,
                                                    value: 'pick'
                                                }]}
                                                value="pick"
                                                onChange={() => {}}
                                            />
                                        ))
                                    }
                                </InlineStack>
                            )}

                            {/* Pricing */}
                            <BlockStack gap="100">
                                {displaySettings.showPrices && (
                                    <InlineStack align="space-between">
                                        <Text variant="bodyMd">Total Price:</Text>
                                        <InlineStack gap="200">
                                            <Text variant="bodyMd" fontWeight="medium">
                                                {formatPrice(finalPrice)}
                                            </Text>
                                            {discountAmount > 0 && (
                                                <Text variant="bodyMd" tone="subdued" textDecorationLine="line-through">
                                                    {formatPrice(originalPrice)}
                                                </Text>
                                            )}
                                        </InlineStack>
                                    </InlineStack>
                                )}

                                {displaySettings.showSavings && discountAmount > 0 && (
                                    <InlineStack align="space-between">
                                        <Text variant="bodyMd" tone="success">
                                            You save:
                                        </Text>
                                        <Text variant="bodyMd" fontWeight="medium" tone="success">
                                            {formatPrice(discountAmount)} ({savingsPercentage}%)
                                        </Text>
                                    </InlineStack>
                                )}
                            </BlockStack>

                            <Button fullWidth variant="primary">
                                Add Bundle to Cart
                            </Button>
                        </BlockStack>
                    </Box>

                    {/* Preview Features */}
                    <BlockStack gap="100">
                        <Text variant="caption" tone="subdued">
                            Features shown in preview:
                        </Text>
                        {displaySettings.enableQuickSwap && (
                            <Text variant="caption" tone="subdued">
                                • Product selection dropdowns
                            </Text>
                        )}
                        {displaySettings.showPrices && (
                            <Text variant="caption" tone="subdued">
                                • Real-time price calculation
                            </Text>
                        )}
                        {displaySettings.showSavings && (
                            <Text variant="caption" tone="subdued">
                                • Savings display
                            </Text>
                        )}
                        <Text variant="caption" tone="subdued">
                            • {displaySettings.layout} layout
                        </Text>
                        <Text variant="caption" tone="subdued">
                            • Position: {displaySettings.position.replace('_', ' ')}
                        </Text>
                    </BlockStack>
                </BlockStack>
            </Card>
        </BlockStack>
    );
}