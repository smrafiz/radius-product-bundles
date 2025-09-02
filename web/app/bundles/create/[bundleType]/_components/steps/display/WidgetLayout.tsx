import React from "react";
import { BlockStack, Card, RadioButton, Text } from "@shopify/polaris";
import { useBundleStore } from "@/stores";
import { WIDGET_LAYOUTS } from "@/lib/constants";

export default function WidgetLayout() {
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
