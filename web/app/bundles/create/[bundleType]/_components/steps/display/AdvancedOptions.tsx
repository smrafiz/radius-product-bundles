// web/app/bundles/create/[bundleType]/_components/steps/AdvancedOptions.tsx
"use client";

import React from 'react';
import {
    BlockStack,
    Card,
    Text,
    RadioButton
} from '@shopify/polaris';
import { useBundleStore } from "@/stores";

export default function AdvancedOptions() {
    const { displaySettings, updateDisplaySettings } = useBundleStore();

    return (
        <Card>
            <BlockStack gap="400">
                <Text as="p" variant="headingMd" fontWeight="medium">
                    Advanced Options
                </Text>

                <BlockStack gap="200">
                    <RadioButton
                        label="Show individual product prices"
                        checked={displaySettings.showPrices}
                        id="show-prices"
                        name="pricing"
                        onChange={(checked) => updateDisplaySettings('showPrices', checked)}
                    />
                    <RadioButton
                        label="Show bundle savings amount"
                        checked={displaySettings.showSavings}
                        id="show-savings"
                        name="savings"
                        onChange={(checked) => updateDisplaySettings('showSavings', checked)}
                    />
                    <RadioButton
                        label="Enable quick product swap"
                        checked={displaySettings.enableQuickSwap}
                        id="quick-swap"
                        name="swap"
                        onChange={(checked) => updateDisplaySettings('enableQuickSwap', checked)}
                    />
                </BlockStack>
            </BlockStack>
        </Card>
    );
}