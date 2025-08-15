'use client';

import React from 'react';
import { BlockStack, Text, Card, TextField, RadioButton } from '@shopify/polaris';
import { useBundleStore } from "@/lib/stores/bundleStore";

export default function WidgetsStep() {
    const { bundleData, updateBundleField } = useBundleStore();

    return (
        <BlockStack gap="400">
            <Text variant="headingMd" as="h2">
                Widget Style & Layout
            </Text>

            <Text as="p" variant="bodySm" tone="subdued">
                Choose how your bundle will appear to customers.
            </Text>

            <Card>
                <BlockStack gap="400">
                    <TextField
                        label="Bundle Name"
                        value={bundleData.name || ''}
                        autoComplete="off"
                        onChange={(value) => updateBundleField('name', value)}
                        placeholder="Enter bundle name"
                    />

                    <TextField
                        label="Description"
                        value={bundleData.description || ''}
                        autoComplete="off"
                        onChange={(value) => updateBundleField('description', value)}
                        multiline={4}
                        placeholder="Describe your bundle offer"
                    />
                </BlockStack>
            </Card>

            <Card>
                <BlockStack gap="400">
                    <Text as="p" variant="bodyMd" fontWeight="medium">
                        Layout Style
                    </Text>

                    <BlockStack gap="200">
                        <RadioButton
                            label="Horizontal Layout"
                            checked={true}
                            id="horizontal"
                            name="layout"
                            onChange={() => {}}
                        />
                        <RadioButton
                            label="Vertical Layout"
                            checked={false}
                            id="vertical"
                            name="layout"
                            onChange={() => {}}
                        />
                        <RadioButton
                            label="Grid Layout"
                            checked={false}
                            id="grid"
                            name="layout"
                            onChange={() => {}}
                        />
                    </BlockStack>
                </BlockStack>
            </Card>
        </BlockStack>
    );
}