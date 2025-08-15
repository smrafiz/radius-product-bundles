'use client';

import React from 'react';
import { BlockStack, Text, Card, TextField, Select } from '@shopify/polaris';
import { useBundleStore } from "@/lib/stores/bundleStore";

export default function DiscountStep() {
    const { bundleData, updateBundleField } = useBundleStore();

    const discountTypeOptions = [
        { label: 'Percentage', value: 'PERCENTAGE' },
        { label: 'Fixed Amount', value: 'FIXED_AMOUNT' },
        { label: 'Free Shipping', value: 'FREE_SHIPPING' },
    ];

    return (
        <BlockStack gap="400">
            <Text variant="headingMd" as="h2">
                Discount Settings
            </Text>

            <Text as="p" variant="bodySm" tone="subdued">
                Configure the discount type and amount for your bundle.
            </Text>

            <Card>
                <BlockStack gap="400">
                    <Select
                        label="Discount Type"
                        options={discountTypeOptions}
                        value={bundleData.discountType || ''}
                        onChange={(value) => updateBundleField('discountType', value as any)}
                    />

                    <TextField
                        label="Discount Value"
                        type="number"
                        autoComplete="off"
                        value={bundleData.discountValue?.toString() || ''}
                        onChange={(value) => updateBundleField('discountValue', parseInt(value) || 0)}
                        suffix={bundleData.discountType === 'PERCENTAGE' ? '%' : '$'}
                    />

                    <TextField
                        label="Minimum Order Value (Optional)"
                        type="number"
                        autoComplete="off"
                        value={bundleData.minOrderValue?.toString() || ''}
                        onChange={(value) => updateBundleField('minOrderValue', parseInt(value) || 0)}
                        prefix="$"
                    />
                </BlockStack>
            </Card>
        </BlockStack>
    );
}