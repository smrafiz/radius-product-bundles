import React from 'react';
import {
    BlockStack,
    Card,
    Text,
    Select
} from '@shopify/polaris';
import { useBundleStore } from "@/stores";
import { WIDGET_POSITIONS } from "@/lib/constants";

export default function WidgetPosition() {
    const { displaySettings, updateDisplaySettings } = useBundleStore();

    return (
        <Card>
            <BlockStack gap="400">
                <Text as="p" variant="headingMd" fontWeight="medium">
                    Widget Position
                </Text>

                <Select
                    label="Display Position"
                    options={WIDGET_POSITIONS}
                    value={displaySettings.position}
                    onChange={(value) => updateDisplaySettings('position', value as any)}
                    helpText="Choose where the bundle widget appears on product pages"
                />
            </BlockStack>
        </Card>
    );
}