"use client";

import { useBundleStore, WIDGET_LAYOUTS } from "@/features/bundles";
import { BlockStack, Card, RadioButton, Text } from "@shopify/polaris";

export function WidgetLayout() {
    const { displaySettings, updateDisplaySettings } = useBundleStore();

    return (
        <Card>
            <BlockStack gap="400">
                <Text as="p" variant="headingMd" fontWeight="medium">
                    Widget Layout
                </Text>

                <BlockStack gap="300">
                    {WIDGET_LAYOUTS.map(({ label, value, description }) => (
                        <RadioButton
                            key={value}
                            label={label}
                            id={value}
                            name="layout"
                            checked={displaySettings.layout === value}
                            onChange={() =>
                                updateDisplaySettings("layout", value)
                            }
                            helpText={description}
                        />
                    ))}
                </BlockStack>
            </BlockStack>
        </Card>
    );
}
