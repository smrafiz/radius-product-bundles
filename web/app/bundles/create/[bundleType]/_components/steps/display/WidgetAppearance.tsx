import React from "react";
import {
    BlockStack,
    Card,
    Text,
    TextField,
    InlineStack,
    Box,
} from "@shopify/polaris";
import { useBundleStore } from "@/stores";
import { COLOR_THEMES } from "@/lib/constants";

type ColorTheme = typeof COLOR_THEMES[number]['value'];

export default function WidgetAppearance() {
    const { displaySettings, updateDisplaySettings } = useBundleStore();

    const handleColorThemeSelect = (theme: ColorTheme) => {
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
                    onChange={(value) => updateDisplaySettings("title", value)}
                    helpText="Title displayed above the bundle"
                />

                <BlockStack gap="200">
                    <Text as="p" variant="bodyMd" fontWeight="medium">
                        Color Theme
                    </Text>
                    <InlineStack gap="300">
                        {COLOR_THEMES.map((theme) => (
                            <div
                                key={theme.value}
                                onClick={() => handleColorThemeSelect(theme.value)}
                                style={{
                                    cursor: 'pointer',
                                    border: displaySettings.colorTheme === theme.value
                                        ? '3px solid var(--p-color-border-emphasis)'
                                        : '1px solid transparent',
                                    borderRadius: '8px',
                                    padding: '2px'
                                }}
                            >
                                <Box
                                    background={theme.background}
                                    borderRadius="100"
                                    minWidth="40px"
                                    minHeight="40px"
                                />
                            </div>
                        ))}
                    </InlineStack>
                </BlockStack>
            </BlockStack>
        </Card>
    );
}
