// web/app/bundles/create/[bundleType]/_components/steps/WidgetLayout.tsx
"use client";

import React from 'react';
import {
    BlockStack,
    Card,
    Text,
    RadioButton
} from '@shopify/polaris';
import { useBundleStore } from "@/stores";

export default function WidgetLayout() {
    const { displaySettings, updateDisplaySettings } = useBundleStore();

    return (
        <Card>
            <BlockStack gap="400">
                <Text as="p" variant="headingMd" fontWeight="medium">
                    Widget Layout
                </Text>

                <BlockStack gap="300">
                    <RadioButton
                        label="Horizontal Layout"
                        checked={displaySettings.layout === 'horizontal'}
                        id="horizontal"
                        name="layout"
                        onChange={() => updateDisplaySettings('layout', 'horizontal')}
                        helpText="Products displayed side by side"
                    />
                    <RadioButton
                        label="Vertical Layout"
                        checked={displaySettings.layout === 'vertical'}
                        id="vertical"
                        name="layout"
                        onChange={() => updateDisplaySettings('layout', 'vertical')}
                        helpText="Products stacked vertically"
                    />
                    <RadioButton
                        label="Grid Layout"
                        checked={displaySettings.layout === 'grid'}
                        id="grid"
                        name="layout"
                        onChange={() => updateDisplaySettings('layout', 'grid')}
                        helpText="Products in a responsive grid"
                    />
                </BlockStack>
            </BlockStack>
        </Card>
    );
}