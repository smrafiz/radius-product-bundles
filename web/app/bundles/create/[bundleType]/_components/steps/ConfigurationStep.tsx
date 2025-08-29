'use client';

import React from 'react';
import { useBundleStore } from "@/stores";
import { BlockStack, Text, Card, TextField, Select, RadioButton } from '@shopify/polaris';

export default function ConfigurationStep() {
    const { bundleData, updateBundleField } = useBundleStore();

    const discountTypeOptions = [
        { label: 'Percentage', value: 'PERCENTAGE' },
        { label: 'Fixed Amount', value: 'FIXED_AMOUNT' },
        { label: 'Free Shipping', value: 'FREE_SHIPPING' },
    ];

    return (
        <BlockStack gap="500">
            <BlockStack gap="200">
                <Text variant="headingLg" as="h2">
                    Configuration
                </Text>
                <Text as="p" variant="bodySm" tone="subdued">
                    Set up discount rules and bundle behavior
                </Text>
            </BlockStack>

            {/* Bundle Name */}
            <Card>
                <BlockStack gap="400">
                    <Text as="p" variant="headingMd" fontWeight="medium">
                        Bundle Details
                    </Text>

                    <TextField
                        autoComplete="off"
                        label="Bundle Name"
                        value={bundleData.name || ''}
                        onChange={(value) => updateBundleField('name', value)}
                        placeholder="Enter bundle name"
                    />

                    <TextField
                        autoComplete="off"
                        label="Description (Optional)"
                        value={bundleData.description || ''}
                        onChange={(value) => updateBundleField('description', value)}
                        multiline={3}
                        placeholder="Describe your bundle offer"
                    />
                </BlockStack>
            </Card>

            {/* Discount Settings */}
            <Card>
                <BlockStack gap="400">
                    <Text as="p" variant="headingMd" fontWeight="medium">
                        Discount Settings
                    </Text>

                    <Select
                        label="Discount Type"
                        options={discountTypeOptions}
                        value={bundleData.discountType || ''}
                        onChange={(value) => updateBundleField('discountType', value as any)}
                    />

                    <TextField
                        autoComplete="off"
                        label="Discount Value"
                        type="number"
                        value={bundleData.discountValue?.toString() || ''}
                        onChange={(value) => updateBundleField('discountValue', parseInt(value) || 0)}
                        suffix={bundleData.discountType === 'PERCENTAGE' ? '%' : '$'}
                    />

                    <TextField
                        autoComplete="off"
                        label="Minimum Order Value (Optional)"
                        type="number"
                        value={bundleData.minOrderValue?.toString() || ''}
                        onChange={(value) => updateBundleField('minOrderValue', parseInt(value) || 0)}
                        prefix="$"
                        helpText="Minimum cart value required to apply this discount"
                    />

                    <TextField
                        autoComplete="off"
                        label="Maximum Discount Amount (Optional)"
                        type="number"
                        value={bundleData.maxDiscountAmount?.toString() || ''}
                        onChange={(value) => updateBundleField('maxDiscountAmount', parseInt(value) || 0)}
                        prefix="$"
                        helpText="Cap the maximum discount amount"
                    />
                </BlockStack>
            </Card>

            {/* Bundle Behavior */}
            <Card>
                <BlockStack gap="400">
                    <Text as="p" variant="headingMd" fontWeight="medium">
                        Bundle Behavior
                    </Text>

                    <BlockStack gap="200">
                        <RadioButton
                            label="Apply discount to entire bundle"
                            checked={true}
                            id="bundle-discount"
                            name="discount-application"
                            onChange={() => {}}
                        />
                        <RadioButton
                            label="Apply discount to specific products only"
                            checked={false}
                            id="product-discount"
                            name="discount-application"
                            onChange={() => {}}
                        />
                        <RadioButton
                            label="Free shipping on bundle"
                            checked={false}
                            id="free-shipping"
                            name="discount-application"
                            onChange={() => {}}
                        />
                    </BlockStack>
                </BlockStack>
            </Card>
        </BlockStack>
    );
}