'use client';

import React from 'react';
import {
    BlockStack,
    Text,
    Card,
    RadioButton,
    InlineStack,
    Box,
    TextField,
    Select
} from '@shopify/polaris';
import { useBundleStore } from "@/stores";

export default function DisplayStep() {
    const positionOptions = [
        { label: 'Above Add to Cart', value: 'above_cart' },
        { label: 'Below Add to Cart', value: 'below_cart' },
        { label: 'In Product Description', value: 'description' },
        { label: 'Custom Position', value: 'custom' },
    ];

    return (
        <BlockStack gap="500">
            <BlockStack gap="200">
                <Text variant="headingLg" as="h2">
                    Display
                </Text>
                <Text as="p" variant="bodySm" tone="subdued">
                    Customize how your bundle appears to customers
                </Text>
            </BlockStack>

            {/* Widget Layout */}
            <Card>
                <BlockStack gap="400">
                    <Text as="p" variant="headingMd" fontWeight="medium">
                        Widget Layout
                    </Text>

                    <BlockStack gap="300">
                        <RadioButton
                            label="Horizontal Layout"
                            checked={true}
                            id="horizontal"
                            name="layout"
                            onChange={() => {}}
                            helpText="Products displayed side by side"
                        />
                        <RadioButton
                            label="Vertical Layout"
                            checked={false}
                            id="vertical"
                            name="layout"
                            onChange={() => {}}
                            helpText="Products stacked vertically"
                        />
                        <RadioButton
                            label="Grid Layout"
                            checked={false}
                            id="grid"
                            name="layout"
                            onChange={() => {}}
                            helpText="Products in a responsive grid"
                        />
                    </BlockStack>
                </BlockStack>
            </Card>

            {/* Widget Position */}
            <Card>
                <BlockStack gap="400">
                    <Text as="p" variant="headingMd" fontWeight="medium">
                        Widget Position
                    </Text>

                    <Select
                        label="Display Position"
                        options={positionOptions}
                        value="above_cart"
                        onChange={() => {}}
                        helpText="Choose where the bundle widget appears on product pages"
                    />
                </BlockStack>
            </Card>

            {/* Color Theme */}
            <Card>
                <BlockStack gap="400">
                    <Text as="p" variant="headingMd" fontWeight="medium">
                        Appearance
                    </Text>

                    <TextField
                        autoComplete="off"
                        label="Widget Title"
                        value="Frequently Bought Together"
                        onChange={() => {}}
                        helpText="Title displayed above the bundle"
                    />

                    <BlockStack gap="200">
                        <Text as="p" variant="bodyMd" fontWeight="medium">
                            Color Theme
                        </Text>
                        <InlineStack gap="300">
                            <Box
                                background="bg-fill-brand"
                                borderRadius="100"
                                minWidth="40px"
                                minHeight="40px"
                            />
                            <Box
                                background="bg-fill-success"
                                borderRadius="100"
                                minWidth="40px"
                                minHeight="40px"
                            />
                            <Box
                                background="bg-fill-warning"
                                borderRadius="100"
                                minWidth="40px"
                                minHeight="40px"
                            />
                            <Box
                                background="bg-fill-critical"
                                borderRadius="100"
                                minWidth="40px"
                                minHeight="40px"
                            />
                        </InlineStack>
                    </BlockStack>
                </BlockStack>
            </Card>

            {/* Advanced Options */}
            <Card>
                <BlockStack gap="400">
                    <Text as="p" variant="headingMd" fontWeight="medium">
                        Advanced Options
                    </Text>

                    <BlockStack gap="200">
                        <RadioButton
                            label="Show individual product prices"
                            checked={true}
                            id="show-prices"
                            name="pricing"
                            onChange={() => {}}
                        />
                        <RadioButton
                            label="Show bundle savings amount"
                            checked={true}
                            id="show-savings"
                            name="savings"
                            onChange={() => {}}
                        />
                        <RadioButton
                            label="Enable quick product swap"
                            checked={false}
                            id="quick-swap"
                            name="swap"
                            onChange={() => {}}
                        />
                    </BlockStack>
                </BlockStack>
            </Card>
        </BlockStack>
    );
}