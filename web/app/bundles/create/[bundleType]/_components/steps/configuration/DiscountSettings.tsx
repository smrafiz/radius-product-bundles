"use client";

import React from 'react';
import {
    BlockStack,
    Card,
    Text,
    TextField,
    Select
} from '@shopify/polaris';
import { getCurrencySymbol } from "@/utils";
import { useBundleValidation } from "@/hooks";
import { DISCOUNT_TYPES } from "@/lib/constants";
import { useBundleStore, useShopSettingsStore } from "@/stores";

export default function DiscountSettings() {
    const { bundleData, updateBundleField } = useBundleStore();
    const { getFieldError } = useBundleValidation();
    const { currencyCode } = useShopSettingsStore();

    const discountTypeOptions = [
        { label: 'Select discount type', value: '', disabled: true },
        ...DISCOUNT_TYPES
    ];

    const getSuffix = () => {
        switch (bundleData.discountType) {
            case 'PERCENTAGE':
                return '%';
            case 'FIXED_AMOUNT':
            case 'CUSTOM_PRICE':
                return getCurrencySymbol(currencyCode);
            default:
                return '';
        }
    };

    const shouldShowDiscountValue = () => {
        return bundleData.discountType &&
            !['FREE_SHIPPING', 'NO_DISCOUNT'].includes(bundleData.discountType);
    };

    const getDiscountValueLabel = () => {
        switch (bundleData.discountType) {
            case 'PERCENTAGE':
                return 'Discount Percentage';
            case 'FIXED_AMOUNT':
                return 'Discount Amount';
            case 'CUSTOM_PRICE':
                return 'Custom Bundle Price';
            default:
                return 'Discount Value';
        }
    };

    const getDiscountValueHelpText = () => {
        switch (bundleData.discountType) {
            case 'PERCENTAGE':
                return 'Enter percentage off (0-100)';
            case 'FIXED_AMOUNT':
                return 'Enter fixed amount to discount from total';
            case 'CUSTOM_PRICE':
                return 'Set a fixed price for the entire bundle';
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

                {shouldShowDiscountValue() && (
                    <TextField
                        autoComplete="off"
                        label={getDiscountValueLabel()}
                        type="number"
                        value={bundleData.discountValue?.toString() || ''}
                        onChange={(value) => updateBundleField('discountValue', parseFloat(value) || 0)}
                        suffix={getSuffix()}
                        helpText={getDiscountValueHelpText()}
                        error={getFieldError('discountValue')}
                        requiredIndicator
                        min={0}
                        max={bundleData.discountType === 'PERCENTAGE' ? 100 : undefined}
                    />
                )}

                {bundleData.discountType && bundleData.discountType !== 'NO_DISCOUNT' && (
                    <>
                        <TextField
                            autoComplete="off"
                            label="Minimum Order Value (Optional)"
                            type="number"
                            value={bundleData.minOrderValue?.toString() || ''}
                            onChange={(value) => updateBundleField('minOrderValue', parseFloat(value) || undefined)}
                            prefix={getCurrencySymbol(currencyCode)}
                            helpText="Minimum cart value required to apply this discount"
                            error={getFieldError('minOrderValue')}
                            min={0}
                        />

                        {bundleData.discountType !== 'CUSTOM_PRICE' && (
                            <TextField
                                autoComplete="off"
                                label="Maximum Discount Amount (Optional)"
                                type="number"
                                value={bundleData.maxDiscountAmount?.toString() || ''}
                                onChange={(value) => updateBundleField('maxDiscountAmount', parseFloat(value) || undefined)}
                                prefix={getCurrencySymbol(currencyCode)}
                                helpText="Cap the maximum discount amount"
                                error={getFieldError('maxDiscountAmount')}
                                min={0}
                            />
                        )}
                    </>
                )}
            </BlockStack>
        </Card>
    );
}