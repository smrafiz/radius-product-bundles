// web/app/bundles/create/[bundleType]/_components/steps/WidgetAppearance.tsx
"use client";

import React from 'react';
import {
    BlockStack,
    Card,
    Text,
    TextField,
    InlineStack,
    Box
} from '@shopify/polaris';
import { useBundleStore } from "@/stores";

export default function WidgetAppearance() {
    const { displaySettings, updateDisplaySettings } = useBundleStore();

    const colorThemes = [
        { value: 'brand', background: 'bg-fill-brand' },
        { value: 'success', background: 'bg-fill-success' },
        { value: 'warning', background: 'bg-fill-warning' },
        { value: 'critical', background: 'bg-fill-critical' },
    ] as const;

    const handleColorThemeSelect = (theme: typeof colorThemes[0]['value']) => {
        updateDisplaySettings('colorTheme', theme);
    };

    return (
        <Card>
            <BlockStack gap="400">
                <Text as="p" variant="headingMd" fontWeight="medium">
                    Appearance
                </Text>

                <TextField
                    autoComplete="off"
                    label="Widget Title"
                    value={displaySettings.title}
                    onChange={(value) => updateDisplaySettings('title', value)}
                    helpText="Title displayed above the bundle"
                />

                <BlockStack gap="200">
                    <Text as="p" variant="bodyMd" fontWeight="medium">
                        Color Theme
                    </Text>
                    <InlineStack gap="300">
                        {colorThemes.map((theme) => (
                            <Box
                                key={theme.value}
                                background={theme.background}
                                borderRadius="100"
                                minWidth="40px"
                                minHeight="40px"
                                onClick={() => handleColorThemeSelect(theme.value)}
                                style={{
                                    cursor: 'pointer',
                                    border: displaySettings.colorTheme === theme.value
                                        ? '3px solid var(--p-color-border-emphasis)'
                                        : '1px solid transparent'
                                }}
                            />
                        ))}
                    </InlineStack>
                </BlockStack>
            </BlockStack>
        </Card>
    );
}