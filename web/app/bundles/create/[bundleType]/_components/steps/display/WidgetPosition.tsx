// web/app/bundles/create/[bundleType]/_components/steps/WidgetPosition.tsx
"use client";

import React from 'react';
import {
    BlockStack,
    Card,
    Text,
    Select
} from '@shopify/polaris';
import { useBundleStore } from "@/stores";

export default function WidgetPosition() {
    const { displaySettings, updateDisplaySettings } = useBundleStore();

    const positionOptions = [
        { label: 'Above Add to Cart', value: 'above_cart' },
        { label: 'Below Add to Cart', value: 'below_cart' },
        { label: 'In Product Description', value: 'description' },
        { label: 'Custom Position', value: 'custom' },
    ];

    return (
        <Card>
            <BlockStack gap="400">
                <Text as="p" variant="headingMd" fontWeight="medium">
                    Widget Position
                </Text>

                <Select
                    label="Display Position"
                    options={positionOptions}
                    value={displaySettings.position}
                    onChange={(value) => updateDisplaySettings('position', value as any)}
                    helpText="Choose where the bundle widget appears on product pages"
                />
            </BlockStack>
        </Card>
    );
}