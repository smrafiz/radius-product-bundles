// web/app/bundles/create/[bundleType]/_components/steps/DisplayStep.tsx
'use client';

import React from 'react';
import { BlockStack, Text } from '@shopify/polaris';
import WidgetLayout from './WidgetLayout';
import WidgetPosition from './WidgetPosition';
import WidgetAppearance from './WidgetAppearance';
import AdvancedOptions from './AdvancedOptions';

export default function DisplayStep() {
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

            <WidgetLayout />
            <WidgetPosition />
            <WidgetAppearance />
            <AdvancedOptions />
        </BlockStack>
    );
}