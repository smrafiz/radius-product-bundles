"use client";

import React from 'react';
import {
    BlockStack,
    Card,
    Text,
    TextField,
    Select
} from '@shopify/polaris';
import { useBundleStore } from "@/stores";
import { useBundleValidation } from "@/hooks/bundle";

export default function DiscountSettings() {
    const { bundleData, updateBundleField } = useBundleStore();
    const { getFieldError } = useBundleValidation();

    const discountTypeOptions = [
        { label: 'Select discount type', value: '', disabled: true },
        { label: 'Percentage', value: 'PERCENTAGE' },
        { label: 'Fixed Amount', value: 'FIXED_AMOUNT' },
        { label: 'Free Shipping', value: 'FREE_SHIPPING' },
    ];

    const getSuffix = () => {
        switch (bundleData.discountType) {
            case 'PERCENTAGE':
                return '%';
            case 'FIXED_AMOUNT':
                return '$';
            default:
                return '';
        }
    };

    return (
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
                    error={getFieldError('discountType')}
                    requiredIndicator
                />

                {bundleData.discountType && bundleData.discountType !== 'FREE_SHIPPING' && (
                    <TextField
                        autoComplete="off"
                        label="Discount Value"
                        type="number"
                        value={bundleData.discountValue?.toString() || ''}
                        onChange={(value) => updateBundleField('discountValue', parseFloat(value) || 0)}
                        suffix={getSuffix()}
                        error={getFieldError('discountValue')}
                        requiredIndicator
                        min={0}
                        max={bundleData.discountType === 'PERCENTAGE' ? 100 : undefined}
                    />
                )}

                <TextField
                    autoComplete="off"
                    label="Minimum Order Value (Optional)"
                    type="number"
                    value={bundleData.minOrderValue?.toString() || ''}
                    onChange={(value) => updateBundleField('minOrderValue', parseFloat(value) || undefined)}
                    prefix="$"
                    helpText="Minimum cart value required to apply this discount"
                    error={getFieldError('minOrderValue')}
                    min={0}
                />

                <TextField
                    autoComplete="off"
                    label="Maximum Discount Amount (Optional)"
                    type="number"
                    value={bundleData.maxDiscountAmount?.toString() || ''}
                    onChange={(value) => updateBundleField('maxDiscountAmount', parseFloat(value) || undefined)}
                    prefix="$"
                    helpText="Cap the maximum discount amount"
                    error={getFieldError('maxDiscountAmount')}
                    min={0}
                />
            </BlockStack>
        </Card>
    );
}