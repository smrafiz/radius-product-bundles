'use client';

import React from 'react';
import { BlockStack, Text, Card, Button, InlineStack, Box } from '@shopify/polaris';
import { useBundleStore } from "@/lib/stores/bundleStore";

export default function SelectProductsStep() {
    const { bundleData, updateBundleField } = useBundleStore();

    return (
        <BlockStack gap="400">
            <Text variant="headingMd" as="h2">
                Select Products
            </Text>

            <Text as="p" variant="bodySm" tone="subdued">
                Choose the products to include in your bundle offer.
            </Text>

            <Card background="bg-surface-secondary">
                <BlockStack gap="200">
                    <Text as="p" variant="bodyMd" fontWeight="medium">
                        Products from Slot A
                    </Text>
                    <Text as="p" variant="bodySm" tone="subdued">
                        Select the main products for your bundle
                    </Text>
                    <Button>Add Products</Button>
                </BlockStack>
            </Card>

            <Card background="bg-surface-secondary">
                <BlockStack gap="200">
                    <Text as="p" variant="bodyMd" fontWeight="medium">
                        Products from Slot B
                    </Text>
                    <Text as="p" variant="bodySm" tone="subdued">
                        Select complementary products (optional)
                    </Text>
                    <Button variant="secondary">Add Products</Button>
                </BlockStack>
            </Card>

            {bundleData.products && bundleData.products.length > 0 && (
                <Card>
                    <BlockStack gap="200">
                        <Text as="p" variant="bodyMd" fontWeight="medium">
                            Selected Products
                        </Text>
                        {bundleData.products.map((product: any, index: number) => (
                            <InlineStack key={index} align="space-between">
                                <Text as="p" variant="bodySm">{product.title || `Product ${index + 1}`}</Text>
                                <Text as="p" variant="bodySm" tone="subdued">
                                    ${product.price?.toFixed(2) || '0.00'}
                                </Text>
                            </InlineStack>
                        ))}
                    </BlockStack>
                </Card>
            )}
        </BlockStack>
    );
}